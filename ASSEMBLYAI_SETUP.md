# How to Get AssemblyAI API Key (FREE - No Credit Card!)

## Why AssemblyAI?

✅ **5 HOURS FREE per month** - No credit card required  
✅ **Word-level timestamps** - Perfect for captions  
✅ **Fast** - 2-3x realtime processing  
✅ **Accurate** - Industry-leading speech recognition  
✅ **Hinglish support** - Understands mixed Hindi/English

**Gemini doesn't work** because it doesn't support video transcription through the API (404 errors for all models).

## Step-by-Step Setup

### 1. Sign Up for AssemblyAI

1. Go to: **https://www.assemblyai.com/**
2. Click "**Start building for free**" or "**Get API Key**"
3. Sign up with:
   - Email + password, OR
   - GitHub account, OR
   - Google account
4. **No credit card required!**

### 2. Get Your API Key

1. After signing in, you'll see the **Dashboard**
2. Your API key is displayed right on the homepage
3. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. Click the **Copy** button

### 3. Add to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Open your project: `remotion-captioning-platform123`
3. Go to: **Settings** → **Environment Variables**
4. Click "**Add New**"
5. Set:
   - **Name:** `ASSEMBLYAI_API_KEY`
   - **Value:** Paste your API key from Step 2
   - **Environment:** Select all (Production, Preview, Development)
6. Click "**Save**"

### 4. Redeploy

Vercel will automatically redeploy your site (takes ~2-3 minutes).

Or manually trigger:

1. Go to **Deployments** tab
2. Click "**...**" on latest deployment
3. Click "**Redeploy**"

### 5. Test It!

1. Go to: `https://remotion-captioning-platform123.vercel.app`
2. Upload your video (30 seconds, 1.7MB)
3. Click "**Generate Captions**"
4. **AssemblyAI will transcribe** your actual spoken words!
5. You'll get **REAL captions** with accurate timestamps! 🎉

## Free Tier Limits

| Feature              | Free Tier       |
| -------------------- | --------------- |
| **Hours/month**      | 5 hours         |
| **Word timestamps**  | ✅ Yes          |
| **Credit card**      | ❌ Not required |
| **Processing speed** | 2-3x realtime   |
| **Max file size**    | No limit        |
| **Hinglish**         | ✅ Supported    |

**Your 30-second video** = 0.5 minutes = You can process **600 videos/month FREE**!

## Troubleshooting

### "No captions generated"

- Check: API key is set in Vercel environment variables
- Check: Redeploy after adding API key
- Check: Video has audible speech

### "Mock captions showing"

- AssemblyAI key not set → Check Vercel dashboard
- API key invalid → Get new key from AssemblyAI dashboard
- Check Vercel logs for errors

### "Transcription is wrong"

- AssemblyAI works best with:
  - Clear audio (no background noise)
  - English or Hinglish
  - One speaker at a time

## Cost Comparison

| Service            | Free Tier       | Cost After Free              |
| ------------------ | --------------- | ---------------------------- |
| **AssemblyAI**     | 5 hrs/month     | $0.00065/second ($0.039/min) |
| **OpenAI Whisper** | ❌ None         | $0.006/minute                |
| **Deepgram**       | $200 credits    | $0.0043/minute               |
| **Gemini**         | ❌ Doesn't work | N/A                          |

**AssemblyAI is the BEST choice** for this project! 🎉

## What You Get

✅ **Real transcription** of your actual speech  
✅ **Word-level timestamps** (accurate to milliseconds)  
✅ **Automatic punctuation** and capitalization  
✅ **Confidence scores** for each word  
✅ **No mock captions** - 100% real AI transcription

## Next Steps

1. ✅ Get AssemblyAI API key (5 minutes)
2. ✅ Add to Vercel environment variables
3. ✅ Wait for redeploy
4. 🎉 Upload video → Get REAL captions!

**Your video will be transcribed perfectly!** No more mock captions! 🚀
