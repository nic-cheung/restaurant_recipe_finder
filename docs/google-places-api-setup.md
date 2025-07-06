# Google Places API Setup Guide

## Overview
Google Places API provides comprehensive restaurant and business data. While it's not completely free, it offers a generous free tier that should cover most development and small-scale production usage.

## Free Tier Limits (2024)
- **$200 free credit per month** for new accounts
- **Places API Pricing**:
  - Text Search: $32 per 1000 requests
  - Place Details: $17 per 1000 requests
  - **With $200 credit**: ~6,000 text searches OR ~11,000 place details per month FREE

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Create Project"** or select project dropdown → **"New Project"**
4. Enter project name (e.g., "Restaurant Recipe Finder")
5. Click **"Create"**

### 2. Enable Places API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Places API"**
3. Click on **"Places API"** result
4. Click **"Enable"**

### 3. Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"API Key"**
3. Copy the generated API key (keep it secure!)
4. **IMPORTANT**: Click **"Restrict Key"** for security

### 4. Configure API Key Restrictions (Security)

**Application Restrictions:**
- Select **"HTTP referrers (web sites)"** for frontend use
- OR **"IP addresses (web servers, cron jobs, etc.)"** for backend use
- Add your domains/IPs:
  ```
  localhost:*
  yourdomain.com/*
  *.yourdomain.com/*
  ```

**API Restrictions:**
- Select **"Restrict key"**
- Check **"Places API"**
- Save changes

### 5. Set Up Billing (Required)

⚠️ **Note**: Billing setup is required even for free tier usage.

1. Go to **"Billing"** in Google Cloud Console
2. Click **"Link a billing account"** or **"Manage billing accounts"**
3. Add a credit card (you won't be charged within free limits)
4. **Enable billing alerts**:
   - Set budget alerts at $50, $100, $150
   - Get notified before hitting the $200 limit

### 6. Add API Key to Your Project

Add to your `.env` file:
```bash
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

## Usage in Restaurant Recipe Finder

The API will automatically use Google Places when:
1. API key is configured in environment
2. User provides a location parameter
3. Fallback to static restaurants if API fails/unavailable

**Example API Usage:**
```bash
# Will use Google Places API
GET /api/preferences/suggestions/restaurants?query=italian&location=new+york

# Will use static fallback
GET /api/preferences/suggestions/restaurants?query=italian
```

## Cost Management Best Practices

### 1. Enable Quotas & Limits
1. Go to **"APIs & Services"** → **"Quotas"**
2. Search for "Places API"
3. Set daily/monthly limits:
   - **Requests per day**: 1000 (adjust based on needs)
   - **Requests per minute**: 100

### 2. Implement Caching
Our implementation already includes:
- Static fallback when API unavailable
- Smart fallback to curated restaurant list
- Error handling to prevent API abuse

### 3. Monitor Usage
1. Go to **"APIs & Services"** → **"Dashboard"**
2. Monitor daily/monthly usage
3. Set up billing alerts

### 4. Production Optimization
- Cache popular restaurant queries
- Implement request throttling
- Use static fallbacks for common searches
- Consider upgrading only if needed

## Testing Your Setup

### 1. Test API Key
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+new+york&key=YOUR_API_KEY"
```

### 2. Test in Application
1. Add API key to backend `.env`
2. Restart backend server
3. Make restaurant suggestions request with location
4. Check backend logs for "google_places" source

## Troubleshooting

### Common Issues

**"This API project is not authorized to use this API"**
- Solution: Make sure Places API is enabled in your project

**"API key not valid"**
- Solution: Check API key restrictions match your usage (IP/referrer)

**"REQUEST_DENIED"**
- Solution: Enable billing on your Google Cloud project

**"OVER_QUERY_LIMIT"**
- Solution: You've exceeded free tier, check usage in console

### Error Handling
Our implementation includes automatic fallback:
```typescript
// If Google Places fails, automatically use static restaurant list
if (googleResponse.ok) {
  suggestions = data.results?.map(place => place.name) || [];
  source = 'google_places';
} else {
  // Falls back to curated static list
  suggestions = COMMON_RESTAURANTS.filter(...);
  source = 'static_fallback';
}
```

## Alternative Free Options

If you prefer completely free alternatives:

### 1. OpenStreetMap Overpass API
- **Pros**: Completely free, no API key needed
- **Cons**: Limited data quality, complex queries
- **Implementation**: Search OSM for `amenity=restaurant`

### 2. Foursquare Places API
- **Free Tier**: 1000 requests/day
- **Pros**: Good restaurant data, simple API
- **Cons**: Smaller dataset than Google

### 3. Static Data Only
- **Pros**: No API costs, always available, fast
- **Cons**: No real-time data, limited to curated list
- **Current Implementation**: 140+ world-class restaurants

## Recommendation

For most users, I recommend:
1. **Development**: Use static fallback only (no API key needed)
2. **Small Production**: Google Places API (likely within free tier)
3. **Large Scale**: Monitor usage and optimize caching

The current implementation works perfectly without any API keys and provides high-quality restaurant suggestions from our curated list of 140+ world-renowned establishments. 