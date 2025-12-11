# API Documentation

## Overview

This API provides endpoints for automatic video caption generation and export.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Currently, no authentication is required. In production, consider implementing API keys or JWT tokens.

## Endpoints

### 1. Generate Captions

**POST** `/api/captions`

Generate captions from a video file using OpenAI Whisper.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `video`: Video file (MP4, MOV, AVI)

**Response:**

```json
{
  "success": true,
  "captions": [
    {
      "start": 0.5,
      "end": 2.3,
      "text": "Welcome to the video"
    }
  ],
  "videoPath": "/uploads/video.mp4",
  "transcription": "Full transcription text"
}
```

**Error Response:**

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Status Codes:**

- 200: Success
- 400: Bad request (missing video file)
- 500: Server error

**Example:**

```javascript
const formData = new FormData();
formData.append("video", videoFile);

const response = await fetch("/api/captions", {
  method: "POST",
  body: formData,
});

const data = await response.json();
```

---

### 2. Export Video

**POST** `/api/export`

Export video with burned-in captions.

**Request:**

- Method: POST
- Content-Type: application/json
- Body:

```json
{
  "videoUrl": "/uploads/video.mp4",
  "captions": [
    {
      "start": 0.5,
      "end": 2.3,
      "text": "Caption text"
    }
  ],
  "captionStyle": "bottom" | "top" | "karaoke"
}
```

**Response:**

```json
{
  "success": true,
  "downloadUrl": "/exports/export-123456.mp4",
  "message": "Video exported successfully!"
}
```

**Error Response:**

```json
{
  "error": "Export failed",
  "details": "Detailed error information"
}
```

**Status Codes:**

- 200: Success
- 400: Bad request (missing parameters)
- 500: Server error

**Example:**

```javascript
const response = await fetch("/api/export", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    videoUrl: "/uploads/video.mp4",
    captions: captionsArray,
    captionStyle: "bottom",
  }),
});

const data = await response.json();
```

---

### 3. Download Exported Video

**GET** `/api/export?file=filename.mp4`

Download an exported video file.

**Request:**

- Method: GET
- Query Parameters:
  - `file`: Filename of exported video

**Response:**

- Content-Type: video/mp4
- Body: Video file binary data

**Status Codes:**

- 200: Success
- 400: Bad request (missing filename)
- 404: File not found
- 500: Server error

**Example:**

```javascript
window.location.href = "/api/export?file=export-123456.mp4";
```

---

## Types

### Caption

```typescript
interface Caption {
  start: number; // Start time in seconds
  end: number; // End time in seconds
  text: string; // Caption text
}
```

### CaptionStyle

```typescript
type CaptionStyle = "bottom" | "top" | "karaoke";
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:

- Implement rate limiting middleware
- Consider: 10 requests per minute per IP
- Use Redis for distributed rate limiting

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details for debugging"
}
```

---

## File Size Limits

- Maximum upload size: 100MB
- Supported formats: MP4, MOV, AVI, WEBM
- Recommended resolution: 1920x1080 or lower

---

## Processing Time

Approximate processing times:

- Caption Generation: 20-60 seconds for 2-3 min video
- Video Export: 2-5 minutes depending on video length

---

## Best Practices

1. **Upload:**

   - Validate file type before upload
   - Show progress indicator
   - Handle network errors

2. **Export:**

   - Implement polling for export status
   - Show progress indicator
   - Handle timeout scenarios

3. **Error Handling:**
   - Always check response status
   - Display user-friendly error messages
   - Log errors for debugging

---

## Security Considerations

For production deployment:

- Implement authentication (JWT, API keys)
- Validate and sanitize file uploads
- Use HTTPS only
- Implement CORS policies
- Add request validation
- Sanitize caption text input
- Rate limiting per user/IP
- Virus scanning for uploads

---

## Future Enhancements

Planned features:

- WebSocket support for real-time progress
- Batch processing
- Custom caption editing API
- Multiple language support
- SRT/VTT export formats
- Video trimming
- Custom styling options
