# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

**CRITICAL**: Complete this checklist before deploying to production. **DO NOT skip any items.**

---

## PHASE 1: ENVIRONMENT CONFIGURATION ✅

### Backend .env Configuration
- [ ] Generate NEW JWT_SECRET (32+ random chars): `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set NODE_ENV=production
- [ ] Configure MONGO_URI with production database
- [ ] Set ADMIN_EMAIL to your email
- [ ] Set ADMIN_PASSWORD to strong password (minimum 8 chars with uppercase, lowercase, number, special char)
- [ ] Set RAZORPAY_KEY to production key (not test key)
- [ ] Set RAZORPAY_SECRET to production secret
- [ ] Configure GOOGLE_CLIENT_ID for production app
- [ ] Configure GOOGLE_CLIENT_SECRET
- [ ] Set GOOGLE_REDIRECT_URI to your production domain
- [ ] Set CORS_ORIGINS to your production domain(s) only

### Frontend .env Configuration
- [ ] Set VITE_API_URL=https://yourdomain.com/api (use HTTPS)
- [ ] Set VITE_RAZORPAY_KEY to production public key (NOT secret)

### Verify .env Files
- [ ] backend/.env file exists and is NOT committed to git
- [ ] backend/.env.example file exists with placeholders
- [ ] frontend1/.env file configured (if created)
- [ ] frontend1/.env.example file exists
- [ ] .gitignore includes .env files

---

## PHASE 2: SECURITY VERIFICATION ✅

### Secrets & Credentials
- [ ] No hardcoded secrets in code
- [ ] All API keys from production accounts
- [ ] JWT_SECRET is strong and unique
- [ ] Admin password is strong (8+ chars, mixed case, number, special char)
- [ ] MongoDB password is strong
- [ ] All secrets in .env file only

### Code Security
- [ ] No console.log() with sensitive data
- [ ] No passwords in comments or code
- [ ] No test/debug code in production
- [ ] Error messages don't expose stack traces
- [ ] No eval() or dangerous functions
- [ ] All user inputs validated

### Dependencies
- [ ] Run `npm audit` - no critical vulnerabilities
- [ ] All dependencies are up to date
- [ ] No known vulnerabilities in packages
- [ ] Lock file (package-lock.json) is committed

### SSL/TLS
- [ ] SSL certificate installed on server
- [ ] Certificate is valid and not expired
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header is enabled

---

## PHASE 3: DATABASE SETUP ✅

### MongoDB
- [ ] Production MongoDB instance created
- [ ] Database user created with strong password
- [ ] Only app server has access to database
- [ ] Connection string uses authentication
- [ ] Database name is set correctly
- [ ] Backups are configured

### Database Backup
- [ ] Automated daily backups configured
- [ ] Backup restoration tested
- [ ] Backups stored in secure location
- [ ] Backup retention policy defined (30+ days)

---

## PHASE 4: SERVER SETUP ✅

### Linux/Server
- [ ] OS is updated with latest patches
- [ ] Firewall configured (only open necessary ports)
- [ ] SSH key-based authentication enabled
- [ ] Default passwords changed
- [ ] Unnecessary services disabled
- [ ] DDoS protection configured

### Node.js Application
- [ ] Node.js LTS version installed
- [ ] npm dependencies installed: `npm install --production`
- [ ] Application runs without errors
- [ ] Logging configured
- [ ] Process manager (PM2/systemd) configured
- [ ] Application starts on server reboot

### Frontend Deployment
- [ ] Frontend built: `npm run build`
- [ ] dist/ folder uploaded to web server
- [ ] Web server configured to serve frontend
- [ ] Assets cached properly
- [ ] CDN configured for static files (if applicable)

---

## PHASE 5: APPLICATION TESTING ✅

### Authentication Flow
- [ ] User can register with valid data
- [ ] Registration rejects invalid data
- [ ] User can login with correct credentials
- [ ] Login rejects incorrect credentials
- [ ] Password requirements enforced
- [ ] Session persists across browser refresh
- [ ] Logout clears authentication
- [ ] Protected routes require authentication

### User Roles
- [ ] Student can access student features
- [ ] Senior can access senior features
- [ ] Unverified senior cannot book sessions
- [ ] Admin can access admin dashboard
- [ ] Users cannot access other roles' features

### Payment Flow
- [ ] Payment page loads without errors
- [ ] Razorpay checkout opens
- [ ] Payment succeeds with valid test card
- [ ] Credits are added after successful payment
- [ ] Duplicate payments are rejected
- [ ] Payment webhook received correctly

### Booking Flow
- [ ] Senior can create slots
- [ ] Student can see available slots
- [ ] Student can book slots with credits
- [ ] Student cannot book without credits
- [ ] Booking confirmation sent
- [ ] Senior receives booking notification

### Admin Functions
- [ ] Admin can view all users
- [ ] Admin can verify seniors
- [ ] Admin can grant credits
- [ ] Admin actions are logged

### Error Handling
- [ ] Database errors handled gracefully
- [ ] Network errors handled gracefully
- [ ] Invalid input shows user-friendly message
- [ ] No stack traces exposed
- [ ] Error pages load correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] API responses < 1 second
- [ ] Database queries are optimized
- [ ] No memory leaks
- [ ] Server CPU usage < 80%

---

## PHASE 6: SECURITY TESTING ✅

### Injection Prevention
- [ ] SQL injection attempts blocked
- [ ] NoSQL injection attempts blocked
- [ ] Command injection attempts blocked
- [ ] XSS attempts blocked

### Authentication Security
- [ ] Cookies have HttpOnly flag
- [ ] Cookies have Secure flag
- [ ] Cookies have SameSite=strict
- [ ] JWT expiry is 24 hours
- [ ] Expired tokens rejected

### Rate Limiting
- [ ] Login endpoint rate limited (5 per 15 min)
- [ ] Password reset rate limited
- [ ] API endpoint rate limited (100 per 15 min)
- [ ] DDoS protection active

### Authorization
- [ ] Users can't access other users' data
- [ ] Users can't bypass role checks
- [ ] Admin endpoints require admin role
- [ ] Protected routes properly validated

### CORS
- [ ] CORS allows only your domain
- [ ] Preflight requests handled correctly
- [ ] Cross-origin cookies working

### Headers
- [ ] Content-Security-Policy header set
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection header set

---

## PHASE 7: MONITORING & LOGGING ✅

### Logging
- [ ] Application logs configured
- [ ] Logs stored in secure location
- [ ] Log rotation configured
- [ ] Sensitive data not logged
- [ ] Log aggregation configured (optional)

### Error Tracking
- [ ] Error tracking service configured (Sentry/etc)
- [ ] Errors are reported and tracked
- [ ] Alert notifications sent on errors

### Performance Monitoring
- [ ] Performance metrics collected
- [ ] Database performance monitored
- [ ] API response times tracked
- [ ] Server resources monitored (CPU, memory, disk)

### Uptime Monitoring
- [ ] Uptime monitoring service active
- [ ] Alerts configured for downtime
- [ ] Health check endpoint responds

### Security Monitoring
- [ ] Failed login attempts logged
- [ ] Admin actions logged
- [ ] Payment transactions logged
- [ ] Suspicious activity alerts

---

## PHASE 8: BACKUP & DISASTER RECOVERY ✅

### Backups
- [ ] Automated daily backups configured
- [ ] Backup tested and restored successfully
- [ ] Backup retention policy: 30+ days
- [ ] Backups encrypted and stored securely
- [ ] Multiple backup locations (redundancy)

### Recovery Plan
- [ ] Recovery procedure documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined
- [ ] Recovery tested quarterly

### Documentation
- [ ] Architecture documented
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed

---

## PHASE 9: FINAL VERIFICATION ✅

### Pre-Launch Checklist
- [ ] All environment variables set
- [ ] All secrets properly configured
- [ ] Database backup working
- [ ] Monitoring active
- [ ] Logging active
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security tests passed
- [ ] No console errors in browser
- [ ] No errors in application logs

### Team Sign-Off
- [ ] Development lead approval
- [ ] DevOps/Infrastructure approval
- [ ] Security review approval
- [ ] CEO/Founder approval

---

## PHASE 10: DEPLOYMENT & LAUNCH ✅

### Deployment
1. [ ] Final backup taken
2. [ ] Frontend built and tested
3. [ ] Frontend deployed to production
4. [ ] Backend dependencies installed
5. [ ] Backend deployed to production
6. [ ] Database migrations run (if any)
7. [ ] Admin user seeded (first time only)
8. [ ] Application started
9. [ ] Health checks pass
10. [ ] SSL certificate verified

### Post-Launch
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user activity
- [ ] Verify all features working
- [ ] Test critical user flows
- [ ] Check payment integration working
- [ ] Monitor server resources
- [ ] Be ready to rollback if issues

---

## PHASE 11: ONGOING SECURITY ✅

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Monitor performance metrics
- [ ] Monthly: Run security audit (`npm audit`)
- [ ] Monthly: Review and update dependencies
- [ ] Monthly: Rotate sensitive secrets
- [ ] Quarterly: Test disaster recovery
- [ ] Quarterly: Security penetration test
- [ ] Yearly: Full security audit

### Security Updates
- [ ] Subscribe to Node.js security alerts
- [ ] Subscribe to npm security alerts
- [ ] Subscribe to MongoDB security alerts
- [ ] Subscribe to Razorpay security alerts
- [ ] Review updates before applying
- [ ] Test updates in staging first
- [ ] Apply security patches promptly

---

## TROUBLESHOOTING

### Common Issues
| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS_ORIGINS in .env |
| 401 errors | Verify JWT_SECRET is correct |
| Database connection failed | Check MONGO_URI and network access |
| Payment not working | Verify Razorpay keys are production keys |
| Emails not sending | Configure email service (if using) |
| Logs not appearing | Check log path and permissions |

### Emergency Contacts
- **Security Issues**: security@clarior.com
- **DevOps**: devops@clarior.com
- **On-Call Support**: +1-XXX-XXX-XXXX

---

## CRITICAL REMINDERS

⚠️ **DO NOT**:
- Commit .env files to git
- Use test API keys in production
- Use default/weak passwords
- Ignore security warnings
- Deploy without backups
- Skip SSL/HTTPS setup

✅ **DO**:
- Use strong, unique secrets
- Enable monitoring and logging
- Test disaster recovery regularly
- Keep dependencies updated
- Review security logs
- Have incident response plan

---

**Date Deployed**: _________________
**Deployed By**: _________________
**Approval By**: _________________

**Status**: ⏳ PENDING DEPLOYMENT → ✅ LIVE

---

For detailed information, see:
- [SECURITY.md](/SECURITY.md) - Security policies
- [DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md) - Detailed deployment steps
- [SECURITY_AUDIT_REPORT.md](/SECURITY_AUDIT_REPORT.md) - Full audit report
