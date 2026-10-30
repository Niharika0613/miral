// client/src/components/miral-logo.tsx
import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export function VaniDarpanLogo({ height = 34, className = '', showText = true }: LogoProps) {
  const iconSize = Math.max(24, Math.round(height * 0.9));
  const textSize = Math.max(16, Math.round(height * 0.56));

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official VaniDarpan App Icon */}
      <img
        src="/logo.png"
        alt="VaniDarpan Logo"
        width={iconSize}
        height={iconSize}
        className="rounded-lg shadow-2xs shrink-0 object-contain"
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        onError={(e) => {
          // Fallback to SVG if image loading is delayed
          e.currentTarget.src = '/favicon.svg';
        }}
      />

      {/* Official Brand Wordmark */}
      {showText && (
        <span
          className="font-extrabold tracking-tight text-slate-900 dark:text-white leading-none"
          style={{ fontSize: `${textSize}px` }}
        >
          VaniDarpan
        </span>
      )}
    </div>
  );
}

// Backward compatibility alias for any legacy component importing MiralLogo
export const MiralLogo = VaniDarpanLogo;
