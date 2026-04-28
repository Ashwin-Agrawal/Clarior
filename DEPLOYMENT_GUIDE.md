# Deployment Guide - Production Security Checklist

This guide ensures your Clarior platform is secure before going live.

## Pre-Deployment Security Checklist

### Environment Configuration

#### Backend (.env file)
```bash
# ⚠️ CRITICAL: Generate strong secrets
NODE_ENV=production
PORT=3002

# 🔐 Database - Use a strong password!
MONGO_URI=mongodb+srv://username:STRONG_PASSWORD@cluster.mongodb.net/clarior-prod

# 🔐 JWT - Generate random 32+ character string
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 🔐 Admin - Change these from defaults!
ADMIN_NAME=Admin Name
ADMIN_EMAIL=your-admin-email@yourdomain.com
ADMIN_PASSWORD=GenerateStrongPassword@123

# 🔐 Payment Gateway
RAZORPAY_KEY=your_production_razorpay_key_id
RAZORPAY_SECRET=your_production_razorpay_secret_key

# 🔐 Google OAuth - Use production credentials only
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google/callback
GOOGLE_CALENDAR_ID=primary

# 🔐 CORS - Only allow your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Frontend (.env file)
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY=your_production_razorpay_public_key
```

### Security Hardening

#### 1. HTTPS/SSL Setup
- [ ] Purchase/obtain SSL certificate
- [ ] Install certificate on server
- [ ] Redirect HTTP to HTTPS
- [ ] Enable HSTS header
- [ ] Certificate expires in: _______ (set reminder)

#### 2. Database Security
- [ ] Change MongoDB default password
- [ ] Enable MongoDB authentication
- [ ] Restrict MongoDB access to app server only
- [ ] Enable MongoDB encryption at rest
- [ ] Configure MongoDB backup
- [ ] Test backup restoration

#### 3. Server Security
- [ ] Update OS and all packages
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Configure rate limiting (backend handles this)
- [ ] Set up monitoring and alerts
- [ ] Configure log rotation
- [ ] Disable unnecessary services

#### 4. Application Security
- [ ] Verify NODE_ENV=production
- [ ] Confirm all .env variables are set
- [ ] Test authentication flows
- [ ] Test payment flows
- [ ] Run security dependency check: `npm audit`
- [ ] No console.logs with sensitive data
- [ ] Error messages don't expose stack traces
- [ ] Test routes disabled in production
- [ ] Admin endpoints require authentication

#### 5. Code Review
- [ ] Remove any hardcoded credentials
- [ ] Check for console.log() statements
- [ ] Verify no sensitive data in comments
- [ ] Review error handling
- [ ] Check input validation
- [ ] Verify SQL/NoSQL injection protection

#### 6. API Security
- [ ] Test CORS configuration
- [ ] Verify rate limiting works
- [ ] Test authentication with expired token
- [ ] Test authorization (role-based access)
- [ ] Verify payment signature validation
- [ ] Test with invalid inputs
- [ ] Check response headers

#### 7. Frontend Deployment
- [ ] Build frontend: `npm run build`
- [ ] Verify source maps disabled
- [ ] Check bundle size
- [ ] Test in production build mode
- [ ] Verify environment variables are not exposed
- [ ] Test all critical user flows
- [ ] Check browser console for errors

### Performance & Monitoring

#### 1. Performance
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize database queries (add indexes)
- [ ] Test load times
- [ ] Monitor memory usage
- [ ] Set up performance monitoring

#### 2. Monitoring & Logging
- [ ] Configure application logging
- [ ] Set up error tracking (Sentry/similar)
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Monitor payment webhook delivery

#### 3. Backups & Disaster Recovery
- [ ] Configure automated database backups
- [ ] Test backup restoration
- [ ] Document recovery procedure
- [ ] Store backups in secure location
- [ ] Document backup retention policy
- [ ] Encrypt backups

### Testing

#### 1. Authentication Testing
- [ ] ✓ Login with valid credentials
- [ ] ✓ Login fails with invalid credentials
- [ ] ✓ Cannot access protected routes without login
- [ ] ✓ Session expires after 24 hours
- [ ] ✓ Logout clears authentication

#### 2. Authorization Testing
- [ ] ✓ Students cannot access admin endpoints
- [ ] ✓ Seniors can only edit their own profile
- [ ] ✓ Unverified seniors cannot book sessions
- [ ] ✓ Admin can manage users

#### 3. Payment Testing
- [ ] ✓ Payment flow works end-to-end
- [ ] ✓ Credits are added after successful payment
- [ ] ✓ Duplicate payments are rejected
- [ ] ✓ Payment signature verification works

#### 4. Data Validation Testing
- [ ] ✓ Invalid email rejected
- [ ] ✓ Short password rejected
- [ ] ✓ Long inputs truncated/rejected
- [ ] ✓ Special characters handled correctly
- [ ] ✓ SQL injection attempts blocked
- [ ] ✓ XSS attempts blocked

#### 5. Security Testing
- [ ] ✓ CORS works correctly
- [ ] ✓ Rate limiting works
- [ ] ✓ Cookies are HTTP-only and Secure
- [ ] ✓ No sensitive data in logs
- [ ] ✓ Error messages don't expose details
- [ ] ✓ Security headers present

### Post-Deployment

#### 1. Monitoring
- [ ] Set up 24/7 monitoring
- [ ] Configure alerting
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Monitor payment transactions
- [ ] Check user feedback

#### 2. Security
- [ ] Regularly update dependencies
- [ ] Run security audits monthly
- [ ] Review access logs
- [ ] Audit user actions (especially admin)
- [ ] Update SSL certificates before expiry
- [ ] Rotate secrets periodically

#### 3. Maintenance
- [ ] Document deployment procedure
- [ ] Document rollback procedure
- [ ] Test disaster recovery quarterly
- [ ] Update documentation
- [ ] Keep contact information updated
- [ ] Schedule regular backups

#### 4. Updates & Patches
- [ ] Subscribe to security alerts
- [ ] Test updates in staging first
- [ ] Plan maintenance windows
- [ ] Document all changes
- [ ] Have rollback plan

### Incident Response

In case of security incident:
1. Isolate affected systems
2. Notify users if data compromised
3. Gather logs and evidence
4. Document timeline
5. Fix vulnerability
6. Review and prevent future incidents

### Emergency Contacts

- Security Team: security@clarior.com
- DevOps Lead: _________________
- Database Admin: _________________
- On-call Support: _________________

### Sign-Off

- [ ] Development Lead: _________________ Date: _______
- [ ] DevOps/Infrastructure: _________________ Date: _______
- [ ] Security Review: _________________ Date: _______
- [ ] CEO/Founder: _________________ Date: _______

---

## Quick Deployment Commands

```bash
# Backend
cd backend
npm install --production
NODE_ENV=production npm start

# Frontend
cd frontend1
npm install --production
npm run build
# Deploy dist/ folder to web server

# Verify deployment
curl https://yourdomain.com/api
```

## Troubleshooting

### Common Issues
1. CORS errors → Check CORS_ORIGINS in backend .env
2. 401 Unauthorized → Verify JWT_SECRET is same in all instances
3. Payment failing → Check Razorpay credentials are production keys
4. Database connection error → Verify MONGO_URI and network access

### Getting Help
- Check logs: `pm2 logs`
- Check database connectivity
- Verify environment variables
- Contact security team for suspicious activity
