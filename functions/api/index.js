import blossom from 'edmonds-blossom'

/**
 * HKU Date Backend - Cloudflare Pages Functions
 * Matching Algorithm: Global optimum mutual one-to-one matching via Blossom
 */

const USERS_KV = env => env?.USERS_KV
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

const getUsers = async (env) => {
  if (!USERS_KV(env)) return { users: [] }
  try {
    const data = await USERS_KV(env).get('users', 'json')
    return data || { users: [] }
  } catch { return { users: [] } }
}

const saveUsers = async (env, data) => {
  if (!USERS_KV(env)) return
  await USERS_KV(env).put('users', JSON.stringify(data))
}

const getCodes = async (env) => {
  if (!USERS_KV(env)) return {}
  try {
    const data = await USERS_KV(env).get('codes', 'json')
    return data || {}
  } catch { return {} }
}

const saveCodes = async (env, data) => {
  if (!USERS_KV(env)) return
  await USERS_KV(env).put('codes', JSON.stringify(data))
}

const getMatches = async (env) => {
  if (!USERS_KV(env)) return { rounds: [], lastMatchTime: null }
  try {
    const data = await USERS_KV(env).get('matches', 'json')
    return data || { rounds: [], lastMatchTime: null }
  } catch { return { rounds: [], lastMatchTime: null } }
}

const saveMatches = async (env, data) => {
  if (!USERS_KV(env)) return
  await USERS_KV(env).put('matches', JSON.stringify(data))
}

const normalizeList = value => Array.isArray(value) ? value.filter(Boolean) : []
const getGradeRank = grade => GRADE_ORDER[String(grade)] ?? null

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

  return preferences.some(rule => {
    if (rule === 'same') return candidateRank === selfRank
    if (rule === 'older') return candidateRank > selfRank
    if (rule === 'younger') return candidateRank < selfRank
    return false
  })
}

const getInterestStats = (interests1, interests2) => {
  const list1 = normalizeList(interests1)
  const list2 = normalizeList(interests2)
  if (!list1.length || !list2.length) return { commonCount: 0, unionCount: Math.max(list1.length, list2.length, 1) }

  const set2 = new Set(list2)
  const commonCount = list1.filter(item => set2.has(item)).length
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

// 计算匹配分数（满分约 0-100）
const calculateMatchScore = (user1, user2) => buildScoreBreakdown(user1.survey, user2.survey)

// 配对算法：使用最大权匹配实现全局最优双射
const runMatchingAlgorithm = (users) => {
  const completedUsers = users.filter(u => u.surveyCompleted && u.survey)
  if (completedUsers.length < 2) {
    return { matches: [], unmatchedUserIds: completedUsers.map(u => u.id), candidatePairs: 0 }
  }

  const weightedEdges = []
  const edgeDetails = new Map()

  for (let i = 0; i < completedUsers.length; i++) {
    for (let j = i + 1; j < completedUsers.length; j++) {
      const user1 = completedUsers[i]
      const user2 = completedUsers[j]

      if (!isPairEligible(user1, user2)) continue

      const breakdown = calculateMatchScore(user1, user2)
      const weight = Math.max(1, Math.round(breakdown.totalScore))
      weightedEdges.push([i, j, weight])
      edgeDetails.set(`${i}:${j}`, breakdown)
    }
  }

  if (!weightedEdges.length) {
    return {
      matches: [],
      unmatchedUserIds: completedUsers.map(u => u.id),
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
    unmatchedUserIds: completedUsers.filter(user => !matchedUserIds.has(user.id)).map(user => user.id),
    candidatePairs: weightedEdges.length,
  }
}

const executeMatchingRound = async (env, db, trigger = 'manual') => {
  const completedUsers = db.users.filter(u => u.surveyCompleted && u.survey)
  const result = runMatchingAlgorithm(db.users)
  const timestamp = new Date().toISOString()
  const roundId = Date.now().toString()

  const matchData = await getMatches(env)
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

  matchData.rounds.unshift(newRound)
  matchData.rounds = matchData.rounds.slice(0, MAX_STORED_ROUNDS)
  matchData.lastMatchTime = timestamp
  await saveMatches(env, matchData)

  const matchedUserIds = new Set()
  for (const pair of result.matches) {
    matchedUserIds.add(pair.user1Id)
    matchedUserIds.add(pair.user2Id)
  }

  for (const user of db.users) {
    const isMatched = matchedUserIds.has(user.id)
    user.currentMatchId = isMatched ? roundId : null
    user.isMatched = isMatched
  }

  await saveUsers(env, db)

  return { roundId, timestamp, result, newRound }
}

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
})

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/').filter(p => p)
  const routeParts = pathParts[0] === 'api' ? pathParts.slice(1) : pathParts

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  try {
    const endpoint = routeParts[0]
    const param1 = routeParts[1]

    // ==================== 简单端点（无参数）====================

    // Health check
    if (endpoint === 'health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    }

    // 获取配对统计
    if (endpoint === 'match-stats' && request.method === 'GET') {
      const db = await getUsers(env)
      const matchData = await getMatches(env)
      const completedUsers = db.users.filter(u => u.surveyCompleted)
      const latestRound = matchData.rounds[0]
      return jsonResponse({
        success: true,
        totalUsers: db.users.length,
        completedSurveyUsers: completedUsers.length,
        lastMatchTime: matchData.lastMatchTime,
        latestRoundStats: latestRound?.stats || null,
        totalRounds: matchData.rounds.length
      })
    }

    // 运行配对算法
    if (endpoint === 'run-match' && request.method === 'POST') {
      const db = await getUsers(env)
      const completedUsers = db.users.filter(u => u.surveyCompleted && u.survey)

      if (completedUsers.length < 2) {
        return jsonResponse({ success: true, matchedCount: 0, unmatchedCount: completedUsers.length, message: '用户不足' })
      }

      const execution = await executeMatchingRound(env, db, 'manual-run')

      console.log(`[MATCH] ${execution.result.matches.length} pairs matched, ${execution.result.unmatchedUserIds.length} unmatched`)
      return jsonResponse({
        success: true,
        roundId: execution.roundId,
        matchedCount: execution.result.matches.length,
        unmatchedCount: execution.result.unmatchedUserIds.length,
        candidatePairs: execution.result.candidatePairs,
        algorithm: execution.newRound.stats.algorithm,
      })
    }

    // 种子测试用户
    if (endpoint === 'seed-test-users' && request.method === 'POST') {
      const testData = [
        { avatar: '🦊', gender: 'female', grade: '3', major: '金融学', interests: ['📚 阅读', '🎵 音乐', '✈️ 旅行'], personality: 'ENFP', preferGender: 'any', preference: '希望认识有趣的人' },
        { avatar: '🐯', gender: 'male', grade: '5', major: '计算机科学', interests: ['💻 编程', '🎮 游戏', '🎵 音乐'], personality: 'INTJ', preferGender: 'any', preference: '喜欢技术型的人' },
        { avatar: '🦋', gender: 'female', grade: '2', major: '市场学', interests: ['🎬 影视', '📷 摄影', '☕ 咖啡'], personality: 'ESFJ', preferGender: 'any', preference: '喜欢拍照和喝咖啡' },
        { avatar: '🦁', gender: 'male', grade: '4', major: '工商管理', interests: ['⚽ 足球', '🏀 篮球', '🎵 音乐'], personality: 'ENTJ', preferGender: 'any', preference: '爱运动，阳光型' },
        { avatar: '🐱', gender: 'female', grade: '1', major: '心理学', interests: ['📚 阅读', '🧘 瑜伽', '🐱 撸猫'], personality: 'INFP', preferGender: 'any', preference: '喜欢安静文艺的人' },
        { avatar: '🐼', gender: 'male', grade: '6', major: '数据科学', interests: ['💻 编程', '📚 阅读', '🎵 音乐'], personality: 'INTP', preferGender: 'any', preference: '数据爱好者' },
        { avatar: '🦄', gender: 'female', grade: '3', major: '经济学', interests: ['📚 阅读', '✈️ 旅行', '🍜 美食'], personality: 'ENFJ', preferGender: 'any', preference: '喜欢探索美食和旅行' },
        { avatar: '🐨', gender: 'male', grade: '2', major: '工程学', interests: ['🏃 运动', '🎮 游戏', '🎤 KTV'], personality: 'ESTP', preferGender: 'any', preference: '爱运动，爱唱歌' },
        { avatar: '🐸', gender: 'female', grade: '5', major: '法学', interests: ['📚 阅读', '🎬 影视', '🍳 烹饪'], personality: 'INFJ', preferGender: 'any', preference: '理性成熟' },
        { avatar: '🐰', gender: 'male', grade: '4', major: '建筑学', interests: ['🎨 绘画', '📷 摄影', '✈️ 旅行'], personality: 'ENTP', preferGender: 'any', preference: '喜欢设计' },
        { avatar: '🐻', gender: 'female', grade: '1', major: '新闻学', interests: ['📚 阅读', '🎬 影视', '📷 摄影'], personality: 'ENFP', preferGender: 'any', preference: '喜欢写作和拍照' },
        { avatar: '🦅', gender: 'male', grade: '3', major: '医学', interests: ['📚 阅读', '🏃 运动', '🍳 烹饪'], personality: 'ISFJ', preferGender: 'any', preference: '想找个善良的人' },
        { avatar: '🐷', gender: 'female', grade: '2', major: '会计学', interests: ['📚 阅读', '☕ 咖啡', '💻 编程'], personality: 'ISTJ', preferGender: 'any', preference: '喜欢安静学习' },
        { avatar: '🦉', gender: 'male', grade: '5', major: '商业分析', interests: ['💻 编程', '📚 阅读', '⚽ 足球'], personality: 'ENTJ', preferGender: 'any', preference: '喜欢分析数据' },
        { avatar: '🐮', gender: 'female', grade: '4', major: '社会学', interests: ['📚 阅读', '🎬 影视', '✈️ 旅行'], personality: 'INFP', preferGender: 'any', preference: '喜欢研究社会现象' },
        { avatar: '🐙', gender: 'male', grade: '6', major: '法学', interests: ['📚 阅读', '🏃 运动', '🎤 KTV'], personality: 'ESTJ', preferGender: 'any', preference: '喜欢辩论' },
        { avatar: '🦁', gender: 'female', grade: '1', major: '心理学', interests: ['🧘 瑜伽', '📚 阅读', '🐱 撸猫'], personality: 'ISFP', preferGender: 'any', preference: '喜欢心灵成长' },
        { avatar: '🐸', gender: 'male', grade: '3', major: '金融学', interests: ['⚽ 足球', '📚 阅读', '☕ 咖啡'], personality: 'ESFJ', preferGender: 'any', preference: '喜欢社交' },
        { avatar: '🐼', gender: 'female', grade: '2', major: '市场学', interests: ['🎬 影视', '📷 摄影', '☕ 咖啡'], personality: 'ENFP', preferGender: 'any', preference: '喜欢创意工作' },
        { avatar: '🐯', gender: 'male', grade: '4', major: '计算机科学', interests: ['💻 编程', '🎮 游戏', '🎵 音乐'], personality: 'INTP', preferGender: 'any', preference: '喜欢技术挑战' },
        { avatar: '🦊', gender: 'male', grade: '1', major: '物理学', interests: ['🔬 实验', '📚 阅读', '🎵 音乐'], personality: 'INTJ', preferGender: 'any', preference: '热爱科学' },
        { avatar: '🐹', gender: 'female', grade: '6', major: '化学', interests: ['🧪 实验', '📚 阅读', '✈️ 旅行'], personality: 'INFP', preferGender: 'any', preference: '喜欢探索微观世界' },
        { avatar: '🦄', gender: 'male', grade: '2', major: '数学', interests: ['📐 数学', '💻 编程', '🎵 音乐'], personality: 'ENFP', preferGender: 'any', preference: '沉迷数字之美' },
        { avatar: '🐲', gender: 'female', grade: '5', major: '生物医学', interests: ['🧬 生物', '📚 阅读', '🏃 运动'], personality: 'ISTJ', preferGender: 'any', preference: '热爱生命科学' },
        { avatar: '🦅', gender: 'male', grade: '3', major: '机械工程', interests: ['⚙️ 机械', '💻 编程', '🎮 游戏'], personality: 'ESTP', preferGender: 'any', preference: '喜欢动手制作' },
        { avatar: '🐻', gender: 'female', grade: '4', major: '环境科学', interests: ['🌿 自然', '📷 摄影', '🏃 运动'], personality: 'ENFJ', preferGender: 'any', preference: '关心地球未来' },
        { avatar: '🦋', gender: 'male', grade: '1', major: '材料科学', interests: ['🔬 实验', '📚 阅读', '🎨 绘画'], personality: 'INFP', preferGender: 'any', preference: '喜欢研究新材料' },
        { avatar: '🐊', gender: 'female', grade: '6', major: '海洋科学', interests: ['🌊 海洋', '🤿 潜水', '📷 摄影'], personality: 'ESFJ', preferGender: 'any', preference: '热爱海洋' },
        { avatar: '🦁', gender: 'male', grade: '2', major: '电子工程', interests: ['🔌 电子', '💻 编程', '🎤 KTV'], personality: 'ENTJ', preferGender: 'any', preference: '电子爱好者' },
        { avatar: '🐰', gender: 'female', grade: '5', major: '教育学', interests: ['📚 阅读', '🎬 影视', '🧘 瑜伽'], personality: 'INFJ', preferGender: 'any', preference: '想当老师' },
        { avatar: '🦊', gender: 'male', grade: '4', major: '人工智能', interests: ['💻 编程', '📚 阅读', '🎵 音乐'], personality: 'INTP', preferGender: 'any', preference: 'AI研究者' },
        { avatar: '🐸', gender: 'female', grade: '1', major: '哲学', interests: ['📚 阅读', '🎬 影视', '☕ 咖啡'], personality: 'ENFP', preferGender: 'any', preference: '爱思考人生' },
        { avatar: '🦉', gender: 'male', grade: '3', major: '统计学', interests: ['📊 数据', '💻 编程', '📚 阅读'], personality: 'ISTJ', preferGender: 'any', preference: '数据驱动' },
        { avatar: '🐮', gender: 'female', grade: '6', major: '公共卫生', interests: ['🏥 医学', '📚 阅读', '🏃 运动'], personality: 'ISFJ', preferGender: 'any', preference: '关心公众健康' },
        { avatar: '🐙', gender: 'male', grade: '2', major: '信息安全', interests: ['💻 编程', '🔐 安全', '🎮 游戏'], personality: 'ENTJ', preferGender: 'any', preference: '黑客精神' },
        { avatar: '🦄', gender: 'female', grade: '4', major: '艺术设计', interests: ['🎨 绘画', '📷 摄影', '✈️ 旅行'], personality: 'INFP', preferGender: 'any', preference: '追求创意' },
        { avatar: '🐼', gender: 'male', grade: '5', major: '机器人学', interests: ['🤖 机器人', '💻 编程', '⚙️ 机械'], personality: 'INTJ', preferGender: 'any', preference: '科技狂人' },
        { avatar: '🐱', gender: 'female', grade: '1', major: '语言学', interests: ['🗣️ 语言', '📚 阅读', '🎬 影视'], personality: 'ENFP', preferGender: 'any', preference: '语言爱好者' },
        { avatar: '🦁', gender: 'male', grade: '3', major: '供应链管理', interests: ['📦 物流', '📚 阅读', '⚽ 足球'], personality: 'ESTJ', preferGender: 'any', preference: '效率至上' },
        { avatar: '🐹', gender: 'female', grade: '6', major: '国际关系', interests: ['🌐 国际', '📚 阅读', '✈️ 旅行'], personality: 'ENFJ', preferGender: 'any', preference: '关注全球事务' },
        { avatar: '🦅', gender: 'male', grade: '2', major: '航空航天', interests: ['🚀 航天', '📚 阅读', '🎮 游戏'], personality: 'ENTP', preferGender: 'any', preference: '梦想星辰大海' },
        { avatar: '🐻', gender: 'female', grade: '4', major: '人力资源', interests: ['👥 管理', '📚 阅读', '☕ 咖啡'], personality: 'ESFJ', preferGender: 'any', preference: '善于沟通' },
        { avatar: '🦋', gender: 'male', grade: '5', major: '物联网工程', interests: ['📱 物联网', '💻 编程', '🎵 音乐'], personality: 'INTP', preferGender: 'any', preference: '连接一切' },
        { avatar: '🐊', gender: 'female', grade: '1', major: '考古学', interests: ['🏺 历史', '📚 阅读', '📷 摄影'], personality: 'INFP', preferGender: 'any', preference: '追寻历史' },
        { avatar: '🦁', gender: 'male', grade: '6', major: 'MBA', interests: ['📈 商业', '🤝 社交', '⚽ 足球'], personality: 'ENTJ', preferGender: 'any', preference: '商业精英' },
        { avatar: '🐰', gender: 'female', grade: '3', major: '酒店管理', interests: ['🏨 旅游', '🍜 美食', '☕ 咖啡'], personality: 'ESFJ', preferGender: 'any', preference: '服务行业' },
        { avatar: '🦊', gender: 'male', grade: '4', major: '风险投资', interests: ['💰 金融', '📚 阅读', '🤝 社交'], personality: 'ENTP', preferGender: 'any', preference: '寻找独角兽' },
        { avatar: '🐸', gender: 'female', grade: '2', major: '广告学', interests: ['🎨 设计', '📷 摄影', '🎬 影视'], personality: 'ENFP', preferGender: 'any', preference: '创意无限' },
        { avatar: '🦉', gender: 'male', grade: '5', major: '区块链工程', interests: ['⛓️ 区块链', '💻 编程', '📚 阅读'], personality: 'INTJ', preferGender: 'any', preference: 'Web3爱好者' },
        { avatar: '🐮', gender: 'female', grade: '1', major: '社会学', interests: ['👥 社会', '📚 阅读', '🏃 运动'], personality: 'INFJ', preferGender: 'any', preference: '社会观察者' },
        { avatar: '🐙', gender: 'male', grade: '4', major: '游戏设计', interests: ['🎮 游戏', '🎨 绘画', '💻 编程'], personality: 'INFP', preferGender: 'any', preference: '游戏制作人' },
        { avatar: '🦄', gender: 'female', grade: '6', major: '房地产', interests: ['🏠 房产', '📚 阅读', '🤝 社交'], personality: 'ESTJ', preferGender: 'any', preference: '地产达人' },
        { avatar: '🐼', gender: 'male', grade: '2', major: '云计算', interests: ['☁️ 云服务', '💻 编程', '📚 阅读'], personality: 'ENTJ', preferGender: 'any', preference: '云架构师' },
        { avatar: '🐱', gender: 'female', grade: '5', major: '时装设计', interests: ['👗 时装', '🎨 绘画', '📷 摄影'], personality: 'ESFP', preferGender: 'any', preference: '时尚先锋' },
        { avatar: '🦁', gender: 'male', grade: '3', major: '量子计算', interests: ['⚛️ 量子', '📚 阅读', '💻 编程'], personality: 'INTP', preferGender: 'any', preference: '未来科技' },
        { avatar: '🐹', gender: 'female', grade: '4', major: '博物馆学', interests: ['🏛️ 博物馆', '📚 阅读', '📷 摄影'], personality: 'INFP', preferGender: 'any', preference: '文化遗产守护者' },
      ]

      const db = await getUsers(env)
      let created = 0

      for (let i = 0; i < testData.length; i++) {
        const t = testData[i]
        const email = `user${i + 1}@connect.hku.hk`
        if (db.users.find(u => u.email === email)) continue

        db.users.push({
          id: Date.now().toString() + '_' + i,
          email,
          password: 'test123',
          surveyCompleted: true,
          survey: {
            avatar: t.avatar,
            gender: t.gender,
            grade: t.grade,
            major: t.major,
            interests: t.interests,
            personality: t.personality,
            preferGender: t.preferGender,
            preferGrade: [],
            preferAgeMin: '18',
            preferAgeMax: '25',
            preferTraits: [],
            preference: t.preference
          },
          createdAt: new Date().toISOString(),
          surveyUpdatedAt: new Date().toISOString(),
          isMatched: false,
          currentMatchId: null
        })
        created++
      }

      await saveUsers(env, db)
      return jsonResponse({ success: true, message: `Created ${created} test users`, totalUsers: db.users.length })
    }

    // ==================== 单参数端点 ====================

    // 获取当前用户匹配
    if (endpoint === 'my-match' && param1) {
      const userId = param1
      let db = await getUsers(env)
      let user = db.users.find(u => u.id === userId)
      if (!user) return jsonResponse({ error: 'User not found' }, 404)

      let matchData = await getMatches(env)

      // 首次查看且系统尚未生成任何配对轮次时，自动执行一次匹配
      if (user.surveyCompleted && !matchData.rounds.length) {
        const completedUsers = db.users.filter(u => u.surveyCompleted && u.survey)
        if (completedUsers.length >= 2) {
          await executeMatchingRound(env, db, 'lazy-first-view')
          db = await getUsers(env)
          user = db.users.find(u => u.id === userId)
          matchData = await getMatches(env)
        }
      }

      if (!user.isMatched || !user.currentMatchId) {
        return jsonResponse({ success: true, isMatched: false, message: '暂未匹配到合适的对象', waitForNextRound: true })
      }

      const currentRound = matchData.rounds.find(r => r.roundId === user.currentMatchId)
      if (!currentRound) return jsonResponse({ success: true, isMatched: false, message: '配对已过期' })

      const pair = currentRound.pairs.find(p => p.user1Id === userId || p.user2Id === userId)
      if (!pair) return jsonResponse({ success: true, isMatched: false, message: '配对已过期' })

      const isUser1 = pair.user1Id === userId
      return jsonResponse({
        success: true,
        isMatched: true,
        roundId: currentRound.roundId,
        matchScore: pair.score,
        theirInfo: isUser1 ? pair.user2Survey : pair.user1Survey,
        theirEmail: isUser1 ? pair.user2Email : pair.user1Email,
        message: '恭喜匹配成功！'
      })
    }

    // 获取用户列表
    if (endpoint === 'users' && request.method === 'GET') {
      const db = await getUsers(env)
      return jsonResponse({ success: true, users: db.users.map(({ password, ...u }) => u) })
    }

    // 发送验证码
    if (endpoint === 'send-code' && request.method === 'POST') {
      const { email } = await request.json()
      if (!email?.endsWith('@connect.hku.hk')) {
        return jsonResponse({ error: 'Only @connect.hku.hk emails allowed' }, 400)
      }
      const code = '123456'
      const codes = await getCodes(env)
      codes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }
      await saveCodes(env, codes)
      return jsonResponse({ success: true, code })
    }

    // 验证验证码
    if (endpoint === 'verify-code' && request.method === 'POST') {
      const { email, code } = await request.json()
      const codes = await getCodes(env)
      const stored = codes[email]
      if (!stored) return jsonResponse({ error: 'No code found' }, 400)
      if (Date.now() > stored.expires) return jsonResponse({ error: 'Code expired' }, 400)
      if (stored.code !== code) return jsonResponse({ error: 'Invalid code' }, 400)
      delete codes[email]
      await saveCodes(env, codes)
      return jsonResponse({ success: true })
    }

    // 注册
    if (endpoint === 'register' && request.method === 'POST') {
      const { email, password } = await request.json()
      if (!email?.endsWith('@connect.hku.hk')) return jsonResponse({ error: 'Invalid email' }, 400)
      if (!password || password.length < 6) return jsonResponse({ error: 'Password too short' }, 400)

      const db = await getUsers(env)
      if (db.users.find(u => u.email === email)) return jsonResponse({ error: 'Email exists' }, 400)

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        surveyCompleted: false,
        survey: null,
        createdAt: new Date().toISOString(),
        surveyUpdatedAt: null,
        isMatched: false,
        currentMatchId: null
      }
      db.users.push(newUser)
      await saveUsers(env, db)
      return jsonResponse({ success: true, userId: newUser.id })
    }

    // 登录
    if (endpoint === 'login' && request.method === 'POST') {
      const { email, password } = await request.json()
      const db = await getUsers(env)
      const user = db.users.find(u => u.email === email && u.password === password)
      if (!user) return jsonResponse({ error: 'Invalid credentials' }, 401)
      const { password: _, ...userWithoutPassword } = user
      return jsonResponse({ success: true, user: userWithoutPassword })
    }

    // 提交问卷
    if (endpoint === 'survey' && request.method === 'POST') {
      const { userId, survey } = await request.json()
      const db = await getUsers(env)
      const idx = db.users.findIndex(u => u.id === userId)
      if (idx === -1) return jsonResponse({ error: 'User not found' }, 404)

      const now = new Date().toISOString()
      db.users[idx].survey = survey
      db.users[idx].surveyCompleted = true
      db.users[idx].surveyUpdatedAt = now
      db.users[idx].isMatched = false
      db.users[idx].currentMatchId = null

      const completedUsers = db.users.filter(u => u.surveyCompleted && u.survey)
      if (completedUsers.length >= 2) {
        const execution = await executeMatchingRound(env, db, 'survey-submit')
        return jsonResponse({
          success: true,
          autoMatched: true,
          roundId: execution.roundId,
          matchedCount: execution.result.matches.length,
          unmatchedCount: execution.result.unmatchedUserIds.length,
          candidatePairs: execution.result.candidatePairs,
        })
      }

      await saveUsers(env, db)
      return jsonResponse({ success: true, autoMatched: false, message: '问卷已保存，等待更多用户参与' })
    }

    // ==================== 双参数端点 ====================

    // /matches/:userId
    if (endpoint === 'matches' && param1 && request.method === 'GET') {
      const userId = param1
      const db = await getUsers(env)
      const user = db.users.find(u => u.id === userId)
      if (!user) return jsonResponse({ error: 'User not found' }, 404)

      const matchData = await getMatches(env)
      const userMatches = []

      for (const round of matchData.rounds) {
        const pair = round.pairs.find(p => p.user1Id === userId || p.user2Id === userId)
        if (pair && round.roundId === user.currentMatchId) {
          const isUser1 = pair.user1Id === userId
          userMatches.push({
            roundId: round.roundId,
            timestamp: round.timestamp,
            matchScore: pair.score,
            matchSurvey: isUser1 ? pair.user2Survey : pair.user1Survey,
            matchEmail: isUser1 ? pair.user2Email : pair.user1Email,
            scoreBreakdown: pair.scoreBreakdown || null,
          })
        }
      }

      return jsonResponse({ success: true, matches: userMatches })
    }

    // /user/:userId
    if (endpoint === 'user' && param1) {
      const userId = param1
      const db = await getUsers(env)
      const user = db.users.find(u => u.id === userId)
      if (!user) return jsonResponse({ error: 'User not found' }, 404)

      if (request.method === 'GET') {
        const { password, ...userWithoutPassword } = user
        return jsonResponse({ success: true, user: userWithoutPassword })
      }

      if (request.method === 'PUT') {
        const updates = await request.json()
        const idx = db.users.findIndex(u => u.id === userId)
        if (idx === -1) return jsonResponse({ error: 'User not found' }, 404)
        db.users[idx] = { ...db.users[idx], ...updates, id: userId }
        await saveUsers(env, db)
        return jsonResponse({ success: true })
      }

      if (request.method === 'DELETE') {
        const idx = db.users.findIndex(u => u.id === userId)
        if (idx === -1) return jsonResponse({ error: 'User not found' }, 404)
        db.users.splice(idx, 1)
        await saveUsers(env, db)
        return jsonResponse({ success: true })
      }
    }

    return jsonResponse({ error: 'Not found' }, 404)

  } catch (error) {
    console.error('API Error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
