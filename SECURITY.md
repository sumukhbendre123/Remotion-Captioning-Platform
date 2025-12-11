# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Public Disclose

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to the repository owner with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue

## Security Best Practices

### For Developers

1. **Environment Variables**

   - Never commit `.env` files
   - Use `.env.example` for templates
   - Rotate API keys regularly

2. **File Uploads**

   - Validate file types
   - Check file sizes
   - Sanitize filenames
   - Consider virus scanning

3. **API Security**

   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production
   - Implement authentication

4. **Dependencies**
   - Keep dependencies updated
   - Use `npm audit` regularly
   - Review security advisories

### For Users

1. **API Keys**

   - Keep OpenAI API keys private
   - Don't share `.env.local` files
   - Rotate keys if compromised

2. **Uploads**

   - Only upload trusted videos
   - Be aware of file size limits
   - Don't upload sensitive content

3. **Deployment**
   - Use HTTPS only
   - Enable firewall rules
   - Limit file upload sizes
   - Monitor for unusual activity

## Known Security Considerations

### File Upload

- Current max size: 100MB
- No virus scanning implemented
- Consider implementing in production

### API Rate Limiting

- Not currently implemented
- Recommended for production deployment

### Authentication

- No authentication required currently
- Recommended to add for production use

## Security Checklist for Production

- [ ] Enable HTTPS
- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Add virus scanning for uploads
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement CORS policies
- [ ] Add request validation
- [ ] Set up WAF (Web Application Firewall)

## Third-Party Security

This project uses:

- OpenAI API (governed by OpenAI's security policies)
- Next.js (maintained by Vercel)
- Remotion (open-source, community-maintained)

Please review their respective security policies.

## Updates

This security policy will be updated as needed. Last updated: December 11, 2025.
