// client/src/components/miral-logo.tsx
import { useId } from 'react';

interface MiralLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function MiralLogo({ width = 140, height = 36, className }: MiralLogoProps) {
  // useId ensures unique gradient IDs when the logo renders multiple times on the same page
  const uid = useId().replace(/:/g, '');
  const gradId = `mg-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 158 40"
      width={width}
      height={height}
      className={className}
      aria-label="MIRAL"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      {/* ── Badge background: rounded-square app-icon style ── */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${gradId})`} />

      {/* ── Geometric M — clean line-drawn, no fill, white stroke ── */}
      {/*   Left foot → left peak → valley dot → right peak → right foot   */}
      <path
        d="M10,30 L10,12 L20,23 L30,12 L30,30"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Focal dot at M valley — represents the AI "iris" / mic core ── */}
      <circle cx="20" cy="23" r="2.2" fill="white" opacity="0.9" />

      {/* ── Wordmark ── */}
      <text
        x="50"
        y="28"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.6"
      >
        MIRAL
      </text>
    </svg>
  );
}
