import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children, className = '' }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className={`animate-slide-up ${className}`}>
      {children}
    </div>
  );
}
