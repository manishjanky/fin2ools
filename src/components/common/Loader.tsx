
export default function Loader({ message, fullHeight }: { message?: string, fullHeight?: boolean }) {
  return (
    <div
      className={`${fullHeight ? 'min-h-screen' : ''} flex items-center justify-center`}
    >
      <div className="text-center max-w-fit">
        <svg width="200" height="200" viewBox="0 0 65 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="m-auto">
          <circle cx="30" cy="30" r="25" fill="url(#iconGradient1)" opacity="0.2" >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="25;29;25" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="30" r="20" fill="url(#iconGradient3)" opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="r" values="20;24;20" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
          </circle>
          <g transform="translate(-5, 8)" >
            <path d="M18 20 L22 16 L26 20 L26 24 L32 30 L28 34 L22 28 L18 24 Z" fill="url(#iconGradient2)" stroke="url(#iconGradient3)" strokeWidth="1" />
            <path d="M16 16 L17 18 L16 20 L14 18 Z" fill="url(#iconGradient4)" />
            <path d="M34 30 L36 32 L34 34 L32 32 Z" fill="url(#iconGradient4)" />
            <rect x="38" y="28" width="5" height="12" rx="2" fill="url(#iconGradient2)" />
            <rect x="45" y="22" width="5" height="18" rx="2" fill="url(#iconGradient3)" />
            <rect x="52" y="16" width="5" height="24" rx="2" fill="url(#iconGradient4)" />
            <path d="M57 10 L62 15 L57 20 Z" fill="url(#iconGradient4)" />
          </g>
          <defs>
            <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%" >
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%" >
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="iconGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="iconGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <p className="text-text-secondary">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}