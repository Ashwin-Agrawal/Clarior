# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Clarior, please email security@clarior.com with:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if available)

**Do NOT** disclose the vulnerability publicly until we've had a chance to fix it.

## Security Best Practices

### Backend
1. ✅ Use HTTPS only in production
2. ✅ Keep dependencies updated
3. ✅ Use environment variables for secrets (never commit .env)
4. ✅ Implement rate limiting on sensitive endpoints
5. ✅ Use HTTP-only, Secure, SameSite cookies
6. ✅ Validate and sanitize all user inputs
7. ✅ Use strong password requirements
8. ✅ Implement CORS properly
9. ✅ Use helmet.js for security headers
10. ✅ Log security events
11. ✅ Implement proper error handling (don't expose stack traces)
12. ✅ Use transactions for financial operations
13. ✅ Implement brute force protection

### Frontend
1. ✅ Never store sensitive data in localStorage
2. ✅ Use HTTPS only in production
3. ✅ Keep dependencies updated
4. ✅ Sanitize user inputs before display
5. ✅ Use Content Security Policy headers
6. ✅ Validate data client-side and server-side
7. ✅ Never expose API keys or secrets
8. ✅ Use secure authentication cookies
9. ✅ Implement proper error handling
10. ✅ Use security headers (X-Frame-Options, X-Content-Type-Options, etc)

## Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] DATABASE_URL uses a strong password
- [ ] JWT_SECRET is at least 32 characters and randomly generated
- [ ] ADMIN credentials are changed from defaults
- [ ] NODE_ENV is set to 'production'
- [ ] CORS_ORIGINS is configured for your domain only
- [ ] HTTPS is enforced
- [ ] Rate limiting is active
- [ ] Logging is enabled
- [ ] Error handling doesn't expose sensitive details
- [ ] Test routes are disabled in production
- [ ] API keys (Razorpay, Google) are from production accounts
- [ ] Database backups are configured
- [ ] SSL certificate is valid
- [ ] Security headers are set
- [ ] HSTS header is enabled

## Known Limitations

- Payment processing relies on Razorpay. Ensure their security policies are followed.
- Google OAuth credentials must be kept secure and rotated regularly
- UPI transactions cannot be verified in real-time and require manual approval

## Version History

- v1.0.0 (2026-04-28) - Initial security audit and fixes
