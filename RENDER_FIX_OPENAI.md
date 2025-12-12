# 🔧 CRITICAL FIX: OpenAI API Not Working on Render

## ⚠️ THE PROBLEM
You're getting: `Unable to connect to OpenAI API. Server may be experiencing network issues or OpenAI service may be unavailable.`

**ROOT CAUSE**: Environment variables are NOT set on Render. The `.env.local` file is ONLY for local development and is NOT deployed to Render.

---

## ✅ SOLUTION: Add Environment Variables to Render

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Click on your service: **remotion-captioning-platform-1** (or whatever your service is named)

### Step 2: Navigate to Environment Tab
1. Click on **"Environment"** in the left sidebar
2. You should see a section called **"Environment Variables"**

### Step 3: Add Environment Variables
Click **"Add Environment Variable"** and add these THREE variables:

#### Variable 1: OPENAI_API_KEY
```
Key:   OPENAI_API_KEY
Value: YOUR-OPENAI-API-KEY-HERE
```

#### Variable 2: USE_MOCK_CAPTIONS
```
Key:   USE_MOCK_CAPTIONS
Value: false
```

#### Variable 3: NODE_ENV
```
Key:   NODE_ENV
Value: production
```

### Step 4: Save and Deploy
1. Click **"Save Changes"** button
2. Render will **automatically redeploy** your service
3. Wait **3-5 minutes** for deployment to complete

---

## 🧪 TEST THE FIX

### After deployment completes, test in this order:

#### Test 1: Check Environment Variables
Visit: `https://remotion-captioning-platform-1.onrender.com/api/test-openai`

**Expected Response:**
```json
{
  "success": true,
  "message": "OpenAI API connection successful",
  "apiKeyPresent": true,
  "apiKeyPrefix": "sk-proj-iyXlA1u4ZeFls",
  "modelsCount": 50+,
  "env": {
    "USE_MOCK_CAPTIONS": "false",
    "NODE_ENV": "production"
  }
}
```

**If you get an error**, the environment variables are NOT set correctly. Go back to Step 3.

#### Test 2: Test Caption Generation
1. Go to: `https://remotion-captioning-platform-1.onrender.com`
2. Upload a video file
3. Click "Generate Captions"
4. Should work without errors!

---

## 🚨 COMMON MISTAKES

### ❌ Mistake 1: Adding API key to vercel.json
- `vercel.json` is ONLY for Vercel deployment
- Render does NOT read `vercel.json`
- You MUST add variables in Render dashboard

### ❌ Mistake 2: Thinking .env.local is deployed
- `.env.local` is in `.gitignore`
- It NEVER gets pushed to GitHub
- It NEVER gets deployed to Render
- You MUST add variables in Render dashboard

### ❌ Mistake 3: Using wrong syntax
- Don't use `@openai-api-key` syntax in Render
- That's Vercel secret syntax
- In Render, paste the FULL API key directly

### ❌ Mistake 4: Not waiting for redeploy
- After adding env vars, Render MUST redeploy
- It takes 3-5 minutes
- Don't test until deployment is complete

---

## 📋 CHECKLIST

Before testing, ensure:

- [ ] Logged into Render dashboard
- [ ] Found your service (remotion-captioning-platform-1)
- [ ] Clicked "Environment" tab
- [ ] Added OPENAI_API_KEY with full key value
- [ ] Added USE_MOCK_CAPTIONS = false
- [ ] Added NODE_ENV = production
- [ ] Clicked "Save Changes"
- [ ] Waited for automatic redeploy to complete (check "Events" tab)
- [ ] Deployment shows "Live" status
- [ ] Tested /api/test-openai endpoint
- [ ] Tested caption generation

---

## 🔍 DEBUGGING

### If /api/test-openai returns error:

**Error: "OPENAI_API_KEY not set"**
- Environment variable is missing
- Go back and add it in Render dashboard

**Error: "Invalid API key" or 401**
- API key is wrong or expired
- Get a new API key from: https://platform.openai.com/api-keys
- Update in Render dashboard

**Error: Network timeout/ECONNRESET**
- Render server cannot reach OpenAI
- This is rare - OpenAI might be down
- Check: https://status.openai.com
- Try redeploying

**Error: 429 Rate limit**
- Too many requests
- Wait a few minutes and try again
- Or upgrade OpenAI plan

### Check Render Logs:
1. Go to your service in Render
2. Click "Logs" tab
3. Look for these lines after adding env vars:
   ```
   Environment check:
   - OPENAI_API_KEY present: true
   - OPENAI_API_KEY prefix: sk-proj-iyXlA1u4ZeF
   ```

If you see `OPENAI_API_KEY present: false`, the environment variable is NOT set!

---

## 📞 NEXT STEPS

1. **RIGHT NOW**: Add the 3 environment variables in Render dashboard
2. **WAIT**: 3-5 minutes for redeploy
3. **TEST**: Visit /api/test-openai endpoint
4. **VERIFY**: Upload video and generate captions
5. **CELEBRATE**: OpenAI captions working! 🎉

---

## ⚡ QUICK REFERENCE

**Render Dashboard**: https://dashboard.render.com
**Your Service**: remotion-captioning-platform-1.onrender.com
**Test Endpoint**: /api/test-openai
**OpenAI Status**: https://status.openai.com
**Get New API Key**: https://platform.openai.com/api-keys

---

**Remember**: This is the MOST CRITICAL step. Without environment variables in Render, OpenAI will NEVER work, no matter what code changes we make!
