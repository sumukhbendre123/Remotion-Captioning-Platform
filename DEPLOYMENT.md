# Deployment Instructions

## ✅ FIXED: Vercel Configuration Error

**Error:** "The `functions` property cannot be used in conjunction with the `builds` property"

**Solution:** Removed the `builds` property from `vercel.json`. Vercel auto-detects Next.js apps, so the `builds` property is not needed.

**What was changed in `vercel.json`:**
- ❌ Removed: `"version": 2` and `"builds"` array
- ✅ Kept: `"functions"`, `"env"`, and `"regions"`

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Git installed

## Local Development

1. Clone repository

```bash
git clone https://github.com/sumukhbendre123/Remotion-Captioning-Platform.git
cd Remotion-Captioning-Platform
```

2. Install dependencies

```bash
npm install
```

3. Setup environment

```bash
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY
```

4. Run development server

```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push to GitHub

```bash
git push origin main
```

2. Import to Vercel

- Go to https://vercel.com/new
- Import your GitHub repository
- Configure environment variables:
  - Add `OPENAI_API_KEY`
- Deploy

3. Configure Settings

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

4. Set Function Timeout

- Go to Project Settings → Functions
- Set Max Duration to 300 seconds (5 minutes)

### Option 2: Docker

1. Build image

```bash
docker build -t remotion-captions .
```

2. Run container

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key_here \
  remotion-captions
```

Or use docker-compose:

```bash
docker-compose up -d
```

### Option 3: Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Add `OPENAI_API_KEY`
4. Deploy

### Option 4: Railway

1. New Project → Deploy from GitHub
2. Add environment variable: `OPENAI_API_KEY`
3. Deploy automatically

### Option 5: AWS / DigitalOcean

1. Setup Node.js environment
2. Clone repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Setup PM2:

```bash
npm install -g pm2
pm2 start npm --name "remotion-captions" -- start
pm2 save
pm2 startup
```

6. Configure Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

Required:

- `OPENAI_API_KEY`: Your OpenAI API key

Optional:

- `NEXT_PUBLIC_API_URL`: Custom API URL
- `NODE_ENV`: Environment (development/production)

## Post-Deployment Checklist

- [ ] Test video upload
- [ ] Verify caption generation works
- [ ] Check video preview loads
- [ ] Test export functionality
- [ ] Verify all 3 caption styles work
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Setup analytics (optional)

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear node_modules and reinstall
- Verify all dependencies installed

### API Errors

- Verify OPENAI_API_KEY is set
- Check API key has credits
- Review server logs

### Memory Issues

- Increase server memory allocation
- Optimize video file sizes
- Use compression for uploads

## Monitoring

Recommended tools:

- Vercel Analytics
- Sentry for error tracking
- LogRocket for session replay

## Security

- Never commit .env files
- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting
- Sanitize file uploads
- Set CORS policies

## Scaling

For high traffic:

- Use CDN for static assets
- Implement Redis caching
- Queue system for exports (Bull/BullMQ)
- Separate video processing workers
- Database for user management
- S3 for video storage

## Support

For issues:

- Check GitHub Issues
- Review documentation
- Contact via email
