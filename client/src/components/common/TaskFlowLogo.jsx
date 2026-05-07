export function TaskFlowLogo({ className = 'h-12 w-12' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#bg)" />
      <path
        d="M20 22H44"
        stroke="#04111D"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 32H36"
        stroke="#04111D"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 42H30"
        stroke="#04111D"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M41 39L45 43L53 31"
        stroke="#04111D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
