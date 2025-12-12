# 🚀 Deploy to Vercel - Complete Guide

## Why Vercel Instead of Render?

**Problem**: Render's network is blocking OpenAI API connections (ECONNRESET errors)
**Solution**: Vercel has excellent connectivity to OpenAI and is the recommended platform for Next.js

---

## 📋 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional but Recommended)

```powershell
npm install -g vercel
```

### Step 2: Deploy Using Vercel Website (Easiest)

1. **Go to**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click**: "Add New..." → "Project"
4. **Import** your GitHub repository: `sumukhbendre123/Remotion-Captioning-Platform`
5. **Configure** the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" section and add:

   ```
   OPENAI_API_KEY = YOUR-OPENAI-API-KEY-HERE
   ```

   ```
   USE_MOCK_CAPTIONS = false
   ```

   ```
   NODE_ENV = production
   ```

7. **Click**: "Deploy"
8. **Wait**: 2-3 minutes for deployment

---

## 🎯 Alternative: Deploy Using CLI

If you prefer using the command line:

```powershell
# Navigate to project directory
cd d:\Desktop\project\task2\Remotion-Captioning-Platform

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? remotion-captioning-platform
# - Directory? ./
# - Override settings? No

# After deployment, add environment variables:
vercel env add OPENAI_API_KEY production
# Paste: YOUR-OPENAI-API-KEY-HERE

vercel env add USE_MOCK_CAPTIONS production
# Enter: false

vercel env add NODE_ENV production
# Enter: production

# Redeploy with environment variables:
vercel --prod
```

---

## ✅ Verify Deployment

### Test 1: Check if Site is Live
Visit your Vercel URL (something like `https://remotion-captioning-platform.vercel.app`)

### Test 2: Test OpenAI Connection
Visit: `https://your-app.vercel.app/api/test-openai`

**Expected Response:**
```json
{
  "success": true,
  "message": "OpenAI API connection successful",
  "apiKeyPresent": true,
  "modelsCount": 50+
}
```

### Test 3: Test Caption Generation
1. Go to your Vercel URL
2. Upload a video
3. Click "Generate Captions"
4. **Should work perfectly!** No ECONNRESET errors on Vercel

---

## 🔧 Troubleshooting

### Issue: "Build Failed"
- Check the build logs in Vercel dashboard
- Usually auto-resolves - Vercel is very good at detecting Next.js projects

### Issue: "Environment Variables Not Set"
- Go to Vercel dashboard → Your Project → Settings → Environment Variables
- Add the 3 variables listed above
- Click "Redeploy" from the Deployments tab

### Issue: "Function Execution Timeout"
- Already configured in `vercel.json` (300s timeout)
- Should be fine for video processing

### Issue: OpenAI API Key Invalid
- Get a new key from: https://platform.openai.com/api-keys
- Update in Vercel dashboard → Settings → Environment Variables
- Redeploy

---

## 📊 Vercel vs Render Comparison

| Feature | Vercel ✅ | Render ❌ |
|---------|----------|----------|
| OpenAI API Access | Excellent | Blocked (ECONNRESET) |
| Next.js Optimization | Native | Generic |
| Deploy Speed | 2-3 min | 5-10 min |
| Free Tier | Generous | Limited |
| Environment Variables | Easy | Easy |
| Custom Domains | Free | Paid |

---

## 🎉 What to Expect After Vercel Deployment

1. ✅ **OpenAI API will work** - No more ECONNRESET errors
2. ✅ **Faster builds** - Vercel is optimized for Next.js
3. ✅ **Automatic previews** - Every git push creates a preview URL
4. ✅ **Better performance** - Edge network, faster loading
5. ✅ **Real AI captions** - Your critical feature will work!

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Documentation**: https://vercel.com/docs
- **Your GitHub Repo**: https://github.com/sumukhbendre123/Remotion-Captioning-Platform
- **OpenAI Platform**: https://platform.openai.com

---

## 🚨 IMPORTANT: After Vercel Deployment

1. **Test immediately** with a real video upload
2. **Check logs** in Vercel dashboard (should show successful OpenAI calls)
3. **Celebrate** 🎉 - Your app will finally work with real AI captions!

---

## ⚡ Quick Deploy Checklist

- [ ] Go to vercel.com
- [ ] Sign in with GitHub
- [ ] Import repository
- [ ] Add 3 environment variables (OPENAI_API_KEY, USE_MOCK_CAPTIONS, NODE_ENV)
- [ ] Click Deploy
- [ ] Wait 2-3 minutes
- [ ] Test /api/test-openai endpoint
- [ ] Upload video and generate captions
- [ ] Verify real AI captions work!

---

**Ready to deploy? Let me know when you've deployed to Vercel and I'll help test it!** 🚀
