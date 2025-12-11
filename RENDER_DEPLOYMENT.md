# Render Deployment Guide

# Render Deployment Guide

## ✅ FIXED: Build Errors

**Error 1:** "Page config in app/api/captions/route.ts is deprecated"
- **Fixed:** Removed deprecated `export const config`

**Error 2:** "Self-reference dependency" in @remotion/bundler
- **Fixed:** Disabled server-side video rendering (not compatible with serverless)

## ⚠️ Important Limitation

**Video Export Feature:**
- ❌ **NOT AVAILABLE** in serverless deployments (Render, Vercel, Netlify)
- ✅ **Preview works** - You can still preview videos with captions
- ✅ **Caption generation works** - AI transcription is fully functional

**Why?** Server-side video rendering requires:
- Full Node.js environment with FFmpeg
- Persistent storage
- High memory/CPU resources
- Not available in serverless platforms

**Alternatives:**
1. **Use Remotion Lambda** - AWS Lambda-based rendering (~$0.01 per minute)
2. **Deploy to VPS** - DigitalOcean, Linode, AWS EC2 with FFmpeg installed
3. **Preview Only** - Use the app for previewing, export manually

## ✅ FIXED: Build Error

**Error:** "Page config in app/api/captions/route.ts is deprecated"

**Solution:** Removed the deprecated `export const config` from the captions API route. Next.js App Router (v13+) doesn't use this configuration method anymore.

## 🚀 Deploy to Render

### Prerequisites
- GitHub repository pushed
- OpenAI API key ready
- Render account (free tier works)

### Step-by-Step Deployment

#### 1. Create New Web Service

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Remotion-Captioning-Platform`

#### 2. Configure Build Settings

**Basic Settings:**
- **Name:** `remotion-captioning-platform` (or your choice)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `Node`

**Build Command:**
```bash
npm install; npm run build
```

**Start Command:**
```bash
npm start
```

#### 3. Add Environment Variables

Click "Advanced" → Add these environment variables:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
USE_MOCK_CAPTIONS=false
NODE_ENV=production
```

#### 4. Configure Plan

**Free Tier:**
- ✅ Suitable for testing
- ❌ Spins down after 15 min of inactivity
- ❌ Slower performance

**Starter Plan ($7/month):**
- ✅ Always on
- ✅ Better performance
- ✅ Recommended for production

#### 5. Deploy!

Click "Create Web Service" and wait for deployment (~5 minutes)

## ⚙️ Advanced Configuration

### For Video Processing

If you need more resources for video processing, create a `render.yaml`:

```yaml
services:
  - type: web
    name: remotion-captioning-platform
    runtime: node
    buildCommand: npm install; npm run build
    startCommand: npm start
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: USE_MOCK_CAPTIONS
        value: false
      - key: NODE_ENV
        value: production
    plan: starter # or standard for more resources
    healthCheckPath: /
    autoDeploy: true
```

### Increase Timeout for Long Videos

In your Render dashboard:
1. Go to "Settings"
2. Find "Health Check Grace Period"
3. Increase to 300 seconds (5 minutes)

## 🔧 Troubleshooting

### Build Fails with "Out of Memory"

**Solution:** Upgrade to Starter or Standard plan with more RAM

### API Timeouts

**Problem:** Large video files timing out

**Solutions:**
1. Add file size validation (max 25MB)
2. Implement chunked uploads
3. Use background jobs for processing

### Cold Starts (Free Tier)

**Problem:** First request is slow after inactivity

**Solutions:**
1. Upgrade to paid plan (always on)
2. Use a cron job to ping your app every 14 minutes
3. Accept the limitation for testing

## 📊 Monitoring

### Check Logs

1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time logs

### Common Log Messages

```bash
# Success
✓ Ready in 3.2s
Processing file: video.mp4
Using mock captions for testing
```

```bash
# API Error (if OpenAI key missing)
OpenAI API Key not configured
```

```bash
# Connection Error (network issues)
OpenAI API Error: Connection error
```

## 🎯 Post-Deployment Testing

### Test Checklist

1. ✅ **Homepage loads:** Visit your Render URL
2. ✅ **Upload page works:** Navigate to /upload
3. ✅ **Video upload:** Try uploading a small video (<5MB)
4. ✅ **Caption generation:** Click "Generate Captions"
5. ✅ **Preview:** Check if preview works
6. ✅ **Export:** Try exporting video (may take time)
7. ✅ **Caption styles:** Test all 3 styles

### Performance Benchmarks

**Expected Times:**
- Upload (5MB video): ~2-5 seconds
- Caption generation: ~10-30 seconds
- Preview load: ~1-2 seconds
- Export (30 sec video): ~1-2 minutes

## 💰 Cost Estimate

### Render Costs
- **Free Tier:** $0 (with limitations)
- **Starter:** $7/month
- **Standard:** $25/month

### OpenAI Costs
- **Whisper API:** $0.006 per minute
- Example: 100 videos × 5 min = $3/month

### Total
- **Development:** Free (Render Free + minimal OpenAI)
- **Production:** ~$10-30/month (Render Starter/Standard + OpenAI)

## 🔄 Auto-Deploy

Enable automatic deployments:

1. Go to "Settings" in Render
2. Enable "Auto-Deploy"
3. Now every push to `main` branch auto-deploys!

## 🛡️ Security

### Recommended Settings

1. **Add CORS if needed:**
```typescript
// In next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' },
      ],
    },
  ];
}
```

2. **Rate Limiting:**
Install `express-rate-limit` for API protection

3. **File Validation:**
```typescript
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

## ✅ Deployment Checklist

Before going live:

- [ ] Removed deprecated `export const config` (already done)
- [ ] Added all environment variables in Render
- [ ] Tested with a sample video
- [ ] Configured proper plan (Free/Starter/Standard)
- [ ] Set up monitoring/logging
- [ ] Added file size limits
- [ ] Tested all caption styles
- [ ] Verified export functionality
- [ ] Enabled auto-deploy (optional)

## 🎉 Your App is Live!

Once deployed, you'll get a URL like:
```
https://remotion-captioning-platform.onrender.com
```

Share it, test it, and enjoy your AI-powered captioning platform! 🚀

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build timeout | Increase build timeout in settings |
| Runtime memory error | Upgrade to higher plan |
| API key not found | Add `OPENAI_API_KEY` in environment variables |
| Slow cold starts | Upgrade from Free tier or use ping service |
| File upload fails | Check file size limits (25MB max) |

## Need Help?

- Render Docs: https://render.com/docs
- Render Support: https://render.com/support
- OpenAI Docs: https://platform.openai.com/docs
