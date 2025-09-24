# Production Deployment Guide

## Overview
This guide covers deploying the Buybox Generator to production with all security, performance, and monitoring features enabled.

## Prerequisites

### Required Accounts & Services
- **Firebase Project**: For hosting and authentication
- **GitHub Repository**: For CI/CD
- **Domain Name**: For production URL (optional)

### Required Environment Variables
Copy `config/production.env.example` to `.env` and configure:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here
CORS_ORIGIN=https://yourdomain.com

# AI Engine Configuration
DEFAULT_AI_ENGINE=gemini
ENABLE_GEMINI=true

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

## Deployment Steps

### 1. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy to Firebase
firebase deploy
```

### 2. Environment Configuration
```bash
# Copy production environment template
cp config/production.env.example .env

# Edit with your actual values
nano .env
```

### 3. Security Configuration
- Update all API keys in `.env`
- Set strong JWT and session secrets
- Configure CORS origin for your domain
- Review rate limiting settings

### 4. Performance Optimization
- Enable compression (already configured)
- Set up CDN (Firebase Hosting provides this)
- Configure caching headers
- Monitor memory usage

### 5. Monitoring Setup
- Logs are written to `logs/` directory
- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- Set up log rotation

## Production Features

### Security Features
- ✅ Rate limiting (general and analysis endpoints)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Environment variable protection

### Performance Features
- ✅ Gzip compression
- ✅ Static file caching
- ✅ CDN via Firebase Hosting
- ✅ Memory usage monitoring
- ✅ Response time tracking

### Monitoring Features
- ✅ Winston logging
- ✅ Performance metrics
- ✅ Health check endpoints
- ✅ Error tracking
- ✅ Request/response logging

### Testing Features
- ✅ Jest test suite
- ✅ Security tests
- ✅ Performance tests
- ✅ Coverage reporting
- ✅ CI/CD pipeline

## Health Checks

### Basic Health Check
```bash
curl http://yourdomain.com/health
```

### Metrics Check
```bash
curl http://yourdomain.com/metrics
```

### Automated Health Check
```bash
npm run health
```

## Monitoring & Maintenance

### Log Monitoring
```bash
# View real-time logs
npm run logs

# View error logs only
tail -f logs/error.log
```

### Performance Monitoring
- Check `/metrics` endpoint regularly
- Monitor memory usage trends
- Track response times
- Set up alerts for high error rates

### Security Monitoring
- Review access logs regularly
- Monitor rate limiting triggers
- Check for unusual request patterns
- Update dependencies regularly

## Troubleshooting

### Common Issues

1. **Rate Limiting Issues**
   - Check rate limit configuration
   - Adjust limits if needed
   - Monitor for abuse

2. **Memory Issues**
   - Check memory usage in metrics
   - Restart application if needed
   - Investigate memory leaks

3. **AI Engine Failures**
   - Check API key validity
   - Monitor API quotas
   - Check network connectivity

4. **Firebase Issues**
   - Verify Firebase configuration
   - Check authentication setup
   - Monitor Firebase quotas

### Debug Mode
Set `LOG_LEVEL=debug` in `.env` for detailed logging.

## Scaling Considerations

### Horizontal Scaling
- Use Firebase Functions for auto-scaling
- Implement load balancing
- Consider database scaling

### Vertical Scaling
- Monitor memory usage
- Upgrade server resources as needed
- Optimize code for better performance

## Security Checklist

- [ ] All API keys secured
- [ ] Environment variables protected
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation active
- [ ] CORS properly configured
- [ ] Dependencies updated
- [ ] Security audit passed

## Backup & Recovery

### Data Backup
- Firebase data is automatically backed up
- Export user data regularly
- Backup configuration files

### Recovery Procedures
- Document rollback procedures
- Test recovery processes
- Maintain backup copies

## Support

For production issues:
1. Check logs first
2. Review metrics
3. Test health endpoints
4. Check Firebase status
5. Contact support team

## Updates & Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security settings quarterly
- Monitor performance metrics weekly
- Backup data monthly

### Emergency Procedures
- Document incident response
- Maintain rollback procedures
- Keep emergency contacts updated
