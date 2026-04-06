/**
 * HKU Date Backend - Cloudflare Worker
 * Using Hono Framework + Cloudflare KV
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS for all origins (for development)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// KV namespace binding will be provided by environment
const USERS_KV = c => c.env.USERS_KV

// Helper to get users from KV
const getUsers = async (env) => {
  const data = await env.USERS_KV.get('users', 'json')
  return data || { users: [] }
}

// Helper to save users to KV
const saveUsers = async (env, data) => {
  await env.USERS_KV.put('users', JSON.stringify(data))
}

// In-memory verification codes (reset on worker cold start)
const verificationCodes = new Map()

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Send verification code
app.post('/api/send-code', async (c) => {
  const { email } = await c.req.json()
  
  if (!email || !email.endsWith('@connect.hku.hk')) {
    return c.json({ error: 'Only @connect.hku.hk emails allowed' }, 400)
  }
  
  // Generate 6-digit code
  const code = '123456' // Fixed for testing
  
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000
  })
  
  console.log(`[${email}] Verification code: ${code}`)
  
  return c.json({
    success: true,
    code,
    message: 'Code generated (check server console)'
  })
})

// Verify code
app.post('/api/verify-code', async (c) => {
  const { email, code } = await c.req.json()
  
  const stored = verificationCodes.get(email)
  
  if (!stored) {
    return c.json({ error: 'No code found for this email' }, 400)
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    return c.json({ error: 'Code expired' }, 400)
  }
  
  if (stored.code !== code) {
    return c.json({ error: 'Invalid code' }, 400)
  }
  
  verificationCodes.delete(email)
  return c.json({ success: true })
})

// Register user
app.post('/api/register', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !email.endsWith('@connect.hku.hk')) {
    return c.json({ error: 'Only @connect.hku.hk emails allowed' }, 400)
  }
  
  if (!password || password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400)
  }
  
  const db = await getUsers(c.env)
  
  if (db.users.find(u => u.email === email)) {
    return c.json({ error: 'Email already registered' }, 400)
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    surveyCompleted: false,
    survey: null,
    createdAt: new Date().toISOString()
  }
  
  db.users.push(newUser)
  await saveUsers(c.env, db)
  
  console.log(`[REGISTER] New user: ${email} (${db.users.length} total)`)
  
  return c.json({ success: true, userId: newUser.id })
})

// Login
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const db = await getUsers(c.env)
  const user = db.users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  
  const { password: _, ...userWithoutPassword } = user
  return c.json({ success: true, user: userWithoutPassword })
})

// Update survey
app.post('/api/survey', async (c) => {
  const { userId, survey } = await c.req.json()
  
  const db = await getUsers(c.env)
  const userIndex = db.users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  db.users[userIndex].survey = survey
  db.users[userIndex].surveyCompleted = true
  
  await saveUsers(c.env, db)
  
  console.log(`[SURVEY] User ${db.users[userIndex].email} completed survey`)
  
  return c.json({ success: true })
})

// Get all users
app.get('/api/users', async (c) => {
  const db = await getUsers(c.env)
  const usersWithoutPassword = db.users.map(({ password, ...u }) => u)
  return c.json({ success: true, users: usersWithoutPassword })
})

// Get matches for a user
app.get('/api/matches/:userId', async (c) => {
  const { userId } = c.req.param
  
  const db = await getUsers(c.env)
  const currentUser = db.users.find(u => u.id === userId)
  
  if (!currentUser) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  if (!currentUser.surveyCompleted) {
    return c.json({ error: 'Please complete your survey first' }, 400)
  }
  
  // Filter other users who completed survey
  const otherUsers = db.users.filter(u => u.id !== userId && u.surveyCompleted)
  
  // Calculate match scores
  const scoredMatches = otherUsers.map(other => {
    let score = 0
    const survey = currentUser.survey
    const otherSurvey = other.survey
    
    // Gender preference match (max 30 points)
    if (survey.preferGender === 'any' || survey.preferGender === otherSurvey.gender) {
      score += 30
    }
    
    // Personality match (20 points)
    if (survey.personality && otherSurvey.personality) {
      score += 20
    }
    
    // Same major (15 points)
    if (survey.major === otherSurvey.major) {
      score += 15
    }
    
    // Same grade (10 points)
    if (survey.grade === otherSurvey.grade) {
      score += 10
    }
    
    // Common interests (max 25 points)
    if (survey.interests && otherSurvey.interests) {
      const common = survey.interests.filter(i => otherSurvey.interests.includes(i))
      score += Math.min(common.length * 5, 25)
    }
    
    return {
      ...other,
      password: undefined,
      matchScore: score
    }
  })
  
  // Sort by score and take top 10
  const topMatches = scoredMatches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10)
    .map(({ password, ...u }) => u)
  
  console.log(`[MATCH] User ${currentUser.email} got ${topMatches.length} matches`)
  
  return c.json({ success: true, matches: topMatches })
})

// Get user by ID
app.get('/api/user/:userId', async (c) => {
  const { userId } = c.req.param
  
  const db = await getUsers(c.env)
  const user = db.users.find(u => u.id === userId)
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  const { password, ...userWithoutPassword } = user
  return c.json({ success: true, user: userWithoutPassword })
})

// Delete account
app.delete('/api/user/:userId', async (c) => {
  const { userId } = c.req.param
  
  const db = await getUsers(c.env)
  const userIndex = db.users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  db.users.splice(userIndex, 1)
  await saveUsers(c.env, db)
  
  console.log(`[DELETE] User ${userId} deleted account`)
  
  return c.json({ success: true })
})

// Update user profile (for edits)
app.put('/api/user/:userId', async (c) => {
  const { userId } = c.req.param
  const updates = await c.req.json()
  
  const db = await getUsers(c.env)
  const userIndex = db.users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  db.users[userIndex] = {
    ...db.users[userIndex],
    ...updates,
    id: userId // prevent ID change
  }
  
  await saveUsers(c.env, db)
  
  return c.json({ success: true })
})

// Export the worker
export default {
  fetch: app.fetch,
  scheduled: async (event, env, ctx) => {
    // Scheduled event handler (for future cron jobs)
    console.log('Scheduled event triggered')
  }
}
