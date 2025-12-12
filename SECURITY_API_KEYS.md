# 🔐 API Key Security - CRITICAL STEPS

## ⚠️ SECURITY INCIDENT: API Key Exposed and Revoked

Your OpenAI API key was automatically revoked because it was committed to GitHub.

**What happened:**
1. API key was included in commit messages and documentation files
2. GitHub secret scanning detected it
3. GitHub notified OpenAI
4. OpenAI automatically revoked the key

---

## ✅ IMMEDIATE ACTION REQUIRED

### Step 1: Generate a New API Key

1. **Go to**: https://platform.openai.com/api-keys
2. **Click**: "Create new secret key"
3. **Name it**: "Remotion-Captioning-Platform"
4. **Copy** the key immediately (it won't be shown again)
5. **Save it** in a secure password manager (NOT in any file!)

### Step 2: Add to Vercel (ONLY)

1. **Go to**: https://vercel.com/dashboard
2. **Your project** → **Settings** → **Environment Variables**
3. **Add** the new key:
   ```
   Key: OPENAI_API_KEY
   Value: [paste your new key here]
   Environment: Production, Preview, Development (all three)
   ```
4. **Save** and **Redeploy**

### Step 3: NEVER Commit API Keys Again

**❌ NEVER put API keys in:**
- Git commits
- Code files
- Documentation files (`.md`)
- Comments
- Console.log statements
- Public repositories

**✅ ONLY store API keys in:**
- Environment variables (Vercel dashboard)
- `.env.local` file (which is in `.gitignore`)
- Secure password managers
- Encrypted secret management systems

---

## 🛡️ Best Practices Going Forward

### For Local Development:

**`.env.local` file** (already in `.gitignore`):
```bash
OPENAI_API_KEY=your-actual-key-here
USE_MOCK_CAPTIONS=false
NODE_ENV=development
```

**Check `.gitignore`** contains:
```
.env
.env.local
.env*.local
```

### For Production (Vercel):

**ONLY use Environment Variables dashboard:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Never hardcode keys in code
3. Access via `process.env.OPENAI_API_KEY`

### For Documentation:

**Use placeholders:**
```
OPENAI_API_KEY=YOUR-OPENAI-API-KEY-HERE
```

**NEVER** paste actual keys in:
- README.md
- Documentation files
- Example files
- Comments

---

## 🔍 How to Check if You've Exposed Keys

### Check Git History:
```powershell
git log --all --full-history -- "*" | Select-String -Pattern "sk-"
```

### Check All Files:
```powershell
Get-ChildItem -Recurse | Select-String -Pattern "sk-proj-" | Select-Object Path, LineNumber
```

### If You Find Exposed Keys:

1. **Revoke immediately** at https://platform.openai.com/api-keys
2. **Generate new key**
3. **Update** in Vercel dashboard only
4. **Clean git history** (use `git filter-branch` or BFG Repo-Cleaner)

---

## 📋 Security Checklist

Before committing code:

- [ ] No API keys in code files
- [ ] No API keys in `.md` files
- [ ] No API keys in console.log
- [ ] `.env.local` is in `.gitignore`
- [ ] Only placeholders in documentation
- [ ] Environment variables set in Vercel dashboard

Before deploying:

- [ ] New API key generated (old one revoked)
- [ ] API key added to Vercel environment variables
- [ ] API key NOT in any git commits
- [ ] Test endpoint works: `/api/test-openai`

---

## 🚀 Current Status

### Completed:
- ✅ Removed all exposed keys from files
- ✅ Committed cleaned files
- ✅ `.env.local` uses placeholder

### TODO (YOU MUST DO NOW):
1. ❌ Generate new OpenAI API key
2. ❌ Add new key to Vercel dashboard
3. ❌ Redeploy Vercel
4. ❌ Test with short video (<2 min)

---

## 🔗 Important Links

- **OpenAI API Keys**: https://platform.openai.com/api-keys
- **Vercel Environment Variables**: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- **GitHub Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning

---

## ⚡ Quick Start Guide

1. **Get new API key** from OpenAI
2. **Add to Vercel** dashboard (NOT code!)
3. **Redeploy** Vercel
4. **Test** at `/api/test-openai`
5. **Upload** short video (<2 min)
6. **Success!** 🎉

---

## 💡 Remember:

> **API keys are passwords. Never commit passwords to git.**

If you ever accidentally commit a key:
1. Revoke it immediately
2. Generate a new one
3. Update only in environment variables dashboard
4. Never in code!

---

**Your repository is now clean. Generate a new API key and add it ONLY to Vercel dashboard!**
