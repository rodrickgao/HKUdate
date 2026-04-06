/**
 * HKU Date Backend - Cloudflare Pages Functions
 * Matching Algorithm: Mutual One-to-One, 60% threshold
 */

const USERS_KV = env => env?.USERS_KV

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

// 计算匹配分数（满分100）
const calculateMatchScore = (user1, user2) => {
  let score = 0
  const survey1 = user1.survey
  const survey2 = user2.survey
  
  // 性别匹配 (25分)
  const genderMatch = (
    (survey1.preferGender === 'any' || survey1.preferGender === survey2.gender) &&
    (survey2.preferGender === 'any' || survey2.preferGender === survey1.gender)
  )
  if (genderMatch) score += 25
  
  // 人格类型 (15分)
  if (survey1.personality && survey2.personality) score += 15
  
  // 专业相同 (15分)
  if (survey1.major === survey2.major && survey1.major) score += 15
  
  // 年级相同 (10分)
  if (survey1.grade === survey2.grade) score += 10
  
  // 共同兴趣 (35分封顶)
  if (survey1.interests && survey2.interests && survey1.interests.length > 0) {
    const common = survey1.interests.filter(i => survey2.interests.includes(i))
    score += Math.min(common.length * 7, 35)
  }
  
  return score
}

// 配对算法：双射最优匹配（贪心 + 互选检测）
const runMatchingAlgorithm = (users) => {
  const completedUsers = users.filter(u => u.surveyCompleted)
  const MATCH_THRESHOLD = 60
  
  // Step 1: 计算所有满足性别偏好的候选配对及分数
  const validPairs = []
  
  for (let i = 0; i < completedUsers.length; i++) {
    for (let j = i + 1; j < completedUsers.length; j++) {
      const user1 = completedUsers[i]
      const user2 = completedUsers[j]
      const s1 = user1.survey
      const s2 = user2.survey
      
      // 性别偏好必须互为满足
      const u1Ok = s1.preferGender === 'any' || s1.preferGender === s2.gender
      const u2Ok = s2.preferGender === 'any' || s2.preferGender === s1.gender
      if (!u1Ok || !u2Ok) continue
      
      const score = calculateMatchScore(user1, user2)
      if (score >= MATCH_THRESHOLD) {
        validPairs.push({ user1, user2, score })
      }
    }
  }
  
  // Step 2: 按分数降序排列，优先匹配高分对
  validPairs.sort((a, b) => b.score - a.score)
  
  // Step 3: 贪心选择，每人被匹配最多一次
  const matchedUserIds = new Set()
  const matches = []
  
  for (const pair of validPairs) {
    if (matchedUserIds.has(pair.user1.id) || matchedUserIds.has(pair.user2.id)) continue
    
    matchedUserIds.add(pair.user1.id)
    matchedUserIds.add(pair.user2.id)
    
    matches.push({
      user1Id: pair.user1.id,
      user2Id: pair.user2.id,
      user1Email: pair.user1.email,
      user2Email: pair.user2.email,
      user1Survey: pair.user1.survey,
      user2Survey: pair.user2.survey,
      score: pair.score
    })
  }
  
  return { matches, unmatchedUserIds: [...matchedUserIds] }
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
      const completedUsers = db.users.filter(u => u.surveyCompleted)
      
      if (completedUsers.length < 2) {
        return jsonResponse({ success: true, matchedCount: 0, unmatchedCount: completedUsers.length, message: '用户不足' })
      }
      
      const result = runMatchingAlgorithm(db.users)
      
      const matchData = await getMatches(env)
      const newRound = {
        roundId: Date.now().toString(),
        timestamp: new Date().toISOString(),
        pairs: result.matches,
        stats: {
          totalUsers: completedUsers.length,
          matchedPairs: result.matches.length,
          matchedUsers: result.matches.length * 2,
          unmatchedUsers: completedUsers.length - result.matches.length * 2
        }
      }
      matchData.rounds.unshift(newRound)
      matchData.lastMatchTime = new Date().toISOString()
      await saveMatches(env, matchData)
      
      const matchedUserIds = new Set()
      for (const pair of result.matches) {
        matchedUserIds.add(pair.user1Id)
        matchedUserIds.add(pair.user2Id)
      }
      
      for (const user of db.users) {
        user.currentMatchId = matchedUserIds.has(user.id) ? newRound.roundId : null
        user.isMatched = matchedUserIds.has(user.id)
      }
      await saveUsers(env, db)
      
      console.log(`[MATCH] ${result.matches.length} pairs matched, ${completedUsers.length - result.matches.length * 2} unmatched`)
      return jsonResponse({
        success: true,
        roundId: newRound.roundId,
        matchedCount: result.matches.length,
        unmatchedCount: completedUsers.length - result.matches.length * 2
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
      const db = await getUsers(env)
      const user = db.users.find(u => u.id === userId)
      if (!user) return jsonResponse({ error: 'User not found' }, 404)
      
      const matchData = await getMatches(env)
      
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
      
      db.users[idx].survey = survey
      db.users[idx].surveyCompleted = true
      db.users[idx].isMatched = false
      db.users[idx].currentMatchId = null
      await saveUsers(env, db)
      return jsonResponse({ success: true })
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
            matchEmail: isUser1 ? pair.user2Email : pair.user1Email
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
