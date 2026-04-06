import { onRequest } from './functions/api/index.js'

class MemoryKV {
  constructor() {
    this.store = new Map()
  }

  async get(key, type) {
    if (!this.store.has(key)) return null
    const value = this.store.get(key)
    if (type === 'json') return JSON.parse(value)
    return value
  }

  async put(key, value) {
    this.store.set(key, value)
  }
}

const env = { USERS_KV: new MemoryKV() }

const apiCall = async (path, method = 'GET', body = null) => {
  const request = new Request(`https://example.com${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
  })
  const response = await onRequest({ request, env })
  return response.json()
}

const users = [
  {
    email: 'alice@connect.hku.hk',
    password: '123456',
    survey: {
      avatar: '🦊', gender: 'female', grade: '3', major: '金融学',
      interests: ['📚 阅读', '🎵 音乐', '✈️ 旅行'], personality: 'ENFP',
      preferGender: 'male', preferGrade: ['same', 'older'], preferAgeMin: '18', preferAgeMax: '25',
      preferTraits: ['😊 乐观开朗'], preference: '希望认识有趣的人'
    }
  },
  {
    email: 'bob@connect.hku.hk',
    password: '123456',
    survey: {
      avatar: '🐯', gender: 'male', grade: '4', major: '金融学',
      interests: ['📚 阅读', '🎵 音乐', '☕ 咖啡'], personality: 'ENFJ',
      preferGender: 'female', preferGrade: ['younger'], preferAgeMin: '18', preferAgeMax: '25',
      preferTraits: ['❤️ 温柔体贴'], preference: '希望找同频的人'
    }
  },
  {
    email: 'carol@connect.hku.hk',
    password: '123456',
    survey: {
      avatar: '🦋', gender: 'female', grade: '2', major: '市场学',
      interests: ['🎬 影视', '📷 摄影', '☕ 咖啡'], personality: 'ESFJ',
      preferGender: 'male', preferGrade: ['same'], preferAgeMin: '18', preferAgeMax: '25',
      preferTraits: ['😄 幽默风趣'], preference: '喜欢拍照和喝咖啡'
    }
  },
  {
    email: 'dave@connect.hku.hk',
    password: '123456',
    survey: {
      avatar: '🦁', gender: 'male', grade: '2', major: '市场学',
      interests: ['🎬 影视', '📷 摄影', '☕ 咖啡'], personality: 'ESFP',
      preferGender: 'female', preferGrade: ['same', 'older'], preferAgeMin: '18', preferAgeMax: '25',
      preferTraits: ['🎵 喜欢音乐'], preference: '爱运动也爱艺术'
    }
  }
]

for (const [index, user] of users.entries()) {
  const registerResult = await apiCall('/api/register', 'POST', { email: user.email, password: user.password })
  await apiCall('/api/survey', 'POST', { userId: registerResult.userId, survey: user.survey })
  users[index].id = registerResult.userId
}

const stats = await apiCall('/api/match-stats')
const aliceMatch = await apiCall(`/api/my-match/${users[0].id}`)
const bobMatch = await apiCall(`/api/my-match/${users[1].id}`)
const carolMatch = await apiCall(`/api/my-match/${users[2].id}`)
const daveMatch = await apiCall(`/api/my-match/${users[3].id}`)
const manualRun = await apiCall('/api/run-match', 'POST')

console.log(JSON.stringify({
  stats,
  manualRun,
  matches: {
    alice: aliceMatch,
    bob: bobMatch,
    carol: carolMatch,
    dave: daveMatch,
  }
}, null, 2))
