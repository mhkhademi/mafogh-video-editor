import fs from 'fs';
import path from 'path';

export function getFFmpegPath(): string {
  const customPath = 'C:\\Users\\Pardis\\AppData\\Local\\hermes\\tools\\ffmpeg-9.0.1-win32-x64\\bin\\ffmpeg.exe';
  if (fs.existsSync(customPath)) {
    return customPath;
  }
  return 'ffmpeg';
}
