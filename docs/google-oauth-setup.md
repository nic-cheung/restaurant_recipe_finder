# Google OAuth Setup for Places API

## Overview
Using Google OAuth instead of API keys provides better security, no IP restrictions, and often higher quotas. This guide shows you how to set up OAuth authentication for the Google Places API.

## Benefits of OAuth vs API Key
- ✅ **No IP restrictions** - Works from any IP address
- ✅ **Better security** - Automatic token rotation, scoped access
- ✅ **Higher quotas** - Google often provides higher limits for OAuth apps
- ✅ **User attribution** - Better analytics and usage tracking
- ✅ **Production ready** - Recommended approach for production apps

## Setup Methods

### Method 1: Service Account (Recommended)

Service accounts are perfect for server-to-server authentication without user interaction.

#### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **"IAM & Admin"** → **"Service Accounts"**
4. Click **"+ Create Service Account"**
5. Fill in details:
   - **Name**: `places-api-service`
   - **Description**: `Service account for Places API access`
6. Click **"Create and Continue"**
7. Skip role assignment (not needed for Places API)
8. Click **"Done"**

#### Step 2: Create Service Account Key

1. Find your new service account in the list
2. Click the email address to open details
3. Go to **"Keys"** tab
4. Click **"Add Key"** → **"Create New Key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. Save the downloaded JSON file securely

#### Step 3: Enable Places API

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Places API"**
3. Click **"Enable"**

#### Step 4: Configure Environment

**Option A: Key File Path**
```bash
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/service-account-key.json
```

**Option B: Key as Environment Variable**
```bash
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"places-api-service@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

### Method 2: OAuth Client Credentials

For applications that need user-based authentication.

#### Step 1: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: `Restaurant Recipe Finder`
   - **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`
5. Click **"Create"**
6. Copy the **Client ID** and **Client Secret**

#### Step 2: Configure Environment

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Testing Your Setup

### Test Service Account Setup

Create a test file `test-oauth.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');

async function testServiceAccount() {
  try {
    let auth;
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/places']
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/places']
      });
    }
    
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    console.log('✅ Service Account OAuth working!');
    console.log('Access token obtained:', !!accessToken.token);
    
    // Test Places API call
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.displayName'
      },
      body: JSON.stringify({
        textQuery: 'restaurants in New York',
        maxResultCount: 5
      })
    });
    
    const data = await response.json();
    console.log('Places API response:', data);
    
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
  }
}

testServiceAccount();
```

Run the test:
```bash
node test-oauth.js
```

### Test in Application

1. Restart your backend server
2. Make a restaurant search request:
```bash
curl "http://localhost:8000/api/preferences/public/suggestions/restaurants?query=italian&location=New%20York"
```

3. Check the response source:
   - `"source": "google_places_oauth"` = OAuth working ✅
   - `"source": "google_places_api_key"` = Fallback to API key
   - `"source": "static_fallback"` = No Google API access

## Security Best Practices

### Service Account Security

1. **Limit Scope**: Only grant necessary permissions
2. **Rotate Keys**: Regularly rotate service account keys
3. **Environment Variables**: Never commit keys to version control
4. **Key Storage**: Use secure key management in production

### Production Deployment

#### Heroku
```bash
# Set environment variable
heroku config:set GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

#### Docker
```dockerfile
# Copy service account key
COPY service-account-key.json /app/config/
ENV GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/app/config/service-account-key.json
```

#### AWS/GCP
Use native secret management:
- AWS: Secrets Manager
- GCP: Secret Manager
- Azure: Key Vault

## Troubleshooting

### Common Issues

**"Service account key not found"**
- Check file path in `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`
- Verify JSON format in `GOOGLE_SERVICE_ACCOUNT_KEY`

**"Insufficient permissions"**
- Ensure Places API is enabled
- Check service account has correct scopes

**"Token expired"**
- Our implementation auto-refreshes tokens
- Check system clock is accurate

**"Project not found"**
- Verify project ID in service account key
- Ensure billing is enabled

### Debug Mode

Enable verbose logging:
```bash
DEBUG=google-auth node your-app.js
```

## Migration from API Key

If you're currently using an API key:

1. Set up OAuth using this guide
2. Keep your API key as fallback
3. Test OAuth thoroughly
4. Remove API key once OAuth is working

The application will automatically prefer OAuth over API key when both are configured.

## Cost Comparison

Both methods use the same Google Places API pricing:
- **Text Search**: $32 per 1000 requests
- **$200 free credit per month** for new accounts
- **~6,250 free searches per month**

OAuth doesn't change pricing but may provide higher quotas and better rate limits.

## Support

If you encounter issues:
1. Check the [Google Cloud Console](https://console.cloud.google.com/) for error messages
2. Verify billing is enabled
3. Test with the provided test script
4. Check application logs for detailed error messages

The application includes comprehensive error handling and will automatically fall back to static suggestions if OAuth fails. 