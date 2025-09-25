# 🚀 Buybox Generator Deployment Guide

## Overview
This guide covers deploying the Buybox Generator to production using Firebase Hosting with your custom domain.

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Your custom domain registered
- GitHub repository with CI/CD configured

## Deployment Options

### Option 1: Firebase Hosting + Custom Domain (Recommended)

#### Step 1: Firebase Project Setup
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init hosting

# Select your Firebase project
firebase use --add your-project-id
```

#### Step 2: Configure Environment Variables
```bash
# Set Firebase Functions environment variables
firebase functions:config:set \
  app.gemini_api_key="your_actual_gemini_api_key" \
  app.firebase_project_id="your-firebase-project-id" \
  app.firebase_api_key="your-firebase-api-key" \
  app.firebase_auth_domain="your-project.firebaseapp.com" \
  app.firebase_storage_bucket="your-project.appspot.com" \
  app.firebase_messaging_sender_id="123456789" \
  app.firebase_app_id="your-firebase-app-id" \
  app.cors_origin="https://yourdomain.com"
```

#### Step 3: Deploy to Firebase
```bash
# Deploy everything (hosting + functions)
firebase deploy

# Or deploy just hosting
firebase deploy --only hosting

# Or deploy just functions
firebase deploy --only functions
```

#### Step 4: Add Custom Domain
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `buybox.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### Option 2: Firebase Subdomain (Quick Start)

#### Step 1: Deploy to Firebase Subdomain
```bash
# Deploy to Firebase subdomain
firebase deploy
```

Your app will be available at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

## Production Configuration

### Environment Variables for Production
Create a `.env` file with your production values:

```env
# Production Environment Configuration
NODE_ENV=production
PORT=8080

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here
CORS_ORIGIN=https://yourdomain.com

# AI Engine Configuration
DEFAULT_AI_ENGINE=gemini
ENABLE_GEMINI=true
GEMINI_API_KEY=your_actual_gemini_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-firebase-app-id
```

### Firebase Functions Configuration
The app is configured to run as a Firebase Cloud Function, which means:
- Serverless backend
- Automatic scaling
- Pay-per-use pricing
- Global deployment

## CI/CD Pipeline

### GitHub Actions (Already Configured)
The repository includes `.github/workflows/deploy.yml` that automatically:
- Deploys on push to main branch
- Runs tests before deployment
- Deploys to Firebase Hosting

### Manual Deployment
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## Domain Configuration

### DNS Settings for Custom Domain
When you add a custom domain to Firebase Hosting, you'll need to:

1. **Add A records** pointing to Firebase IPs:
   ```
   yourdomain.com.     A    151.101.1.195
   yourdomain.com.     A    151.101.65.195
   ```

2. **Add CNAME record** for www subdomain:
   ```
   www.yourdomain.com. CNAME    your-project-id.web.app
   ```

3. **Wait for SSL certificate** (usually 24-48 hours)

## Monitoring and Maintenance

### Firebase Console
- Monitor usage in Firebase Console
- View logs in Functions section
- Monitor hosting performance

### Health Checks
Your app includes health check endpoints:
- `https://yourdomain.com/health` - Application health
- `https://yourdomain.com/metrics` - Performance metrics

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check Firebase Functions config
   - Verify `.env` file in functions directory

2. **CORS Errors**
   - Update `CORS_ORIGIN` in environment variables
   - Check Firebase Hosting configuration

3. **SSL Certificate Issues**
   - Wait 24-48 hours for certificate provisioning
   - Check DNS configuration

4. **Function Timeout**
   - Increase timeout in `firebase.json`
   - Optimize function performance

### Debug Commands
```bash
# View function logs
firebase functions:log

# Test functions locally
firebase emulators:start --only functions

# Check hosting status
firebase hosting:channel:list
```

## Cost Estimation

### Firebase Hosting (Free Tier)
- 10GB storage
- 10GB transfer per month
- Custom domains
- SSL certificates

### Firebase Functions (Pay-per-use)
- 2M invocations per month (free)
- 400,000 GB-seconds compute time (free)
- Additional usage: $0.40 per 1M invocations

### Estimated Monthly Cost
- **Small usage**: $0-5
- **Medium usage**: $5-20
- **High usage**: $20-50

## Security Considerations

### Production Security Features
- ✅ HTTPS enforced
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ Input validation
- ✅ CORS configured
- ✅ Environment variables secured

### Additional Recommendations
- Regular security audits
- Monitor for unusual traffic patterns
- Keep dependencies updated
- Use strong API keys

## Next Steps

1. **Choose your domain** (Firebase subdomain or custom domain)
2. **Set up Firebase project** and configure environment variables
3. **Deploy using Firebase CLI** or GitHub Actions
4. **Configure custom domain** (if using your own domain)
5. **Test thoroughly** in production environment
6. **Monitor performance** and usage

## Support

For deployment issues:
- Check Firebase Console logs
- Review GitHub Actions logs
- Test locally with Firebase emulators
- Consult Firebase documentation

---

**Ready to deploy?** Start with Option 1 (Firebase + Custom Domain) for the best production setup!

