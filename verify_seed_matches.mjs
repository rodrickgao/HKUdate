import { api } from './src/api.js'

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map()
  const storage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
  }
  globalThis.localStorage = storage
  globalThis.sessionStorage = storage
}

const main = async () => {
  const seedResult = await api.seedTestUsers()
  const usersResult = await api.getUsers()
  const statsResult = await api.getMatchStats()

  const demoUsers = usersResult.users.filter((user) => /^user\d+@connect\.hku\.hk$/.test(user.email))
  const sampleUser = demoUsers[0]
  const matchResult = await api.getMyMatch(sampleUser.id)

  console.log(JSON.stringify({
    seedResult,
    demoUserCount: demoUsers.length,
    latestRoundStats: statsResult.latestRoundStats,
    sampleUser: sampleUser.email,
    sampleMatch: matchResult,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
