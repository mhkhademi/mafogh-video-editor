import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UpdateInfo } from '../components/UpdateModal';

// Resilient API request that tests relative origin, port 3000 (SimpleWebServer) and port 3001 (Node backend)
async function requestUpdateApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const urlsToTry = [
    endpoint, // relative URL (e.g. /api/updates/check)
    `${currentOrigin}${endpoint}`,
    `http://localhost:3000${endpoint}`,
    `http://localhost:3001${endpoint}`,
  ];

  const uniqueUrls = Array.from(new Set(urlsToTry.map((u) => (u.startsWith('http') ? u : `${currentOrigin}${u}`))));

  let lastError: any = null;
  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(7000),
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

export function useUpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const forceUpdateTriggeredRef = useRef(false);

  // Check for updates
  const checkForUpdates = useCallback(async (manual: boolean = false) => {
    try {
      setIsChecking(true);
      setUpdateError(null);

      let data: UpdateInfo | null = null;

      // 1. Try local server endpoints (SimpleWebServer on port 3000 or Node backend on port 3001)
      try {
        const res = await requestUpdateApi('/api/updates/check');
        data = await res.json();
      } catch (localErr) {
        console.warn('Local update server not responding, falling back to direct GitHub API check...', localErr);
      }

      // 2. Direct browser GitHub fallback if local API was unavailable or returned an error
      if (!data || (data as any).error) {
        try {
          // Read local version from /version.txt
          let localSha = 'initial';
          try {
            const vRes = await fetch('/version.txt', { signal: AbortSignal.timeout(3000) });
            if (vRes.ok) {
              localSha = (await vRes.text()).trim();
            }
          } catch (_) {}

          // Query GitHub REST API directly
          const ghRes = await fetch('https://api.github.com/repos/mhkhademi/mafogh-video-editor/commits/main', {
            headers: { Accept: 'application/vnd.github.v3+json' },
            signal: AbortSignal.timeout(8000),
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

            data = {
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
      }

      if (!data) {
        throw new Error('امکان دریافت اطلاعات نسخه از سرور یا گیت‌هاب وجود ندارد.');
      }

      setUpdateInfo(data);

      if (data.hasUpdate) {
        // Automatically open the update modal on startup when an update is available!
        setIsModalOpen(true);

        if (data.isForce) {
          // Force Update: automatically start update!
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
  }, []);

  // Apply update and reload window
  const applyUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateStatus('در حال دریافت آخرین نسخه از گیت‌هاب...');

      const res = await requestUpdateApi('/api/updates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json().catch(() => ({}));
      if (json.success === false) {
        throw new Error(json.error || json.details || 'خطا در اعمال به‌روزرسانی');
      }

      setUpdateStatus('تغییرات با موفقیت اعمال شد!');

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#8b5cf6', '#6366f1', '#10b981'],
        });
      } catch (_) {}

      setUpdateStatus('completed');

      // Reload after 1.5 seconds so user sees celebration and changes take effect
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Apply update failed:', err);
      setUpdateError(err.message || 'مشکلی در دریافت یا اعمال به‌روزرسانی پیش آمد.');
      setIsUpdating(false);
    }
  }, []);

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
