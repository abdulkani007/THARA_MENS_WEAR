# How to Check if Email is Sent

## ✅ Fixed Issues:
1. ✅ Added email credentials to actual `.env` file (was only in `.env.example`)
2. ✅ Removed spaces from Gmail App Password
3. ✅ Added email verification on server startup
4. ✅ Added detailed console logging
5. ✅ Created test endpoint

---

## 🧪 Method 1: Use the HTML Test Page (EASIEST)

1. **Start your server:**
   ```bash
   cd server
   npm start
   ```

2. **Open the test page:**
   - Open `server/test-email.html` in your browser
   - Or navigate to: `file:///d:/projects/THARA/server/test-email.html`

3. **Test the email:**
   - Enter your email address
   - Click "🧪 Test Email" button
   - Check your inbox (and spam folder)

4. **Check server console** for logs like:
   ```
   ✅ Email service is ready to send emails
   🔄 Attempting to send test email to: your@email.com
   ✅ Email sent successfully to: your@email.com
   📧 Message ID: <some-id@gmail.com>
   ```

---

## 🔧 Method 2: Use cURL (Command Line)

```bash
# Test Email
curl -X POST http://localhost:5000/api/test-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your@email.com\"}"

# Registration Email
curl -X POST http://localhost:5000/api/send-registration-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your@email.com\",\"name\":\"Test User\"}"

# Order Email
curl -X POST http://localhost:5000/api/send-order-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your@email.com\",\"orderId\":\"TEST123\",\"orderTotal\":2999,\"items\":[{\"name\":\"Shirt\",\"quantity\":1}]}"
```

---

## 🌐 Method 3: Use Postman or Thunder Client

### Test Email Endpoint
- **URL:** `http://localhost:5000/api/test-email`
- **Method:** POST
- **Body (JSON):**
  ```json
  {
    "email": "your@email.com"
  }
  ```

### Registration Email
- **URL:** `http://localhost:5000/api/send-registration-email`
- **Method:** POST
- **Body (JSON):**
  ```json
  {
    "email": "your@email.com",
    "name": "John Doe"
  }
  ```

### Order Email
- **URL:** `http://localhost:5000/api/send-order-email`
- **Method:** POST
- **Body (JSON):**
  ```json
  {
    "email": "your@email.com",
    "orderId": "ORD123456",
    "orderTotal": 2999,
    "items": [
      {
        "name": "Premium Shirt",
        "quantity": 2
      },
      {
        "name": "Casual Jeans",
        "quantity": 1
      }
    ]
  }
  ```

---

## 📊 What to Check

### 1. Server Console Logs
When server starts, you should see:
```
✅ Email service is ready to send emails
```

If you see this instead:
```
⚠️  EMAIL_USER or EMAIL_PASS not configured in .env file
❌ Email transporter verification failed: Invalid login
```
Then check your `.env` file configuration.

### 2. When Sending Email
**Success:**
```
🔄 Attempting to send test email to: user@example.com
✅ Email sent successfully to: user@example.com
📧 Message ID: <abc123@gmail.com>
```

**Failure:**
```
❌ Email sending failed: Invalid login: 535-5.7.8 Username and Password not accepted
❌ Authentication failed - Check EMAIL_USER and EMAIL_PASS in .env
```

### 3. API Response
**Success Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox.",
  "messageId": "<abc123@gmail.com>",
  "sentTo": "your@email.com"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid login: 535-5.7.8 Username and Password not accepted",
  "hint": "Check server console for detailed error logs"
}
```

### 4. Your Email Inbox
- Check **Inbox** folder
- Check **Spam/Junk** folder
- Check **Promotions** tab (Gmail)
- Wait 1-2 minutes for delivery

---

## 🔍 Troubleshooting

### Problem: "Email service is NOT ready"
**Solution:**
1. Check `server/.env` file has:
   ```
   EMAIL_USER=abdulkani180607@gmail.com
   EMAIL_PASS=iixltzpfwshrtrbf
   ```
2. Make sure there are NO SPACES in the password
3. Restart the server

### Problem: "Invalid login" or "Authentication failed"
**Solution:**
1. Verify the Gmail App Password is correct
2. Generate a NEW App Password:
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate new password for "Mail"
   - Copy the 16-character password (remove spaces)
   - Update `EMAIL_PASS` in `.env`
3. Restart the server

### Problem: Email not received
**Solution:**
1. Check spam/junk folder
2. Wait 2-3 minutes
3. Check server console for "✅ Email sent successfully"
4. Try sending to a different email address
5. Check Gmail account settings allow "Less secure app access"

### Problem: "Cannot connect to server"
**Solution:**
1. Make sure server is running: `cd server && npm start`
2. Check server is on port 5000
3. Check firewall settings

---

## 📧 Current Configuration

Your `.env` file is configured with:
- **Email:** abdulkani180607@gmail.com
- **Password:** iixltzpfwshrtrbf (16 characters, no spaces)

---

## 🎯 Quick Test Steps

1. **Start server:** `cd server && npm start`
2. **Look for:** `✅ Email service is ready to send emails`
3. **Open:** `server/test-email.html` in browser
4. **Enter your email** and click "🧪 Test Email"
5. **Check inbox** (and spam folder)
6. **Check server console** for success/error logs

---

## 📝 API Endpoints Summary

| Endpoint | Purpose | Required Fields |
|----------|---------|----------------|
| `/api/test-email` | Test email functionality | `email` |
| `/api/send-registration-email` | Welcome email | `email`, `name` (optional) |
| `/api/send-order-email` | Order confirmation | `email`, `orderId`, `orderTotal`, `items` |

---

## ✅ Success Indicators

- ✅ Server console shows: "Email service is ready"
- ✅ Server console shows: "Email sent successfully"
- ✅ API returns: `{"success": true}`
- ✅ Email appears in inbox within 1-2 minutes
- ✅ Email has THARA branding and correct content
