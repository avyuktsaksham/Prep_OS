// src/components/common/Logo.tsx
interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  caption?: string;
}

export default function Logo({ size = 36, showWordmark = true, caption }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="prepos-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#prepos-grad)" />
        <path
          d="M22.5 8L11.5 22.5H18.5L17 32L28 17H21L22.5 8Z"
          fill="white"
        />
      </svg>

      {showWordmark && (
        <div className="leading-tight">
          <span className="font-display font-bold text-xl tracking-tight text-ink block">
            Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-signal to-pulse">OS</span>
          </span>
          {caption && (
            <span className="font-mono text-[10px] font-semibold tracking-widest text-ink-faint uppercase">
              {caption}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
