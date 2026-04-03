import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

// Store verification codes in memory
const verificationCodes = new Map()

// Email transporter - 使用环境变量或默认配置
let transporter = null
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  })
} catch (e) {
  console.log('Email not configured, using dev mode')
}

// API: 发送验证码
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body
  
  if (!email || !email.endsWith('@connect.hku.hk')) {
    return res.status(400).json({ error: 'Only @connect.hku.hk emails allowed' })
  }
  
  // 生成6位验证码 - 固定为123456便于测试
  const code = '123456'
  
  // 存储验证码
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000 // 10分钟有效
  })
  
  console.log(`[${email}] Verification code: ${code}`)
  
  // 尝试发送邮件
  let emailSent = false
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"HKU Date" <noreply@hku.date>',
        to: email,
        subject: '【HKU Date】您的注册验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1E4D2B 0%, #153a1f 100%); padding: 30px; text-align: center;">
              <h1 style="color: #C3A15B; margin: 0;">🎓 HKU Date</h1>
              <p style="color: white; margin: 10px 0 0 0;">港大校园交友平台</p>
            </div>
            <div style="padding: 30px; background: #fafafa;">
              <h2 style="color: #1E4D2B; margin-top: 0;">验证码</h2>
              <p style="color: #666;">您好！您的注册验证码是：</p>
              <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E4D2B;">${code}</span>
              </div>
              <p style="color: #999; font-size: 14px;">验证码有效期为10分钟，请尽快完成注册。</p>
            </div>
          </div>
        `
      })
      emailSent = true
    } catch (emailError) {
      console.log('Email send failed:', emailError.message)
    }
  }
  
  // 无论邮件是否发送成功，都返回验证码（开发模式）
  res.json({ 
    success: true, 
    code, // 总是返回验证码以便测试
    emailSent,
    message: emailSent ? 'Code sent to email' : 'Code generated (check server console)'
  })
})

// API: 验证验证码
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body
  
  const stored = verificationCodes.get(email)
  
  if (!stored) {
    return res.status(400).json({ error: 'No code found for this email' })
  }
  
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    return res.status(400).json({ error: 'Code expired' })
  }
  
  if (stored.code !== code) {
    return res.status(400).json({ error: 'Invalid code' })
  }
  
  // 验证成功，删除验证码
  verificationCodes.delete(email)
  res.json({ success: true })
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📧 Email API ready (dev mode: codes shown in console)`)
})
