# Troubleshooting Guide

## Connection Error When Generating Captions

If you're getting a "Connection error" when trying to generate captions, here are possible solutions:

### 1. **Check Your OpenAI API Key**

Make sure your `.env.local` file has a valid OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**How to get an API key:**

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in `.env.local`

### 2. **Network/Firewall Issues**

The error `ECONNRESET` usually indicates:

- **Firewall blocking**: Your firewall might be blocking connections to `api.openai.com`
- **Proxy settings**: If you're behind a corporate proxy, you need to configure it
- **VPN issues**: Try disabling VPN if active
- **Internet connection**: Ensure you have stable internet

**Solutions:**

- Allow Node.js through your firewall
- Configure proxy settings if needed
- Try a different network
- Check if you can access https://api.openai.com from your browser

### 3. **Use Mock Captions for Testing**

If you can't connect to OpenAI API right now, you can use mock captions for testing:

1. Add this to your `.env.local` file:

```bash
USE_MOCK_CAPTIONS=true
```

2. Restart the development server:

```bash
npm run dev
```

Now when you upload a video, it will use mock captions instead of calling OpenAI API.

### 4. **Check API Key Validity**

Your API key might be:

- Expired
- Invalid
- Out of credits
- Not activated

**Verify on OpenAI Dashboard:**

1. Go to https://platform.openai.com/account/usage
2. Check if you have credits
3. Verify your API key is active

### 5. **File Format Issues**

Whisper API supports these formats:

- mp4, mp3, wav, webm, m4a, mpeg, mpga

Make sure your video is in a supported format.

### 6. **File Size Limits**

OpenAI Whisper API has a **25 MB limit** for files.

If your video is larger:

- Compress it first
- Extract and compress audio only
- Use a shorter clip for testing

### 7. **Common Error Messages**

| Error                   | Cause                    | Solution                                    |
| ----------------------- | ------------------------ | ------------------------------------------- |
| `ECONNRESET`            | Network connection reset | Check firewall/proxy, try different network |
| `401 Unauthorized`      | Invalid API key          | Update API key in `.env.local`              |
| `429 Too Many Requests` | Rate limit exceeded      | Wait a few minutes, check usage             |
| `413 Payload Too Large` | File too large           | Compress file or use shorter clip           |

### 8. **Development Server Issues**

If changes to `.env.local` aren't taking effect:

1. **Stop the server** (Ctrl+C in terminal)
2. **Restart it:**

```bash
npm run dev
```

### 9. **Windows-Specific Issues**

If you're on Windows:

- Make sure Windows Defender isn't blocking Node.js
- Check if antivirus is interfering
- Try running terminal as Administrator

### 10. **Test OpenAI Connection**

Create a test file `test-openai.js` in your project root:

```javascript
const OpenAI = require("openai");
require("dotenv").config({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await openai.models.list();
    console.log("✅ Connection successful!");
    console.log("Models:", response.data.length);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

test();
```

Run it:

```bash
node test-openai.js
```

## Still Having Issues?

1. **Check the server logs** in your terminal for detailed error messages
2. **Open browser console** (F12) to see frontend errors
3. **Try with mock captions** first (set `USE_MOCK_CAPTIONS=true`)
4. **Update dependencies:**
   ```bash
   npm install openai@latest
   ```

## Need Help?

- OpenAI API Documentation: https://platform.openai.com/docs
- OpenAI Support: https://help.openai.com
- Check OpenAI Status: https://status.openai.com
