import blossom from 'edmonds-blossom'

const REMOTE_API_BASE = (import.meta.env.VITE_API_URL || '').trim()
const USE_REMOTE_API = Boolean(REMOTE_API_BASE)
const LOCAL_DB_KEY = 'hku_local_api_db_v1'
const LEGACY_USERS_KEY = 'hkusrs'
const MAX_STORED_ROUNDS = 20
const GRADE_ORDER = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
}

const isBrowser = typeof window !== 'undefined'

const remoteFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${REMOTE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return response.json()
}

const sanitizeUser = (user) => {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

const syncLegacyUsers = (users) => {
  if (!isBrowser) return
  localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(users))
}

const readLocalDb = () => {
  if (!isBrowser) {
    return { users: [], codes: {}, matches: { rounds: [], lastMatchTime: null } }
  }

  const saved = localStorage.getItem(LOCAL_DB_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const db = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        codes: parsed.codes && typeof parsed.codes === 'object' ? parsed.codes : {},
        matches: parsed.matches && typeof parsed.matches === 'object'
          ? {
              rounds: Array.isArray(parsed.matches.rounds) ? parsed.matches.rounds : [],
              lastMatchTime: parsed.matches.lastMatchTime || null,
            }
          : { rounds: [], lastMatchTime: null },
      }
      syncLegacyUsers(db.users)
      return db
    } catch {
      // ignore corrupted local db and rebuild from legacy users
    }
  }

  const legacyUsers = JSON.parse(localStorage.getItem(LEGACY_USERS_KEY) || '[]')
  const db = {
    users: Array.isArray(legacyUsers) ? legacyUsers : [],
    codes: {},
    matches: { rounds: [], lastMatchTime: null },
  }
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db))
  syncLegacyUsers(db.users)
  return db
}

const writeLocalDb = (db) => {
  if (!isBrowser) return db
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db))
  syncLegacyUsers(db.users)
  return db
}

const normalizeList = (value) => Array.isArray(value) ? value.filter(Boolean) : []
const getGradeRank = (grade) => GRADE_ORDER[String(grade)] ?? null

const isGenderCompatible = (survey1, survey2) => (
  (survey1.preferGender === 'any' || survey1.preferGender === survey2.gender) &&
  (survey2.preferGender === 'any' || survey2.preferGender === survey1.gender)
)

const isGradePreferenceSatisfied = (preferGrade, selfGrade, candidateGrade) => {
  const preferences = normalizeList(preferGrade)
  if (!preferences.length) return true

  const selfRank = getGradeRank(selfGrade)
  const candidateRank = getGradeRank(candidateGrade)
  if (selfRank === null || candidateRank === null) return true

  return preferences.some((rule) => {
    if (rule === 'same') return candidateRank === selfRank
    if (rule === 'older') return candidateRank > selfRank
    if (rule === 'younger') return candidateRank < selfRank
    return false
  })
}

const getInterestStats = (interests1, interests2) => {
  const list1 = normalizeList(interests1)
  const list2 = normalizeList(interests2)
  if (!list1.length || !list2.length) {
    return { commonCount: 0, unionCount: Math.max(list1.length, list2.length, 1) }
  }

  const set2 = new Set(list2)
  const commonCount = list1.filter((item) => set2.has(item)).length
  const unionCount = new Set([...list1, ...list2]).size || 1
  return { commonCount, unionCount }
}

const getPersonalityScore = (personality1, personality2) => {
  if (!personality1 || !personality2) return 0
  const samePositionCount = [...personality1].filter((char, index) => char === personality2[index]).length
  return samePositionCount * 4
}

const getGradeClosenessScore = (grade1, grade2) => {
  const rank1 = getGradeRank(grade1)
  const rank2 = getGradeRank(grade2)
  if (rank1 === null || rank2 === null) return 0
  const diff = Math.abs(rank1 - rank2)
  return Math.max(0, 10 - diff * 2)
}

const buildScoreBreakdown = (survey1, survey2) => {
  const { commonCount, unionCount } = getInterestStats(survey1.interests, survey2.interests)
  const interestScore = Math.round((commonCount / unionCount) * 32)
  const personalityScore = getPersonalityScore(survey1.personality, survey2.personality)
  const majorScore = survey1.major && survey1.major === survey2.major ? 12 : 0
  const gradeScore = getGradeClosenessScore(survey1.grade, survey2.grade)
  const mutualPreferenceBonus =
    (survey1.preferGender && survey1.preferGender !== 'any' ? 3 : 0) +
    (survey2.preferGender && survey2.preferGender !== 'any' ? 3 : 0) +
    (normalizeList(survey1.preferGrade).length ? 2 : 0) +
    (normalizeList(survey2.preferGrade).length ? 2 : 0)

  const totalScore = 25 + interestScore + personalityScore + majorScore + gradeScore + mutualPreferenceBonus

  return {
    totalScore,
    commonInterestCount: commonCount,
    interestScore,
    personalityScore,
    majorScore,
    gradeScore,
    mutualPreferenceBonus,
  }
}

const isPairEligible = (user1, user2) => {
  if (!user1?.surveyCompleted || !user2?.surveyCompleted) return false
  if (!user1?.survey || !user2?.survey) return false
  if (user1.id === user2.id) return false

  const survey1 = user1.survey
  const survey2 = user2.survey

  if (!isGenderCompatible(survey1, survey2)) return false
  if (!isGradePreferenceSatisfied(survey1.preferGrade, survey1.grade, survey2.grade)) return false
  if (!isGradePreferenceSatisfied(survey2.preferGrade, survey2.grade, survey1.grade)) return false

  return true
}

const runMatchingAlgorithm = (users) => {
  const completedUsers = users.filter((user) => user.surveyCompleted && user.survey)
  if (completedUsers.length < 2) {
    return { matches: [], unmatchedUserIds: completedUsers.map((user) => user.id), candidatePairs: 0 }
  }

  const weightedEdges = []
  const edgeDetails = new Map()

  for (let i = 0; i < completedUsers.length; i += 1) {
    for (let j = i + 1; j < completedUsers.length; j += 1) {
      const user1 = completedUsers[i]
      const user2 = completedUsers[j]
      if (!isPairEligible(user1, user2)) continue

      const breakdown = buildScoreBreakdown(user1.survey, user2.survey)
      const weight = Math.max(1, Math.round(breakdown.totalScore))
      weightedEdges.push([i, j, weight])
      edgeDetails.set(`${i}:${j}`, breakdown)
    }
  }

  if (!weightedEdges.length) {
    return {
      matches: [],
      unmatchedUserIds: completedUsers.map((user) => user.id),
      candidatePairs: 0,
    }
  }

  const pairIndexes = blossom(weightedEdges)
  const matches = []
  const matchedUserIds = new Set()

  pairIndexes.forEach((partnerIndex, index) => {
    if (partnerIndex === -1 || partnerIndex <= index) return

    const user1 = completedUsers[index]
    const user2 = completedUsers[partnerIndex]
    const edgeKey = `${Math.min(index, partnerIndex)}:${Math.max(index, partnerIndex)}`
    const breakdown = edgeDetails.get(edgeKey)
    if (!breakdown) return

    matchedUserIds.add(user1.id)
    matchedUserIds.add(user2.id)

    matches.push({
      user1Id: user1.id,
      user2Id: user2.id,
      user1Email: user1.email,
      user2Email: user2.email,
      user1Survey: user1.survey,
      user2Survey: user2.survey,
      score: breakdown.totalScore,
      scoreBreakdown: breakdown,
    })
  })

  return {
    matches,
    unmatchedUserIds: completedUsers.filter((user) => !matchedUserIds.has(user.id)).map((user) => user.id),
    candidatePairs: weightedEdges.length,
  }
}

const executeMatchingRound = (db, trigger = 'manual') => {
  const completedUsers = db.users.filter((user) => user.surveyCompleted && user.survey)
  const result = runMatchingAlgorithm(db.users)
  const timestamp = new Date().toISOString()
  const roundId = `${Date.now()}`

  const newRound = {
    roundId,
    timestamp,
    trigger,
    pairs: result.matches,
    stats: {
      totalUsers: completedUsers.length,
      candidatePairs: result.candidatePairs,
      matchedPairs: result.matches.length,
      matchedUsers: result.matches.length * 2,
      unmatchedUsers: result.unmatchedUserIds.length,
      algorithm: 'edmonds-blossom-max-weight',
    },
  }

  db.matches.rounds.unshift(newRound)
  db.matches.rounds = db.matches.rounds.slice(0, MAX_STORED_ROUNDS)
  db.matches.lastMatchTime = timestamp

  const matchedUserIds = new Set()
  result.matches.forEach((pair) => {
    matchedUserIds.add(pair.user1Id)
    matchedUserIds.add(pair.user2Id)
  })

  db.users = db.users.map((user) => ({
    ...user,
    isMatched: matchedUserIds.has(user.id),
    currentMatchId: matchedUserIds.has(user.id) ? roundId : null,
  }))

  writeLocalDb(db)
  return { roundId, timestamp, result, newRound }
}

const generateId = (prefix = 'user') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const createSeedDataset = () => {
  const avatars = ['🦊', '🐯', '🦋', '🦁', '🐱', '🐼', '🦄', '🐨', '🐸', '🐰', '🐻', '🦅', '🐷', '🦉', '🐮', '🐙', '🐹', '🐊']
  const majors = [
    '金融学', '计算机科学', '市场学', '工商管理', '心理学', '数据科学', '经济学', '工程学',
    '法学', '建筑学', '新闻学', '医学', '会计学', '商业分析', '社会学', '传媒与媒体',
    '物理学', '化学', '数学', '生物医学', '机械工程', '环境科学', '材料科学', '海洋科学',
    '电子工程', '教育学', '人工智能', '哲学', '统计学', '公共卫生', '信息安全', '艺术设计',
    '机器人学', '语言学', '供应链管理', '国际关系', '航空航天', '人力资源', '物联网工程', '考古学',
    'MBA', '酒店管理', '风险投资', '广告学', '区块链工程', '房地产', '云计算', '时装设计',
    '量子计算', '博物馆学', '神经科学', '城市规划', '生物统计', '环境工程', '数字媒体', '可持续发展'
  ]
  const personalities = ['INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'INTJ', 'INTP', 'ENTJ', 'ENTP', 'ISFP', 'ISTP', 'ESFP', 'ESTP']
  const interests = [
    ['📚 阅读', '🎵 音乐', '✈️ 旅行'],
    ['💻 编程', '🎮 游戏', '🎵 音乐'],
    ['🎬 影视', '📷 摄影', '☕ 咖啡'],
    ['⚽ 足球', '🏀 篮球', '🎵 音乐'],
    ['📚 阅读', '🧘 瑜伽', '🐱 撸猫'],
    ['💻 编程', '📚 阅读', '🎵 音乐'],
    ['📚 阅读', '✈️ 旅行', '🍜 美食'],
    ['🏃 运动', '🎮 游戏', '🎤 KTV'],
    ['📚 阅读', '🎬 影视', '🍳 烹饪'],
    ['🎨 绘画', '📷 摄影', '✈️ 旅行'],
    ['📊 数据', '💻 编程', '📚 阅读'],
    ['🤝 社交', '☕ 咖啡', '🍜 美食'],
  ]
  const preferenceTexts = [
    '希望认识有趣的人', '喜欢技术型的人', '喜欢拍照和喝咖啡', '爱运动，阳光型',
    '喜欢安静文艺的人', '数据爱好者', '喜欢探索美食和旅行', '爱运动，爱唱歌',
    '理性成熟', '喜欢设计感强的人', '想找同频交流对象', '期待长期稳定相处'
  ]

  return Array.from({ length: 56 }, (_, index) => {
    const userIndex = index + 1
    return {
      id: `seed-${userIndex}`,
      email: `user${userIndex}@connect.hku.hk`,
      password: 'test123',
      surveyCompleted: true,
      survey: {
        avatar: avatars[index % avatars.length],
        gender: index % 2 === 0 ? 'female' : 'male',
        grade: String((index % 6) + 1),
        major: majors[index % majors.length],
        interests: interests[index % interests.length],
        personality: personalities[index % personalities.length],
        preferGender: 'any',
        preferGrade: [],
        preferAgeMin: '18',
        preferAgeMax: '28',
        preferTraits: [],
        preference: preferenceTexts[index % preferenceTexts.length],
      },
      createdAt: new Date(Date.now() - userIndex * 60000).toISOString(),
      surveyUpdatedAt: new Date(Date.now() - userIndex * 60000).toISOString(),
      isMatched: false,
      currentMatchId: null,
    }
  })
}

const localApi = {
  async fetch() {
    return { success: false, error: 'Local mode does not use raw fetch' }
  },

  async sendCode(email) {
    if (!email || !email.endsWith('@connect.hku.hk')) {
      return { error: 'Only @connect.hku.hk emails allowed' }
    }
    const db = readLocalDb()
    const code = '123456'
    db.codes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }
    writeLocalDb(db)
    return { success: true, code }
  },

  async verifyCode(email, code) {
    const db = readLocalDb()
    const stored = db.codes[email]
    if (!stored) return { error: 'No code found' }
    if (Date.now() > stored.expires) return { error: 'Code expired' }
    if (stored.code !== code) return { error: 'Invalid code' }
    delete db.codes[email]
    writeLocalDb(db)
    return { success: true }
  },

  async register(email, password) {
    if (!email?.endsWith('@connect.hku.hk')) return { error: 'Invalid email' }
    if (!password || password.length < 6) return { error: 'Password too short' }

    const db = readLocalDb()
    if (db.users.find((user) => user.email === email)) return { error: 'Email exists' }

    const newUser = {
      id: generateId(),
      email,
      password,
      surveyCompleted: false,
      survey: null,
      createdAt: new Date().toISOString(),
      surveyUpdatedAt: null,
      isMatched: false,
      currentMatchId: null,
    }

    db.users.push(newUser)
    writeLocalDb(db)
    return { success: true, userId: newUser.id }
  },

  async login(email, password) {
    const db = readLocalDb()
    const user = db.users.find((item) => item.email === email && item.password === password)
    if (!user) return { error: 'Invalid credentials' }
    return { success: true, user: sanitizeUser(user) }
  },

  async updateSurvey(userId, survey) {
    const db = readLocalDb()
    const index = db.users.findIndex((user) => user.id === userId)
    if (index === -1) return { error: 'User not found' }

    db.users[index] = {
      ...db.users[index],
      survey,
      surveyCompleted: true,
      surveyUpdatedAt: new Date().toISOString(),
      isMatched: false,
      currentMatchId: null,
    }
    writeLocalDb(db)

    const completedUsers = db.users.filter((user) => user.surveyCompleted && user.survey)
    if (completedUsers.length >= 2) {
      const execution = executeMatchingRound(db, 'survey-submit')
      return {
        success: true,
        autoMatched: true,
        roundId: execution.roundId,
        matchedCount: execution.result.matches.length,
        unmatchedCount: execution.result.unmatchedUserIds.length,
        candidatePairs: execution.result.candidatePairs,
      }
    }

    return { success: true, autoMatched: false, message: '问卷已保存，等待更多用户参与' }
  },

  async getUsers() {
    const db = readLocalDb()
    return { success: true, users: db.users.map(sanitizeUser) }
  },

  async getUser(userId) {
    const db = readLocalDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user) return { error: 'User not found' }
    return { success: true, user: sanitizeUser(user) }
  },

  async deleteUser(userId) {
    const db = readLocalDb()
    const index = db.users.findIndex((user) => user.id === userId)
    if (index === -1) return { error: 'User not found' }
    db.users.splice(index, 1)
    writeLocalDb(db)
    return { success: true }
  },

  async updateUser(userId, data) {
    const db = readLocalDb()
    const index = db.users.findIndex((user) => user.id === userId)
    if (index === -1) return { error: 'User not found' }

    db.users[index] = {
      ...db.users[index],
      ...data,
      id: userId,
      surveyCompleted: data.survey ? true : db.users[index].surveyCompleted,
      surveyUpdatedAt: data.survey ? new Date().toISOString() : db.users[index].surveyUpdatedAt,
      isMatched: false,
      currentMatchId: null,
    }
    writeLocalDb(db)

    const completedUsers = db.users.filter((user) => user.surveyCompleted && user.survey)
    if (data.survey && completedUsers.length >= 2) {
      executeMatchingRound(db, 'profile-update')
    }

    return { success: true }
  },

  async getMyMatch(userId) {
    const db = readLocalDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user) return { error: 'User not found' }

    if (user.surveyCompleted && !db.matches.rounds.length) {
      const completedUsers = db.users.filter((item) => item.surveyCompleted && item.survey)
      if (completedUsers.length >= 2) {
        executeMatchingRound(db, 'lazy-first-view')
      }
    }

    const latestDb = readLocalDb()
    const latestUser = latestDb.users.find((item) => item.id === userId)
    if (!latestUser?.isMatched || !latestUser.currentMatchId) {
      return { success: true, isMatched: false, message: '暂未匹配到合适的对象', waitForNextRound: true }
    }

    const currentRound = latestDb.matches.rounds.find((round) => round.roundId === latestUser.currentMatchId)
    if (!currentRound) return { success: true, isMatched: false, message: '配对已过期' }

    const pair = currentRound.pairs.find((item) => item.user1Id === userId || item.user2Id === userId)
    if (!pair) return { success: true, isMatched: false, message: '配对已过期' }

    const isUser1 = pair.user1Id === userId
    return {
      success: true,
      isMatched: true,
      roundId: currentRound.roundId,
      matchScore: pair.score,
      theirInfo: isUser1 ? pair.user2Survey : pair.user1Survey,
      theirEmail: isUser1 ? pair.user2Email : pair.user1Email,
      message: '恭喜匹配成功！',
    }
  },

  async runMatch() {
    const db = readLocalDb()
    const completedUsers = db.users.filter((user) => user.surveyCompleted && user.survey)
    if (completedUsers.length < 2) {
      return { success: true, matchedCount: 0, unmatchedCount: completedUsers.length, message: '用户不足' }
    }
    const execution = executeMatchingRound(db, 'manual-run')
    return {
      success: true,
      roundId: execution.roundId,
      matchedCount: execution.result.matches.length,
      unmatchedCount: execution.result.unmatchedUserIds.length,
      candidatePairs: execution.result.candidatePairs,
      algorithm: execution.newRound.stats.algorithm,
    }
  },

  async getMatchStats() {
    const db = readLocalDb()
    const completedUsers = db.users.filter((user) => user.surveyCompleted)
    const latestRound = db.matches.rounds[0]
    return {
      success: true,
      totalUsers: db.users.length,
      completedSurveyUsers: completedUsers.length,
      lastMatchTime: db.matches.lastMatchTime,
      latestRoundStats: latestRound?.stats || null,
      totalRounds: db.matches.rounds.length,
    }
  },

  async getMatchHistory(userId) {
    return localApi.getMatches(userId)
  },

  async getMatches(userId) {
    const db = readLocalDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user) return { error: 'User not found' }

    const matches = db.matches.rounds.flatMap((round) => {
      const pair = round.pairs.find((item) => item.user1Id === userId || item.user2Id === userId)
      if (!pair) return []
      const isUser1 = pair.user1Id === userId
      return [{
        roundId: round.roundId,
        timestamp: round.timestamp,
        matchScore: pair.score,
        matchSurvey: isUser1 ? pair.user2Survey : pair.user1Survey,
        matchEmail: isUser1 ? pair.user2Email : pair.user1Email,
        scoreBreakdown: pair.scoreBreakdown || null,
      }]
    })

    return { success: true, matches }
  },

  async seedTestUsers() {
    const db = readLocalDb()
    const seedUsers = createSeedDataset()
    let created = 0

    seedUsers.forEach((seedUser) => {
      if (db.users.find((user) => user.email === seedUser.email)) return
      db.users.push({ ...seedUser })
      created += 1
    })

    writeLocalDb(db)
    return { success: true, message: `Created ${created} test users`, totalUsers: db.users.length }
  },
}

const remoteApi = {
  fetch: remoteFetch,
  sendCode: (email) => remoteFetch('/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyCode: (email, code) => remoteFetch('/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) }),
  register: (email, password) => remoteFetch('/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => remoteFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  updateSurvey: (userId, survey) => remoteFetch('/survey', { method: 'POST', body: JSON.stringify({ userId, survey }) }),
  getUsers: () => remoteFetch('/users'),
  getUser: (userId) => remoteFetch(`/user/${userId}`),
  deleteUser: (userId) => remoteFetch(`/user/${userId}`, { method: 'DELETE' }),
  updateUser: (userId, data) => remoteFetch(`/user/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMyMatch: (userId) => remoteFetch(`/my-match/${userId}`),
  runMatch: () => remoteFetch('/run-match', { method: 'POST' }),
  getMatchStats: () => remoteFetch('/match-stats'),
  getMatchHistory: (userId) => remoteFetch(`/match-history/${userId}`),
  getMatches: (userId) => remoteFetch(`/matches/${userId}`),
  seedTestUsers: () => remoteFetch('/seed-test-users', { method: 'POST' }),
}

export const api = USE_REMOTE_API ? remoteApi : localApi
