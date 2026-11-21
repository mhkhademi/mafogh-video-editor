import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UpdateInfo } from '../components/UpdateModal';

export function useUpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const forceUpdateTriggeredRef = useRef(false);

  // Check for updates against backend
  const checkForUpdates = useCallback(async (manual: boolean = false) => {
    try {
      setIsChecking(true);
      setUpdateError(null);
      const res = await fetch('http://localhost:3001/api/updates/check');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: UpdateInfo = await res.json();
      setUpdateInfo(data);

      if (data.hasUpdate) {
        if (data.isForce) {
          // Force Update: automatically open modal and start update!
          setIsModalOpen(true);
          if (!forceUpdateTriggeredRef.current) {
            forceUpdateTriggeredRef.current = true;
            setTimeout(() => {
              applyUpdate();
            }, 600);
          }
        } else if (manual) {
          // If user manually clicked "بررسی به‌روزرسانی", open modal right away
          setIsModalOpen(true);
        }
      } else if (manual) {
        alert('شما در حال استفاده از آخرین نسخه تدوینگر مافوق هستید.');
      }
    } catch (err: any) {
      console.warn('Update check failed:', err);
      if (manual) {
        alert('خطا در بررسی به‌روزرسانی. لطفاً اتصال اینترنت خود را بررسی کنید.');
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

      const res = await fetch('http://localhost:3001/api/updates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || 'خطا در اعمال به‌روزرسانی');
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

  // On initial mount: check once
  useEffect(() => {
    checkForUpdates();

    // Check periodically every 10 minutes
    const interval = setInterval(() => {
      checkForUpdates();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
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
