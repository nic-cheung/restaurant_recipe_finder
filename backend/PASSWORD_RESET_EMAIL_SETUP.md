# Password Reset Email Setup

This guide explains how to configure email sending for the password reset functionality.

## 🚀 Quick Start (Development)

For development, the email service will automatically use **Ethereal Email** (fake SMTP service) if no email configuration is provided. This allows you to test the password reset flow without setting up real email credentials.

**Test the flow:**
1. Start the backend server
2. Visit `/forgot-password` in the frontend
3. Enter any email address
4. Check the server logs for the preview URL to see the generated email

## 📧 Production Setup Options

Choose ONE of the following methods for production email sending:

### Option 1: Gmail OAuth (Recommended)

This method uses Gmail's OAuth API and has no IP restrictions.

1. **Enable Gmail API** in Google Cloud Console
2. **Create OAuth credentials** (Web application type)
3. **Generate refresh token** using Google OAuth Playground
4. **Add to your `.env` file:**

```bash
GMAIL_CLIENT_ID=your-gmail-oauth-client-id
GMAIL_CLIENT_SECRET=your-gmail-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER_EMAIL=your-gmail-address@gmail.com
EMAIL_FROM=noreply@yourapp.com
FRONTEND_URL=https://yourapp.com
```

### Option 2: SMTP (Gmail App Password, SendGrid, etc.)

This method uses traditional SMTP authentication.

#### For Gmail with App Password:
1. **Enable 2-factor authentication** on your Gmail account
2. **Generate an app password** in your Google Account settings
3. **Add to your `.env` file:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=noreply@yourapp.com
FRONTEND_URL=https://yourapp.com
```

#### For SendGrid:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourapp.com
FRONTEND_URL=https://yourapp.com
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | OAuth only |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth client secret | OAuth only |
| `GMAIL_REFRESH_TOKEN` | Gmail OAuth refresh token | OAuth only |
| `GMAIL_USER_EMAIL` | Gmail address for OAuth | OAuth only |
| `SMTP_HOST` | SMTP server hostname | SMTP only |
| `SMTP_PORT` | SMTP server port (usually 587) | SMTP only |
| `SMTP_SECURE` | Use SSL/TLS (true/false) | SMTP only |
| `SMTP_USER` | SMTP username | SMTP only |
| `SMTP_PASS` | SMTP password/API key | SMTP only |
| `EMAIL_FROM` | From address for emails | Optional |
| `FRONTEND_URL` | Frontend URL for reset links | Optional |

## 🔗 How It Works

1. **User requests password reset** → `/forgot-password` page
2. **System generates JWT token** → Includes user ID, email, 1-hour expiry
3. **Email sent with reset link** → `${FRONTEND_URL}/reset-password?token=...`
4. **User clicks link** → Token validated on `/reset-password` page
5. **User sets new password** → Token verified, password updated in database

## 🔒 Security Features

- **JWT-based tokens** - Stateless, no database storage needed
- **1-hour expiry** - Tokens automatically expire for security
- **Email verification** - Reset links only sent to existing accounts
- **Rate limiting** - Prevents abuse of password reset requests
- **Secure password hashing** - bcrypt with 12 salt rounds

## 🧪 Testing

### Development Testing
```bash
# Start the backend
cd backend && npm run dev

# In logs, look for:
# ✅ Email service initialized with Ethereal (development)
# 🔗 Preview URL: https://ethereal.email/message/...
```

### Production Testing
```bash
# Test email configuration
curl -X POST http://localhost:8000/api/password-reset/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs for:
# ✅ Email sent successfully: <message-id>
```

## 🚨 Troubleshooting

**Email service not working?**
- Check environment variables are loaded correctly
- Verify SMTP credentials are correct
- For Gmail: ensure app password is generated correctly
- For OAuth: verify refresh token is still valid
- Check server logs for specific error messages

**Reset links not working?**
- Verify `FRONTEND_URL` matches your frontend domain
- Check JWT_SECRET is consistent between environments
- Ensure frontend routes are properly configured

**Emails going to spam?**
- Use a proper `EMAIL_FROM` address
- Consider using SendGrid or similar service for better deliverability
- Set up SPF/DKIM records for your domain 