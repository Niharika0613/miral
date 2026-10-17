// client/src/components/miral-logo.tsx
import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showHindi?: boolean;
}

export function VaniDarpanLogo({ height = 36, className, showHindi = true }: LogoProps) {
  const markSize = Math.max(28, Math.round(height * 0.88));

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className || ''}`}>
      {/* Mirror Frame Mark (rounded camera frame with fine gaze & posture marks per DESIGN.md) */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Outer rounded camera frame (6px radius) */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="6"
          stroke="#1F4FBF"
          strokeWidth="2"
          fill="#EAF0FC"
        />
        
        {/* Fine vertical & horizontal posture alignment ticks */}
        <line x1="16" y1="4.5" x2="16" y2="7.5" stroke="#1F4FBF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24.5" x2="16" y2="27.5" stroke="#1F4FBF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4.5" y1="16" x2="7.5" y2="16" stroke="#1F4FBF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24.5" y1="16" x2="27.5" y2="16" stroke="#1F4FBF" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Center gaze focal ring & core iris */}
        <circle cx="16" cy="16" r="4.25" stroke="#1F4FBF" strokeWidth="1.5" fill="#FFFFFF" />
        <circle cx="16" cy="16" r="1.75" fill="#1F4FBF" />
      </svg>

      {/* Institutional Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-sans font-semibold text-ink text-[17px] tracking-[-0.01em]">
          VaniDarpan
        </span>
        {showHindi && (
          <span className="font-devanagari text-muted text-[10px] tracking-normal mt-0.5 font-medium">
            वाणीदर्पण
          </span>
        )}
      </div>
    </div>
  );
}

// Backward compatibility export
export const MiralLogo = VaniDarpanLogo;
