# 🔧 Fix OpenAI Connection on Deployment

## ❌ Current Error

```
500 Internal Server Error
Caption generation error: Unable to connect to OpenAI API
```

## ✅ Solution: Add Environment Variables to Your Deployment

### **CRITICAL:** `.env.local` is NOT deployed to the server!

The `.env.local` file is in `.gitignore` and stays on your computer. You must add environment variables in your deployment platform's dashboard.

---

## For Render Deployment

### Step 1: Go to Render Dashboard

1. Open https://dashboard.render.com
2. Click on your `remotion-captioning-platform` service
3. Go to **"Environment"** tab in the left sidebar

### Step 2: Add Environment Variables

Click **"Add Environment Variable"** and add these **THREE** variables:

**Variable 1:**

```
Key:   OPENAI_API_KEY
Value:
```

**Variable 2:**

```
Key:   USE_MOCK_CAPTIONS
Value: false
```

**Variable 3:**

```
Key:   NODE_ENV
Value: production
```

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will **automatically redeploy** your app
3. Wait 3-5 minutes for the deployment to complete

---

## For Vercel Deployment

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Click on your project
3. Go to **"Settings"** → **"Environment Variables"**

### Step 2: Add Environment Variables

Add these three variables for **ALL ENVIRONMENTS** (Production, Preview, Development):

**Variable 1:**

```
Name:  OPENAI_API_KEY
Value:
```

**Variable 2:**

```
Name:  USE_MOCK_CAPTIONS
Value: false
```

**Variable 3:**

```
Name:  NODE_ENV
Value: production
```

### Step 3: Redeploy

1. Click **"Save"**
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. OR: Push a commit to trigger auto-deploy

---

## Verify Environment Variables Are Loaded

After adding the variables, check if they're working:

### Method 1: Check Logs

**Render:**

- Go to "Logs" tab
- Look for: `"OpenAI API Key present: true"`

**Vercel:**

- Go to "Deployments" → Select latest → "Runtime Logs"
- Look for: `"OpenAI API Key present: true"`

### Method 2: Test API Endpoint

Visit: `https://your-app.onrender.com/api/test-env`

Should show:

```json
{
  "useMockCaptions": false,
  "hasApiKey": true,
  "apiKeyPrefix": "sk-proj-iyX..."
}
```

---

## Common Mistakes

### ❌ MISTAKE 1: Only setting in `.env.local`

- `.env.local` is **NOT uploaded** to the server
- It's in `.gitignore` for security
- **Must** add in deployment platform dashboard

### ❌ MISTAKE 2: Typo in variable names

- Must be exactly: `OPENAI_API_KEY` (not `OPENAI_KEY`)
- Must be exactly: `USE_MOCK_CAPTIONS` (not `MOCK_CAPTIONS`)

### ❌ MISTAKE 3: Not redeploying after adding variables

- Changes require a redeploy
- Render: Auto-redeploys when you save
- Vercel: Must manually redeploy or push new commit

### ❌ MISTAKE 4: Wrong environment selected (Vercel only)

- Must select "Production" environment
- OR select "All Environments"

---

## Test After Setup

1. **Go to your deployment URL:**

   - Render: `https://remotion-captioning-platform.onrender.com`
   - Vercel: `https://your-project.vercel.app`

2. **Upload a test video** (small file, < 5MB)

3. **Click "Generate Captions"**

4. **Should see:**

   ```
   ✓ Processing video
   ✓ Generating captions with AI
   ✓ Captions generated successfully!
   ```

5. **If it works:** ✅ You'll see real AI-generated captions!

6. **If it fails:** Check logs for error details

---

## Troubleshooting

### Error: "OpenAI API Key not configured"

**Cause:** Environment variable not set or wrong name

**Fix:**

1. Double-check variable name: `OPENAI_API_KEY`
2. Make sure you clicked "Save"
3. Redeploy the app

### Error: "Connection error" or "ECONNRESET"

**Cause:** Deployment platform's network blocking OpenAI

**Unlikely** - Render/Vercel can reach OpenAI servers (unlike your local machine)

**If it happens:**

1. Check OpenAI status: https://status.openai.com
2. Verify your API key is valid
3. Check OpenAI usage limits

### Error: "Invalid API key" (401)

**Cause:** API key is expired or incorrect

**Fix:**

1. Get new key: https://platform.openai.com/api-keys
2. Update environment variable
3. Redeploy

### Error: "Rate limit exceeded" (429)

**Cause:** Too many requests to OpenAI

**Fix:**

1. Wait a few minutes
2. Check OpenAI usage dashboard
3. Upgrade OpenAI plan if needed

---

## Quick Checklist

Before testing:

- [ ] Added `OPENAI_API_KEY` in deployment platform
- [ ] Added `USE_MOCK_CAPTIONS=false` in deployment platform
- [ ] Added `NODE_ENV=production` in deployment platform
- [ ] Clicked "Save" on environment variables
- [ ] Redeployed the application
- [ ] Waited for deployment to finish (3-5 min)
- [ ] Checked logs for "OpenAI API Key present: true"
- [ ] Tested with a small video file

---

## Video Tutorial (If Needed)

### For Render:

1. Dashboard → Your Service → "Environment" → "Add Environment Variable"
2. Add all 3 variables
3. Click "Save Changes"
4. Wait for auto-redeploy
5. Test upload

### For Vercel:

1. Dashboard → Project → "Settings" → "Environment Variables"
2. Add all 3 variables (select "All Environments")
3. Click "Save"
4. "Deployments" → "Redeploy" latest
5. Test upload

---

## Important Notes

🔒 **Security:** Never commit `.env.local` to GitHub (it's already in `.gitignore`)

💰 **Costs:** OpenAI Whisper API charges $0.006 per minute of audio

⏱️ **Timeout:** If video is too long, it may timeout (set to 300 seconds in vercel.json)

📏 **File Size:** OpenAI has 25MB limit for Whisper API

---

## Need Help?

If you're still getting errors after following these steps:

1. **Copy your deployment logs** (last 50 lines)
2. **Copy the error message** from browser console (F12)
3. **Verify** environment variables are showing in dashboard
4. **Check** if deployment succeeded without build errors

The OpenAI connection **WILL WORK** on Render/Vercel once environment variables are properly set!
