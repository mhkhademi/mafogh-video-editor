import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UpdateInfo } from '../components/UpdateModal';

const RAW_VERSION_URL =
  'https://raw.githubusercontent.com/mhkhademi/mafogh-video-editor/main/public/version.json';
const GITHUB_COMMITS_URL =
  'https://api.github.com/repos/mhkhademi/mafogh-video-editor/commits/main';

// Resilient API request that tests relative origin, port 3000 (SimpleWebServer) and port 3001 (Node backend)
async function requestUpdateApi(
  endpoint: string,
  options?: RequestInit,
  timeoutMs: number = 15000
): Promise<Response> {
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const urlsToTry = [
    endpoint, // relative URL (e.g. /api/updates/check)
    `${currentOrigin}${endpoint}`,
    `http://localhost:3000${endpoint}`,
    `http://localhost:3001${endpoint}`,
  ];

  const uniqueUrls = Array.from(
    new Set(urlsToTry.map((u) => (u.startsWith('http') ? u : `${currentOrigin}${u}`)))
  );

  let lastError: any = null;
  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        return res;
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error(`ارتباط با سرور به‌روزرسانی (${endpoint}) برقرار نشد.`);
}

async function readLocalVersionManifest(): Promise<{ version?: string; sha?: string }> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  try {
    const vRes = await fetch(`/version.txt?t=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (vRes.ok) {
      return { sha: (await vRes.text()).trim() };
    }
  } catch (_) {}

  return { sha: 'initial' };
}

async function checkDirectFromGitHub(): Promise<UpdateInfo | null> {
  const local = await readLocalVersionManifest();

  // 1. Primary: Static CDN version.json (no 60 req/hr GitHub API rate limit!)
  try {
    const rawRes = await fetch(`${RAW_VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (rawRes.ok) {
      const remote = await rawRes.json();
      const remoteVer = String(remote.version || '').trim();
      const localVer = String(local.version || '').trim();
      if (remoteVer && remoteVer !== localVer) {
        return {
          hasUpdate: true,
          isForce: Boolean(remote.isForce),
          isOffline: false,
          current: {
            hash: local.sha || localVer || 'initial',
            short: localVer || (local.sha ? local.sha.slice(0, 7) : 'initial'),
          },
          latest: {
            hash: remoteVer,
            short: remoteVer,
            message: remote.message || 'نسخه جدید تدوینگر مافوق آماده است',
            author: remote.author || 'تیم فنی مافوق',
            date: remote.date || '',
          },
        };
      }
      if (remoteVer && remoteVer === localVer) {
        return {
          hasUpdate: false,
          isForce: false,
          isOffline: false,
          current: { hash: local.sha || localVer, short: localVer },
          latest: null,
        };
      }
    }
  } catch (e) {
    console.warn('Raw version.json check failed:', e);
  }

  // 2. Fallback: GitHub Commits REST API
  try {
    const localSha = local.sha || 'initial';
    const ghRes = await fetch(GITHUB_COMMITS_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(10000),
    });

    if (ghRes.ok) {
      const gh = await ghRes.json();
      const remoteSha = gh.sha || '';
      const commitMsg = gh.commit?.message || '';
      const author = gh.commit?.author?.name || 'تیم تدوینگر مافوق';
      const dateStr = gh.commit?.author?.date || '';

      const hasUpdate = !!remoteSha && remoteSha.toLowerCase() !== localSha.toLowerCase();
      const lower = commitMsg.toLowerCase();
      const isForce =
        lower.includes('[force]') ||
        lower.includes('[critical]') ||
        lower.includes('[اجباری]') ||
        lower.includes('force-update');

      return {
        hasUpdate,
        isForce,
        isOffline: false,
        current: {
          hash: localSha,
          short: localSha.slice(0, 7) || 'initial',
        },
        latest: hasUpdate
          ? {
              hash: remoteSha,
              short: remoteSha.slice(0, 7),
              message: commitMsg.split('\n')[0],
              author,
              date: dateStr ? new Date(dateStr).toLocaleDateString('fa-IR') : '',
            }
          : null,
      };
    }
  } catch (ghErr) {
    console.warn('Direct GitHub API check also failed:', ghErr);
  }

  return null;
}

export function useUpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const forceUpdateTriggeredRef = useRef(false);

  // Apply update and reload window
  const applyUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateStatus('در حال دریافت آخرین نسخه از گیت‌هاب...');

      // Allow up to 3 minutes for downloading & extracting the GitHub archive
      const res = await requestUpdateApi(
        '/api/updates/apply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        180000
      );

      const json = await res.json().catch(() => ({}));
      if (json.success === false) {
        throw new Error(json.error || json.details || 'خطا در اعمال به‌روزرسانی');
      }

      setUpdateStatus('تغییرات با موفقیت اعمال شد!');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#8b5cf6', '#6366f1', '#10b981'],
        });
      } catch (_) {}

      setUpdateStatus('completed');

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Apply update failed:', err);
      setUpdateError(err.message || 'مشکلی در دریافت یا اعمال به‌روزرسانی پیش آمد.');
      setIsUpdating(false);
    }
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(
    async (manual: boolean = false) => {
      try {
        setIsChecking(true);
        setUpdateError(null);

        let data: UpdateInfo | null = null;

        // 1. Try local server endpoints (SimpleWebServer on 3000 or Node backend on 3001)
        try {
          const res = await requestUpdateApi('/api/updates/check', undefined, 15000);
          data = await res.json();
        } catch (localErr) {
          console.warn('Local update server not responding, falling back to direct check...', localErr);
        }

        // 2. Fallback to direct CDN/GitHub check if local check failed or returned an error
        if (!data || (data as any).error) {
          const directData = await checkDirectFromGitHub();
          if (directData) {
            data = directData;
          }
        }

        if (!data) {
          throw new Error('امکان دریافت اطلاعات نسخه از سرور یا گیت‌هاب وجود ندارد.');
        }

        setUpdateInfo(data);

        if (data.hasUpdate) {
          setIsModalOpen(true);

          if (data.isForce) {
            if (!forceUpdateTriggeredRef.current) {
              forceUpdateTriggeredRef.current = true;
              setTimeout(() => {
                applyUpdate();
              }, 600);
            }
          }
        } else if (manual) {
          alert('شما در حال حاضر از آخرین نسخه تدوینگر مافوق استفاده می‌کنید.');
        }
      } catch (err: any) {
        console.warn('Update check failed:', err);
        if (manual) {
          alert(err.message || 'خطا در بررسی به‌روزرسانی. لطفاً اتصال اینترنت خود را بررسی کنید.');
        }
      } finally {
        setIsChecking(false);
      }
    },
    [applyUpdate]
  );

  // On initial mount: check once on startup
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    updateInfo,
    isChecking,
    isUpdating,
    isModalOpen,
    updateStatus,
    updateError,
    checkForUpdates,
    applyUpdate,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };
}
