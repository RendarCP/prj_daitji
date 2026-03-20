interface DaitjiLogoProps {
  className?: string;
}

export function DaitjiLogo({ className }: DaitjiLogoProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-label="Daitji logo"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="daitji-logo-stroke"
          x1="48"
          y1="32"
          x2="118"
          y2="118"
        >
          <stop
            offset="0"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.98"
          />
          <stop
            offset="1"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.76"
          />
        </linearGradient>
        <linearGradient
          id="daitji-logo-top-face"
          x1="53"
          y1="34"
          x2="107"
          y2="66"
        >
          <stop
            offset="0"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.92"
          />
          <stop
            offset="1"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.78"
          />
        </linearGradient>
        <linearGradient
          id="daitji-logo-left-face"
          x1="48"
          y1="50"
          x2="82"
          y2="110"
        >
          <stop
            offset="0"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.16"
          />
          <stop
            offset="1"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.07"
          />
        </linearGradient>
        <linearGradient
          id="daitji-logo-right-face"
          x1="80"
          y1="48"
          x2="112"
          y2="98"
        >
          <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="daitji-logo-fill" x1="58" y1="50" x2="103" y2="102">
          <stop offset="0" stopColor="hsl(var(--foreground))" />
          <stop
            offset="1"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.82"
          />
        </linearGradient>
        <radialGradient
          id="daitji-logo-core"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(80 82) rotate(90) scale(54)"
        >
          <stop
            offset="0"
            stopColor="hsl(var(--foreground))"
            stopOpacity="0.16"
          />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <filter
          id="daitji-logo-glow"
          x="24"
          y="20"
          width="112"
          height="116"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.31 0 0 0 0 0.93 0 0 0 0 0.56 0 0 0 0.26 0"
          />
        </filter>
      </defs>

      <circle cx="80" cy="84" r="48" fill="url(#daitji-logo-core)" />
      <ellipse
        cx="80"
        cy="108"
        rx="35"
        ry="11"
        fill="hsl(var(--primary))"
        fillOpacity="0.07"
      />

      <g filter="url(#daitji-logo-glow)" opacity="0.96">
        <path
          d="M80 30L112 49V91L80 112L48 91V49L80 30Z"
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>

      <path
        d="M80 30L112 49V91L80 112L48 91V49L80 30Z"
        fill="hsl(var(--card))"
        fillOpacity="0.08"
        stroke="url(#daitji-logo-stroke)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M80 30L112 49L80 68L48 49L80 30Z"
        fill="url(#daitji-logo-top-face)"
      />
      <path
        d="M48 49L80 68V112L48 91V49Z"
        fill="url(#daitji-logo-left-face)"
      />
      <path
        d="M112 49L80 68V112L112 91V49Z"
        fill="url(#daitji-logo-right-face)"
      />
      <path
        d="M80 30L80 112"
        stroke="url(#daitji-logo-stroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M48 49L80 68L112 49"
        stroke="url(#daitji-logo-stroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 91L80 112L112 91"
        stroke="url(#daitji-logo-stroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x="80"
        y="132"
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fillOpacity="0.82"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.28em"
      >
        DAITJI
      </text>
    </svg>
  );
}
