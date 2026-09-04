import React, { useEffect, useRef, useState } from 'react';

export default function CountUp({ value = 0, duration = 1200 }) {
  const ref = useRef(null);
  const displayRef = useRef(0);
  const [display, setDisplay] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return undefined;
    }

    const from = displayRef.current;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString('en-IN')}</span>;
}
