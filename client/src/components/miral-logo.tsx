// client/src/components/miral-logo.tsx
import { useId } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function VaniDarpanLogo({ width = 150, height = 36, className }: LogoProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `vdg-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 170 38"
      width={width}
      height={height}
      className={className}
      aria-label="VaniDarpan"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F4FBF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* ── App Icon Badge: Rounded Square ── */}
      <rect x="1" y="1" width="36" height="36" rx="9" fill={`url(#${gradId})`} />

      {/* ── Geometric Reflection / Soundwave Aperture ── */}
      {/* Sound / Voice Wave left bar */}
      <rect x="9" y="14" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />
      {/* Central Mirror / Voice peak */}
      <rect x="15" y="9" width="3.2" height="20" rx="1.6" fill="white" />
      {/* Aperture Iris Center */}
      <circle cx="21" cy="19" r="2" fill="white" />
      {/* Right reflection bar */}
      <rect x="26" y="14" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />

      {/* ── Brand Wordmark: VaniDarpan ── */}
      <text
        x="46"
        y="26"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        VaniDarpan
      </text>
    </svg>
  );
}

// Backward compatibility alias for any component still importing MiralLogo
export const MiralLogo = VaniDarpanLogo;
