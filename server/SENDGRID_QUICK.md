# 🚀 SENDGRID QUICK SETUP

## ✅ Migration Complete: Now Using SendGrid

---

## 📋 What You Need (2 Things)

### 1. SendGrid API Key
- Go to: https://app.sendgrid.com/settings/api_keys
- Create API Key → Full Access
- Copy the key (starts with `SG.`)

### 2. Verified Sender Email
- Go to: https://app.sendgrid.com/settings/sender_auth/senders
- Create New Sender
- Verify your email
- Use this email in config

---

## ⚡ Quick Setup

### Local (.env):
```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@example.com
```

### Render Dashboard:
```
SENDGRID_API_KEY = SG.your_api_key_here
SENDGRID_FROM_EMAIL = your_verified_email@example.com
```

**Remove these old variables:**
- ❌ RESEND_API_KEY
- ❌ EMAIL_USER
- ❌ EMAIL_PASS

---

## 🧪 Test

```bash
cd server
npm start

# Should see:
# 📧 Email service configured with SendGrid API
```

```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

---

## 📊 What Changed

| Item | Before | After |
|------|--------|-------|
| Package | `resend` | `@sendgrid/mail` |
| API Key | `RESEND_API_KEY` | `SENDGRID_API_KEY` |
| From Email | Fixed | `SENDGRID_FROM_EMAIL` |
| Verification | None | Email must be verified |

---

## ✅ Checklist

- [ ] Get SendGrid API key
- [ ] Verify sender email in SendGrid
- [ ] Update local `.env`
- [ ] Update Render environment variables
- [ ] Remove old variables
- [ ] Test locally
- [ ] Deploy to Render

---

## 🆘 Common Issues

### "From email does not match verified Sender"
→ Verify your email at: https://app.sendgrid.com/settings/sender_auth/senders

### "SENDGRID_API_KEY not configured"
→ Add to `.env` and Render Dashboard

### "403 Forbidden"
→ Check API key has "Mail Send" permission

---

## 📞 Quick Links

- **API Keys:** https://app.sendgrid.com/settings/api_keys
- **Sender Auth:** https://app.sendgrid.com/settings/sender_auth/senders
- **Email Activity:** https://app.sendgrid.com/email_activity
- **Render Dashboard:** https://dashboard.render.com/

---

## 🎉 Deploy

```bash
git add .
git commit -m "Migrate to SendGrid"
git push origin main
```

**Then set environment variables in Render Dashboard!**

---

**Status:** ✅ Ready to use SendGrid! 🚀
