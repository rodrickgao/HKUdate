import { createApp, reactive } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Global i18n state — reactive so language changes trigger instant re-renders
const i18n = {
  state: reactive({
    lang: localStorage.getItem('hku_lang') || 'zh'
  }),
  setLang(lang) {
    this.state.lang = lang
    localStorage.setItem('hku_lang', lang)
  },
  t(key) {
    const translations = {
      zh: {
        'nav.home': '首页', 'nav.match': '配对', 'nav.profile': '我的', 'nav.about': '关于',
        'home.title': 'HKU Date', 'home.subtitle': '港大校园交友平台', 'home.desc': '基于性格匹配的智能校园交友系统',
        'home.signup': '立即注册', 'home.login': '登录',
        'home.feature.verify': 'HKU 邮箱认证', 'home.feature.verify.desc': '仅限 @connect.hku.hk 邮箱注册',
        'home.feature.match': '智能匹配', 'home.feature.match.desc': '基于16型人格和兴趣问卷',
        'home.feature.privacy': '隐私保护', 'home.feature.privacy.desc': '配对成功后每周二才可见联系方式',
        'login.title': '登录', 'login.subtitle': '欢迎回来', 'login.email': '邮箱', 'login.password': '密码', 'login.btn': '登录', 'login.noAccount': '还没有账号？', 'login.register': '立即注册',
        'register.title': '注册', 'register.subtitle': '加入 HKU Date', 'register.email': '邮箱', 'register.hint': '仅限 @connect.hku.hk 邮箱', 'register.password': '密码', 'register.confirm': '确认密码', 'register.btn': '发送验证码', 'login.haveAccount': '已有账号？',
        'verify.title': '验证邮箱', 'verify.subtitle': '请输入发送到您邮箱的6位验证码', 'verify.code': '验证码', 'verify.btn': '验证', 'verify.resend': '重新发送验证码',
        'survey.title': '完善资料', 'survey.subtitle': '让我们更好地了解你', 'survey.avatar': '选择头像', 'survey.basic': '基本信息', 'survey.gender': '性别', 'survey.grade': '年级', 'survey.major': '专业', 'survey.interests': '兴趣爱好', 'survey.personality': '16 Personalities', 'survey.expect': '你期望的TA', 'survey.preferGender': '性别要求', 'survey.preferGrade': '年级要求', 'survey.preferAge': '年龄要求', 'survey.preferTraits': '期望的性格特征', 'survey.other': '其他描述', 'survey.submit': '完成问卷',
        'dashboard.welcome': '欢迎回来！', 'dashboard.myProfile': '我的资料', 'dashboard.surveyDone': '已完成问卷', 'dashboard.surveyNot': '未完成问卷', 'dashboard.findMatch': '寻找配对', 'dashboard.viewMatch': '查看匹配', 'dashboard.privacy': '隐私设置', 'dashboard.settings': '设置', 'dashboard.feedback': '反馈', 'dashboard.countdown': '距离下周二 19:00 还有：', 'dashboard.locked': '🔒 邮箱将于每周二 19:00 可见', 'dashboard.active': '✅ 现在可以查看配对对象的邮箱！',
        'profile.title': '我的资料', 'profile.info': '问卷信息', 'profile.gender': '性别', 'profile.grade': '年级', 'profile.major': '专业', 'profile.personality': '16型人格', 'profile.interests': '兴趣爱好', 'profile.prefer': '期望对象', 'profile.edit': '编辑资料', 'profile.danger': '危险区域', 'profile.delete': '删除账户',
        'privacy.title': '隐私设置', 'privacy.email': '邮箱可见性', 'privacy.emailDesc': '根据平台规则，配对对象的邮箱仅在每周二 19:00 - 23:00 可见', 'privacy.active': '✅ 现在可见', 'privacy.inactive': '🔒 已隐藏', 'privacy.profile': '个人资料', 'privacy.profileDesc': '您的问卷信息仅用于配对算法', 'privacy.showProfile': '允许匹配对象查看我的问卷信息', 'privacy.notify': '通知设置', 'privacy.emailNotify': '邮件通知有新匹配',
        'about.title': '关于 HKU Date', 'about.us': '关于我们', 'about.usDesc': 'HKU Date 是港大校园交友平台，基于16型人格和兴趣爱好为同学们提供智能配对服务。', 'about.privacy': '隐私保护', 'about.privacyList': ['仅限 @connect.hku.hk 邮箱注册', '用户问卷信息严格保密', '配对成功后每周特定时间才能查看联系方式', '用户可随时删除账户'], 'about.flow': '使用流程', 'about.contact': '联系我们', 'about.contactDesc': '如有问题或建议，请联系：hello@hku.date',
        'feedback.title': '反馈', 'feedback.subtitle': '告诉我们您的想法', 'feedback.type': '反馈类型', 'feedback.bug': '报告 Bug', 'feedback.feature': '功能建议', 'feedback.other': '其他', 'feedback.content': '详细内容', 'feedback.contact': '联系方式（可选）', 'feedback.btn': '提交反馈',
        'report.title': '举报', 'report.subtitle': '举报违规用户或内容', 'report.reason': '举报原因', 'report.fake': '虚假信息', 'report.harassment': '骚扰行为', 'report.spam': '垃圾信息', 'report.other': '其他', 'report.desc': '详细说明', 'report.evidence': '证据截图（可选）', 'report.btn': '提交举报',
        'changelog.title': '更新日志', 'changelog.v1': 'v1.0.0', 'changelog.date': '2026-04-01', 'changelog.items': ['🎉 初始版本发布', '🔐 HKU 邮箱注册和验证', '📋 用户问卷系统', '💕 智能匹配算法', '🔒 邮箱隐私保护（周二可见）', '👤 用户资料和隐私设置', '🗑️ 账户删除功能'],
        'coming.title': '即将上线', 'coming.desc': '精彩功能正在筹备中，敬请期待！', 'coming.back': '返回首页',
        'notfound.title': '404', 'notfound.desc': '页面不存在', 'notfound.back': '返回首页',
        'footer.privacy': '隐私政策', 'footer.about': '关于', 'footer.feedback': '反馈',
        'grade.1': '本科一年级', 'grade.2': '本科二年级', 'grade.3': '本科三年级', 'grade.4': '本科四年级', 'grade.5': '硕士一年级', 'grade.6': '硕士二年级', 'grade.7': '硕士三年级及以上', 'grade.8': '博士',
        'gender.male': '男', 'gender.female': '女', 'gender.other': '其他',
        'prefer.any': '不限', 'prefer.male': '男', 'prefer.female': '女',
        'prefer.grade.same': '同年级', 'prefer.grade.older': '高年级', 'prefer.grade.younger': '低年级'
      },
      en: {
        'nav.home': 'Home', 'nav.match': 'Match', 'nav.profile': 'Profile', 'nav.about': 'About',
        'home.title': 'HKU Date', 'home.subtitle': 'HKU Campus Dating Platform', 'home.desc': 'Intelligent matching based on personality',
        'home.signup': 'Sign Up', 'home.login': 'Login',
        'home.feature.verify': 'HKU Email Verification', 'home.feature.verify.desc': 'Only @connect.hku.hk emails allowed',
        'home.feature.match': 'Smart Matching', 'home.feature.match.desc': 'Based on 16 Personalities & interests',
        'home.feature.privacy': 'Privacy Protection', 'home.feature.privacy.desc': 'Email visible Tuesdays only',
        'login.title': 'Login', 'login.subtitle': 'Welcome back', 'login.email': 'Email', 'login.password': 'Password', 'login.btn': 'Login', 'login.noAccount': "Don't have an account?", 'login.register': 'Sign Up',
        'register.title': 'Sign Up', 'register.subtitle': 'Join HKU Date', 'register.email': 'Email', 'register.hint': 'Only @connect.hku.hk', 'register.password': 'Password', 'register.confirm': 'Confirm Password', 'register.btn': 'Send Code', 'login.haveAccount': 'Already have an account?',
        'verify.title': 'Verify Email', 'verify.subtitle': 'Enter the 6-digit code sent to your email', 'verify.code': 'Verification Code', 'verify.btn': 'Verify', 'verify.resend': 'Resend Code',
        'survey.title': 'Complete Profile', 'survey.subtitle': 'Let us know you better', 'survey.avatar': 'Choose Avatar', 'survey.basic': 'Basic Info', 'survey.gender': 'Gender', 'survey.grade': 'Grade', 'survey.major': 'Major', 'survey.interests': 'Interests', 'survey.personality': '16 Personalities', 'survey.expect': 'Your Ideal Match', 'survey.preferGender': 'Gender Preference', 'survey.preferGrade': 'Grade Preference', 'survey.preferAge': 'Age Preference', 'survey.preferTraits': 'Personality Traits', 'survey.other': 'Other', 'survey.submit': 'Submit',
        'dashboard.welcome': 'Welcome Back!', 'dashboard.myProfile': 'My Profile', 'dashboard.surveyDone': 'Survey Completed', 'dashboard.surveyNot': 'Survey Incomplete', 'dashboard.findMatch': 'Find Matches', 'dashboard.viewMatch': 'View Matches', 'dashboard.privacy': 'Privacy', 'dashboard.settings': 'Settings', 'dashboard.feedback': 'Feedback', 'dashboard.countdown': 'Time until Tuesday 19:00:', 'dashboard.locked': '🔒 Email visible Tuesday 19:00', 'dashboard.active': '✅ Email is now visible!',
        'profile.title': 'My Profile', 'profile.info': 'Survey Info', 'profile.gender': 'Gender', 'profile.grade': 'Grade', 'profile.major': 'Major', 'profile.personality': 'Personality', 'profile.interests': 'Interests', 'profile.prefer': 'Preferences', 'profile.edit': 'Edit Profile', 'profile.danger': 'Danger Zone', 'profile.delete': 'Delete Account',
        'privacy.title': 'Privacy Settings', 'privacy.email': 'Email Visibility', 'privacy.emailDesc': "Partner's email is only visible Tue 19:00-23:00", 'privacy.active': '✅ Visible Now', 'privacy.inactive': '🔒 Hidden', 'privacy.profile': 'Profile', 'privacy.profileDesc': 'Your info is only used for matching', 'privacy.showProfile': 'Allow matches to view my profile', 'privacy.notify': 'Notifications', 'privacy.emailNotify': 'Email me when I have new matches',
        'about.title': 'About HKU Date', 'about.us': 'About Us', 'about.usDesc': 'HKU Date is a campus dating platform using 16 personalities for intelligent matching.',
        'about.privacy': 'Privacy Protection', 'about.privacyList': ['Only @connect.hku.hk emails', 'Survey data kept private', 'Contact info visible Tuesdays only', 'Delete account anytime'],
        'about.flow': 'How It Works', 'about.contact': 'Contact Us', 'about.contactDesc': 'Questions? Email: hello@hku.date',
        'feedback.title': 'Feedback', 'feedback.subtitle': 'Share your thoughts', 'feedback.type': 'Type', 'feedback.bug': 'Report Bug', 'feedback.feature': 'Feature Request', 'feedback.other': 'Other', 'feedback.content': 'Details', 'feedback.contact': 'Contact (optional)', 'feedback.btn': 'Submit',
        'report.title': 'Report', 'report.subtitle': 'Report inappropriate behavior', 'report.reason': 'Reason', 'report.fake': 'Fake Info', 'report.harassment': 'Harassment', 'report.spam': 'Spam', 'report.other': 'Other', 'report.desc': 'Description', 'report.evidence': 'Screenshot (optional)', 'report.btn': 'Submit Report',
        'changelog.title': 'Changelog', 'changelog.v1': 'v1.0.0', 'changelog.date': '2026-04-01', 'changelog.items': ['🎉 Initial release', '🔐 HKU email verification', '📋 Survey system', '💕 Matching algorithm', '🔒 Email privacy (Tue)', '👤 Profile & privacy', '🗑️ Account deletion'],
        'coming.title': 'Coming Soon', 'coming.desc': 'Exciting features on the way!', 'coming.back': 'Back to Home',
        'notfound.title': '404', 'notfound.desc': 'Page not found', 'notfound.back': 'Back to Home',
        'footer.privacy': 'Privacy', 'footer.about': 'About', 'footer.feedback': 'Feedback',
        'grade.1': 'Year 1', 'grade.2': 'Year 2', 'grade.3': 'Year 3', 'grade.4': 'Year 4', 'grade.5': 'Master 1', 'grade.6': 'Master 2', 'grade.7': 'Master 3+', 'grade.8': 'PhD',
        'gender.male': 'Male', 'gender.female': 'Female', 'gender.other': 'Other',
        'prefer.any': 'Any', 'prefer.male': 'Male', 'prefer.female': 'Female',
        'prefer.grade.same': 'Same Year', 'prefer.grade.older': 'Older', 'prefer.grade.younger': 'Younger'
      }
    }
    return translations[this.state.lang][key] || key
  }
}

// Views
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Verify from './views/Verify.vue'
import Survey from './views/Survey.vue'
import Dashboard from './views/Dashboard.vue'
import Match from './views/Match.vue'
import Profile from './views/Profile.vue'
import Privacy from './views/Privacy.vue'
import About from './views/About.vue'
import Feedback from './views/Feedback.vue'
import Report from './views/Report.vue'
import Changelog from './views/Changelog.vue'
import ComingSoon from './views/ComingSoon.vue'
import NotFound from './views/NotFound.vue'
import Demo from './views/Demo.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/verify', name: 'Verify', component: Verify },
  { path: '/survey', name: 'Survey', component: Survey, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, requiresSurvey: true } },
  { path: '/match', name: 'Match', component: Match, meta: { requiresAuth: true, requiresSurvey: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/privacy', name: 'Privacy', component: Privacy, meta: { requiresAuth: true } },
  { path: '/about', name: 'About', component: About },
  { path: '/feedback', name: 'Feedback', component: Feedback },
  { path: '/report', name: 'Report', component: Report },
  { path: '/changelog', name: 'Changelog', component: Changelog },
  { path: '/coming-soon', name: 'ComingSoon', component: ComingSoon },
  { path: '/demo', name: 'Demo', component: Demo },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  // Check both localStorage (remember me) and sessionStorage
  let user = JSON.parse(localStorage.getItem('hkuuser') || 'null')
  if (!user) {
    user = JSON.parse(sessionStorage.getItem('hkuuser') || 'null')
  }
  const surveyCompleted = user?.surveyCompleted || false
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.requiresSurvey && !surveyCompleted) {
    next('/survey')
  } else {
    next()
  }
})

const app = createApp(App)
app.provide('i18n', i18n)
app.use(router)
app.mount('#app')
