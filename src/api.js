// API configuration
// Uses relative paths for production (Cloudflare Pages)
// Falls back to localhost:3003 for local development

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = {
  async fetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }).then(res => res.json())
  },
  
  // Authentication
  sendCode: (email) => api.fetch('/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyCode: (email, code) => api.fetch('/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) }),
  register: (email, password) => api.fetch('/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => api.fetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  // User
  updateSurvey: (userId, survey) => api.fetch('/survey', { method: 'POST', body: JSON.stringify({ userId, survey }) }),
  getUsers: () => api.fetch('/users'),
  getUser: (userId) => api.fetch(`/user/${userId}`),
  deleteUser: (userId) => api.fetch(`/user/${userId}`, { method: 'DELETE' }),
  updateUser: (userId, data) => api.fetch(`/user/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Matching (new bijective algorithm)
  getMyMatch: (userId) => api.fetch(`/my-match/${userId}`),
  runMatch: () => api.fetch('/run-match', { method: 'POST' }),
  getMatchStats: () => api.fetch('/match-stats'),
  getMatchHistory: (userId) => api.fetch(`/match-history/${userId}`),
  getMatches: (userId) => api.fetch(`/matches/${userId}`),
}
