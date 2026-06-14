import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
    >
      <defs>
        <linearGradient id="grad1" x1="27.5" y1="20" x2="57.5" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="grad2" x1="52.5" y1="20" x2="82.5" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#9ca3af" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path
          d="M 27.5 20 h 15 a 15 15 0 0 1 0 30 h -10 a 15 15 0 0 0 0 30 h 15"
          stroke="url(#grad1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 52.5 20 h 15 a 15 15 0 0 1 0 30 h -10 a 15 15 0 0 0 0 30 h 15"
          stroke="url(#grad2)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
