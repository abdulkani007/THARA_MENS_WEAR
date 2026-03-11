# Email Notification System

## Overview
Email notification functionality has been added to the THARA backend using Nodemailer with Gmail SMTP.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Add the following to your `server/.env` file:

```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Generate Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** > **2-Step Verification** (enable if not already)
3. Scroll down to **App Passwords**
4. Select **Mail** and generate a new password
5. Copy the 16-character password and use it as `EMAIL_PASS`

## API Endpoints

### 1. Send Registration Email
**Endpoint:** `POST /api/send-registration-email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration email sent successfully"
}
```

**Email Details:**
- **Subject:** Welcome to Thara Men's Wear
- **Message:** Account creation confirmation

---

### 2. Send Order Confirmation Email
**Endpoint:** `POST /api/send-order-email`

**Request Body:**
```json
{
  "email": "user@example.com",
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

**Response:**
```json
{
  "success": true,
  "message": "Order confirmation email sent successfully"
}
```

**Email Details:**
- **Subject:** Order Confirmation - Thara Men's Wear
- **Message:** Order details with items list

## Features

✅ **Gmail SMTP Integration** - Uses secure Gmail SMTP service  
✅ **HTML Email Templates** - Branded emails with THARA theme colors  
✅ **Error Handling** - Graceful error handling, server won't crash if email fails  
✅ **Async/Await** - Modern async implementation  
✅ **Environment Variables** - Secure credential management  
✅ **Reusable Service** - Centralized email service for easy maintenance  

## Email Template Design

Emails use THARA's brand colors:
- Background: `#0B0C10` / `#111111`
- Primary Accent: `#FF2E2E` (Red)
- Secondary Accent: `#66FCF1` (Cyan)
- Text: `#C5C6C7`

## Error Handling

All email endpoints include try/catch blocks:
- If email fails, error is logged but server continues running
- Returns appropriate error response to client
- Console logs for debugging

## Testing

Test the email functionality:

```bash
# Using curl
curl -X POST http://localhost:5000/api/send-registration-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

curl -X POST http://localhost:5000/api/send-order-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","orderId":"ORD123","orderTotal":1999,"items":[{"name":"Shirt","quantity":1}]}'
```

## Integration with Frontend

Call these endpoints from your frontend when:

**Registration:**
```javascript
// After successful user registration
await fetch('http://localhost:5000/api/send-registration-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail, name: userName })
});
```

**Order Placement:**
```javascript
// After successful order creation
await fetch('http://localhost:5000/api/send-order-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: userEmail, 
    orderId: order.id,
    orderTotal: order.total,
    items: order.items
  })
});
```

## Troubleshooting

**Email not sending?**
1. Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
2. Ensure you're using Gmail App Password, not regular password
3. Check if 2-Step Verification is enabled on Google Account
4. Check server console logs for error messages

**"Less secure app access" error?**
- Use App Password instead (see Setup Instructions above)

## Files Modified/Created

- ✅ `server/services/emailService.js` - Email service with Nodemailer
- ✅ `server/index.js` - Added email endpoints
- ✅ `server/.env.example` - Added email configuration
- ✅ `server/package.json` - Added nodemailer dependency
