# Quick Start Guide

## 🎯 Goal

Get the Remotion Captioning Platform running locally in 5 minutes.

## ⚡ Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18 or higher ([Download](https://nodejs.org))
- ✅ npm or yarn package manager
- ✅ OpenAI API key ([Get one](https://platform.openai.com/api-keys))
- ✅ Git ([Download](https://git-scm.com))

## 📦 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/sumukhbendre123/Remotion-Captioning-Platform.git
cd Remotion-Captioning-Platform
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- Next.js 14
- Remotion v4
- OpenAI SDK
- TailwindCSS
- ShadCN UI
- And all other dependencies

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open .env.local in your favorite editor
# Add your OpenAI API key
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

🎉 **You're all set!**

## 🎬 Using the Platform

### Upload a Video

1. Click "Start Creating" on the home page
2. Click "Choose Video File"
3. Select an MP4 video (max 100MB)
4. Click "Generate Captions"
5. Wait 20-60 seconds for AI processing

### Preview & Customize

1. View your video with auto-generated captions
2. Select a caption style:
   - **Bottom Centered**: Classic subtitles
   - **Top News Bar**: Breaking news style
   - **Karaoke**: Word highlight effect
3. Preview changes in real-time

### Export Your Video

1. Click "Export Video"
2. Wait 2-5 minutes for processing
3. Download your captioned video

## 📁 Project Structure

```
Remotion-Captioning-Platform/
├── app/                  # Next.js app pages
│   ├── api/             # API routes
│   ├── upload/          # Upload page
│   └── preview/         # Preview page
├── remotion/            # Remotion compositions
│   └── styles/          # Caption styles
├── components/          # React components
├── store/              # State management
└── lib/                # Utilities
```

## 🔧 Common Issues

### Issue: "Module not found" error

**Solution:** Run `npm install` again

### Issue: "Invalid API key"

**Solution:** Check your `.env.local` file has correct `OPENAI_API_KEY`

### Issue: Port 3000 already in use

**Solution:** Kill the process or use a different port:

```bash
# Use port 3001
PORT=3001 npm run dev
```

### Issue: Video upload fails

**Solution:**

- Check file size is under 100MB
- Ensure file format is MP4, MOV, or AVI
- Check browser console for errors

## 🚀 Next Steps

- Read the full [README.md](./README.md)
- Check [API Documentation](./API.md)
- Review [Deployment Guide](./DEPLOYMENT.md)
- See [Contributing Guidelines](./CONTRIBUTING.md)

## 📞 Need Help?

- 🐛 [Report a bug](https://github.com/sumukhbendre123/Remotion-Captioning-Platform/issues)
- 💡 [Request a feature](https://github.com/sumukhbendre123/Remotion-Captioning-Platform/issues)
- 📧 Contact: GitHub [@sumukhbendre123](https://github.com/sumukhbendre123)

## ⭐ Enjoy!

If you find this useful, please star the repository on GitHub!
