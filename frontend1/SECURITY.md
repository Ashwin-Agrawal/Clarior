# Frontend Security Guidelines

## Security Best Practices

### 1. Authentication & Authorization
- ✅ Authentication tokens are stored in HTTP-only cookies (NOT localStorage)
- ✅ Cookies have `Secure` and `SameSite=strict` flags
- ✅ JWT tokens expire after 24 hours
- ✅ Protected routes require authentication
- ✅ Role-based access control implemented

### 2. API Security
- ✅ All API calls use HTTPS in production
- ✅ CORS is properly configured
- ✅ Axios interceptors handle 401 unauthorized responses
- ✅ Request timeout is set to 30 seconds
- ✅ X-Requested-With header prevents CSRF

### 3. Input Validation
- ✅ All user inputs are validated on client-side
- ✅ Server-side validation is also required
- ✅ No eval() or innerHTML with user content
- ✅ URLs are validated before navigation
- ✅ Email addresses are validated

### 4. XSS Prevention
- ✅ React JSX automatically escapes content
- ✅ No dangerouslySetInnerHTML used
- ✅ Content Security Policy headers configured
- ✅ No external scripts loaded from untrusted sources
- ✅ Input sanitization on both client and server

### 5. Environment Variables
- ✅ Never commit .env files
- ✅ Only non-sensitive config in .env (API URL, Razorpay public key)
- ✅ Use .env.example for documentation

### 6. Dependency Management
- ✅ Keep dependencies up to date: `npm audit`
- ✅ Review new dependencies before installation
- ✅ Lock file (package-lock.json) should be committed

### 7. Data Protection
- ✅ Sensitive data (passwords, tokens) never logged
- ✅ UPI IDs encrypted on backend
- ✅ Payment data not stored locally
- ✅ No PII exposed in error messages

### 8. Error Handling
- ✅ User-friendly error messages shown to users
- ✅ Detailed errors logged server-side only
- ✅ No stack traces exposed to frontend
- ✅ Proper HTTP status codes used

## Common Vulnerabilities & Mitigations

### XSS (Cross-Site Scripting)
**Prevented by:**
- React's automatic escaping
- CSP headers
- No innerHTML usage
- Input validation

### CSRF (Cross-Site Request Forgery)
**Prevented by:**
- SameSite=strict cookies
- CORS configuration
- X-Requested-With headers

### Brute Force
**Prevented by:**
- Rate limiting on login endpoint (5 attempts per 15 min)
- Account lockout after multiple failures (backend)

### Man-in-the-Middle (MitM)
**Prevented by:**
- HTTPS enforcement in production
- Secure and HttpOnly flags on cookies
- HSTS headers

## Deployment Checklist

- [ ] NODE_ENV is set to 'production'
- [ ] All environment variables are configured
- [ ] VITE_API_URL points to production backend
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly
- [ ] Content-Security-Policy header is set
- [ ] Source maps are disabled (sourcemap: false)
- [ ] Code is minified
- [ ] All dependencies are up to date
- [ ] No console logs with sensitive data
- [ ] Error boundaries are implemented
- [ ] Loading and error states handled properly

## Testing Security

### Manual Testing
1. Try logging in with invalid credentials
2. Attempt to access protected routes without login
3. Try to modify other users' data
4. Test payment flow with test credentials
5. Check browser developer tools for exposed data

### Automated Testing
- Run `npm audit` to check for vulnerable dependencies
- Use OWASP ZAP or similar for penetration testing
- Test with different browsers and devices

## Reporting Security Issues

If you find a security vulnerability in the frontend, please email:
**security@clarior.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix

**Do NOT** publicly disclose vulnerabilities before we can fix them.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
