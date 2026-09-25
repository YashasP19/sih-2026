import { useEffect, useRef, useState } from 'react';

const BACKEND_HEALTH_URL = `${import.meta.env.VITE_API_URL}/`;
const PING_INTERVAL_MS = 9 * 60 * 1000; // ping every 9 min to keep server warm
const SLOW_THRESHOLD_MS = 4000; // show toast only if >4s
const COLD_START_SECONDS = 45; // typical cold-start duration to count down from

export default function ServerWakeup() {
  const [showToast, setShowToast] = useState(false);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'online'
  const [secondsLeft, setSecondsLeft] = useState(COLD_START_SECONDS);
  const intervalRef = useRef(null);
  const toastTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const pingBackend = async (showIndicator = false) => {
    const start = Date.now();

    if (showIndicator) {
      toastTimerRef.current = setTimeout(() => {
        setShowToast(true);
        setStatus('connecting');
        setSecondsLeft(COLD_START_SECONDS);
        countdownRef.current = setInterval(() => {
          setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
      }, SLOW_THRESHOLD_MS);
    }

    try {
      await fetch(BACKEND_HEALTH_URL, {
        method: 'GET',
        signal: AbortSignal.timeout(90000),
      });

      clearTimeout(toastTimerRef.current);
      clearInterval(countdownRef.current);
      const elapsed = Date.now() - start;

      if (showIndicator) {
        if (elapsed > SLOW_THRESHOLD_MS) {
          setStatus('online');
          setTimeout(() => setShowToast(false), 2500);
        } else {
          setShowToast(false);
        }
      }
    } catch {
      clearTimeout(toastTimerRef.current);
      clearInterval(countdownRef.current);
      if (showIndicator) {
        setStatus('connecting');
        setShowToast(true);
      }
    }
  };

  useEffect(() => {
    pingBackend(true);
    intervalRef.current = setInterval(() => pingBackend(false), PING_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(toastTimerRef.current);
      clearInterval(countdownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showToast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 22px',
        borderRadius: '14px',
        background: status === 'online'
          ? 'linear-gradient(135deg, #F0DED4, #EFEBE1)'
          : 'linear-gradient(135deg, #FFFCF6, #F8F5EE)',
        color: '#1C1C1C',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 8px 32px rgba(28,28,28,0.12)',
        backdropFilter: 'blur(16px)',
        border: '1px solid #E3DCC9',
        transition: 'background 0.5s ease',
        fontFamily: 'Inter, system-ui, sans-serif',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        animation: 'wakeupSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {status === 'online' ? (
        <>
          <span style={{ fontSize: '16px' }}>✅</span>
          Server is ready!
        </>
      ) : (
        <>
          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#C1694F',
                  animation: `wakeupBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  display: 'inline-block',
                }}
              />
            ))}
          </span>
          <span style={{ color: '#1C1C1C' }}>
            Connecting to server&hellip; please wait ({secondsLeft}s)
          </span>
        </>
      )}
      <style>{`
        @keyframes wakeupBounce {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0) scale(0.8); }
          40% { opacity: 1; transform: translateY(-4px) scale(1.2); }
        }
        @keyframes wakeupSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
}
