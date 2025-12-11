export const CAPTION_STYLES = {
  BOTTOM: 'bottom',
  TOP: 'top',
  KARAOKE: 'karaoke',
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export const WHISPER_CONFIG = {
  model: 'whisper-1',
  responseFormat: 'verbose_json',
  timestampGranularities: ['word'] as const,
};

export const REMOTION_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  codec: 'h264' as const,
};

export const API_ENDPOINTS = {
  CAPTIONS: '/api/captions',
  EXPORT: '/api/export',
};

export const CAPTION_STYLE_DESCRIPTIONS = {
  bottom: {
    name: 'Bottom Centered',
    description: 'Classic subtitle style',
  },
  top: {
    name: 'Top News Bar',
    description: 'Breaking news style',
  },
  karaoke: {
    name: 'Karaoke',
    description: 'Word-by-word highlight',
  },
};

export const ERROR_MESSAGES = {
  NO_VIDEO: 'Please upload a video first',
  INVALID_FILE_TYPE: 'Please upload a valid video file (MP4, MOV, etc.)',
  FILE_TOO_LARGE: 'Please upload a video smaller than 100MB',
  GENERATION_FAILED: 'Failed to generate captions',
  EXPORT_FAILED: 'Failed to export video',
  NO_CAPTIONS: 'No captions available',
};

export const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: 'Video uploaded successfully',
  CAPTIONS_GENERATED: 'Captions generated successfully',
  VIDEO_EXPORTED: 'Video exported successfully',
  STYLE_CHANGED: 'Caption style updated',
};
