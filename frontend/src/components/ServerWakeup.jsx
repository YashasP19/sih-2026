import { useEffect, useRef, useState } from 'react';

const BACKEND_HEALTH_URL = `${import.meta.env.VITE_API_URL}/`;
const PING_INTERVAL_MS = 9 * 60 * 1000; // ping every 9 min to keep server warm
const SLOW_THRESHOLD_MS = 4000; // show toast only if >4s
const TYPICAL_WAKE_SECONDS = 30; // paces the progress bar's ease-in curve, not a hard deadline
const MAX_EASE_PERCENT = 88; // bar never claims completion on its own — only a real ping does that

export default function ServerWakeup() {
  const [showToast, setShowToast] = useState(false);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'online'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);
  const toastTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const pingBackend = async (showIndicator = false) => {
    const start = Date.now();

    if (showIndicator) {
      toastTimerRef.current = setTimeout(() => {
        setShowToast(true);
        setStatus('connecting');
        setElapsedSeconds(Math.round((Date.now() - start) / 1000));
        countdownRef.current = setInterval(() => {
          setElapsedSeconds(Math.round((Date.now() - start) / 1000));
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
          setElapsedSeconds(Math.round(elapsed / 1000));
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

  const easedPercent = Math.min(
    MAX_EASE_PERCENT,
    MAX_EASE_PERCENT * (1 - Math.exp(-elapsedSeconds / TYPICAL_WAKE_SECONDS))
  );
  const progressPercent = status === 'online' ? 100 : easedPercent;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '16px 22px',
        borderRadius: '16px',
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
        width: '340px',
        animation: 'wakeupSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {status === 'online' ? (
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#4A7C59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8.5L6.2 11.5L13 4.5"
                stroke="#FFFCF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <span style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
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
        )}
        <span style={{ whiteSpace: 'nowrap' }}>
          {status === 'online' ? 'Server is ready!' : 'Connecting to server…'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: '600', color: '#C1694F', fontVariantNumeric: 'tabular-nums' }}>
          {elapsedSeconds}s
        </span>
      </div>

      <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(227, 220, 201, 0.7)', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            borderRadius: '999px',
            background: status === 'online'
              ? '#4A7C59'
              : 'linear-gradient(90deg, #C1694F, #D0876C)',
            transition: 'width 0.6s ease, background 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {status !== 'online' && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                animation: 'wakeupShimmer 1.6s linear infinite',
              }}
            />
          )}
        </div>
      </div>

      {status !== 'online' && (
        <span style={{ fontSize: '11px', color: '#8C8577' }}>
          This can take up to a minute on first load
        </span>
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
        @keyframes wakeupShimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
