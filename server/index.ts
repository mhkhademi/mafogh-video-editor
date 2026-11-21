import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { getFFmpegPath } from './ffmpeg';
import { fetchArticleFromUrl, generateArticleVideoProject } from './articleAi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(
  '/api/export/push-frame',
  express.raw({ type: ['image/jpeg', 'application/octet-stream'], limit: '20mb' })
);

// Ensure uploads and output directory exist
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const EXPORTS_DIR = path.join(__dirname, '../exports');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/exports', express.static(EXPORTS_DIR));

// Storage configuration for uploaded assets
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  },
});

const upload = multer({ storage });

// Active Export Sessions interface
interface ExportSession {
  id: string;
  ffmpeg: ChildProcessWithoutNullStreams;
  outputFile: string;
  filename: string;
  fps: number;
  framesReceived: number;
  totalFrames: number;
  closePromise: Promise<number | null>;
  errorLogs: string[];
}

const activeSessions = new Map<string, ExportSession>();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const ffmpegPath = getFFmpegPath();
  res.json({
    status: 'ok',
    ffmpeg: {
      found: fs.existsSync(ffmpegPath) || ffmpegPath === 'ffmpeg',
      path: ffmpegPath,
    },
  });
});

// File upload endpoint for images & audio
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// ==========================================
// Native High-Precision FFmpeg Video Export
// ==========================================

// 1. Start a new FFmpeg video export session
app.post('/api/export/start', (req, res) => {
  const { title, fps = 30, resolution = '1080p', bitrate = 8_000_000, totalFrames = 0, width, height } = req.body;
  const ffmpegPath = getFFmpegPath();

  if (!fs.existsSync(ffmpegPath) && ffmpegPath !== 'ffmpeg') {
    return res.status(500).json({ error: 'Native FFmpeg binary not found on server' });
  }

  const sessionId = `export_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const cleanTitle = (title || 'video').replace(/[/\\?%*:|"<>]/g, '_').trim();
  const filename = `${cleanTitle}_${Date.now()}.mp4`;
  const outputFile = path.join(EXPORTS_DIR, filename);

  const targetWidth = width ? Math.round(width) : (resolution === '1080p' ? 1920 : 1280);
  const targetHeight = height ? Math.round(height) : (resolution === '1080p' ? 1080 : 720);
  const targetBitrate = Math.round(bitrate);

  // High-performance H.264 MP4 encoder with hardware acceleration
  const isWindows = process.platform === 'win32';
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(fps),
    '-i', '-',
    ...(isWindows
      ? ['-c:v', 'h264_mf', '-b:v', `${targetBitrate}`]
      : ['-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency', '-pix_fmt', 'yuv420p', '-b:v', `${targetBitrate}`]),
    '-s', `${targetWidth}x${targetHeight}`,
    '-movflags', '+faststart',
    outputFile,
  ];

  console.log(`[FFmpeg Export] Starting session ${sessionId} -> ${filename}`);
  const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);
  const errorLogs: string[] = [];

  ffmpegProcess.stderr.on('data', (d) => {
    errorLogs.push(d.toString());
  });

  const closePromise = new Promise<number | null>((resolve) => {
    ffmpegProcess.on('close', (code) => {
      console.log(`[FFmpeg Export] Session ${sessionId} finished with code ${code}`);
      resolve(code);
    });
  });

  activeSessions.set(sessionId, {
    id: sessionId,
    ffmpeg: ffmpegProcess,
    outputFile,
    filename,
    fps,
    framesReceived: 0,
    totalFrames,
    closePromise,
    errorLogs,
  });

  res.json({ sessionId, filename });
});

// 2. Stream individual MJPEG frames into FFmpeg stdin
app.post('/api/export/push-frame', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Export session not found' });
  }

  const session = activeSessions.get(sessionId)!;
  const frameBuffer = req.body as Buffer;

  if (!frameBuffer || frameBuffer.length === 0) {
    return res.status(400).json({ error: 'Empty frame buffer' });
  }

  session.framesReceived++;

  // Write directly into FFmpeg stdin with backpressure support
  const canContinue = session.ffmpeg.stdin.write(frameBuffer);
  if (canContinue) {
    res.json({ ok: true, frame: session.framesReceived });
  } else {
    session.ffmpeg.stdin.once('drain', () => {
      res.json({ ok: true, frame: session.framesReceived });
    });
  }
});

// 3. Finalize and close FFmpeg export
app.post('/api/export/finalize', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Export session not found' });
  }

  const session = activeSessions.get(sessionId)!;
  console.log(
    `[FFmpeg Export] Finalizing session ${sessionId}. Total frames piped: ${session.framesReceived}`
  );

  // End input stream
  session.ffmpeg.stdin.end();

  // Wait for FFmpeg to finish encoding and writing headers
  const exitCode = await session.closePromise;
  activeSessions.delete(sessionId);

  if (exitCode !== 0 && !fs.existsSync(session.outputFile)) {
    console.error(`[FFmpeg Export Error]`, session.errorLogs.slice(-10).join('\n'));
    return res.status(500).json({
      error: 'FFmpeg encoding failed',
      details: session.errorLogs.slice(-5).join('\n'),
    });
  }

  const stat = fs.statSync(session.outputFile);
  console.log(`[FFmpeg Export] Output MP4 ready: ${session.filename} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);

  res.json({
    success: true,
    url: `/exports/${session.filename}`,
    filename: session.filename,
    sizeBytes: stat.size,
    framesCount: session.framesReceived,
  });
});

// 4. Cancel session
app.post('/api/export/cancel', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)!;
    session.ffmpeg.kill('SIGKILL');
    activeSessions.delete(sessionId);
    if (fs.existsSync(session.outputFile)) {
      try {
        fs.unlinkSync(session.outputFile);
      } catch (_) {}
    }
  }
  res.json({ ok: true });
});

// ==========================================
// SYSTEM AUTO-UPDATE & SYNC ENDPOINTS
// ==========================================

function runGit(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, { cwd: path.join(__dirname, '..') });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || stdout.trim() || `git exited with code ${code}`));
    });
    proc.on('error', (err) => reject(err));
  });
}

// 1. Check for remote updates
app.get('/api/updates/check', async (_req, res) => {
  try {
    const currentHash = await runGit(['rev-parse', 'HEAD']);
    const currentShort = await runGit(['rev-parse', '--short', 'HEAD']);

    // Fetch latest remote commits from origin/main
    try {
      await runGit(['fetch', 'origin', 'main']);
    } catch (fetchErr: any) {
      console.warn('[Update Check] Git fetch failed (probably offline):', fetchErr.message);
      return res.json({
        hasUpdate: false,
        isForce: false,
        isOffline: true,
        current: { hash: currentHash, short: currentShort },
        latest: null,
      });
    }

    const remoteHash = await runGit(['rev-parse', 'origin/main']);
    const remoteShort = await runGit(['rev-parse', '--short', 'origin/main']);

    const hasUpdate = currentHash !== remoteHash;

    let latestMessage = '';
    let latestAuthor = '';
    let latestDate = '';
    let isForce = false;

    if (hasUpdate) {
      latestMessage = await runGit(['log', '-1', 'origin/main', '--pretty=%B']);
      latestAuthor = await runGit(['log', '-1', 'origin/main', '--pretty=%an']);
      latestDate = await runGit(['log', '-1', 'origin/main', '--pretty=%cr']);

      // Check if any unmerged commit contains force keywords
      const unmergedMessages = await runGit(['log', 'HEAD..origin/main', '--pretty=%B']);
      const lower = unmergedMessages.toLowerCase();
      isForce =
        lower.includes('[force]') ||
        lower.includes('[critical]') ||
        lower.includes('[اجباری]') ||
        lower.includes('force-update');
    }

    res.json({
      hasUpdate,
      isForce,
      isOffline: false,
      current: { hash: currentHash, short: currentShort },
      latest: hasUpdate
        ? {
            hash: remoteHash,
            short: remoteShort,
            message: latestMessage.trim(),
            author: latestAuthor.trim(),
            date: latestDate.trim(),
          }
        : null,
    });
  } catch (err: any) {
    console.error('[Update Check Error]:', err);
    res.status(500).json({ error: 'Failed to check updates', details: err.message });
  }
});

// 2. Apply and pull updates
app.post('/api/updates/apply', async (_req, res) => {
  try {
    console.log('[System Update] Pulling latest changes from origin/main...');
    const pullOutput = await runGit(['pull', 'origin', 'main']);
    console.log('[System Update] Git pull output:', pullOutput);

    const newHash = await runGit(['rev-parse', 'HEAD']);
    const newShort = await runGit(['rev-parse', '--short', 'HEAD']);

    res.json({
      success: true,
      newHash,
      newShort,
      output: pullOutput,
    });
  } catch (err: any) {
    console.error('[System Update Error]:', err);
    res.status(500).json({ error: 'Failed to pull updates', details: err.message });
  }
});

// ==========================================
// 3. AI Article-to-Video Endpoints
// ==========================================

// Extract article text and headings from URL
app.post('/api/ai/extract-article', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'آدرس اینترنتی مقاله (URL) الزامی است.' });
    }
    console.log(`[AI Engine] Fetching article from: ${url}`);
    const data = await fetchArticleFromUrl(url);
    res.json({ success: true, article: data });
  } catch (err: any) {
    console.error('[AI Extract Error]:', err);
    res.status(500).json({ error: err.message || 'خطا در واکشی اطلاعات مقاله' });
  }
});

// Generate complete video project from article
app.post('/api/ai/generate-article-video', async (req, res) => {
  try {
    const { url, text, title, points, style, aspectRatio, targetDuration, apiKey } = req.body;
    console.log(`[AI Engine] Generating video project for article: ${title || url || 'raw text'}`);

    const project = await generateArticleVideoProject({
      url,
      text,
      title,
      points,
      style,
      aspectRatio,
      targetDuration,
      apiKey,
    });

    res.json({ success: true, project });
  } catch (err: any) {
    console.error('[AI Video Generation Error]:', err);
    res.status(500).json({ error: err.message || 'خطا در تولید ویدیوی مقاله با هوش مصنوعی' });
  }
});

app.listen(PORT, () => {
  console.log(`Video Editor API Server running at http://localhost:${PORT}`);
  console.log(`FFmpeg binary located at: ${getFFmpegPath()}`);
});
