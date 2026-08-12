import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** AlPaSa marka işareti: "Al, Pazarla, Sat" döngüsünü anlatan halka. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden>
      <defs>
        <linearGradient id="alpasa-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#alpasa-logo)" />
      <path
        d="M12 24.5 L20 11 L28 24.5"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 21.5 H24.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="20" cy="29.5" r="2.2" fill="white" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          AlPaSa
        </span>
        <span className="text-[0.625rem] font-medium tracking-widest text-slate-400 uppercase">
          Al · Pazarla · Sat
        </span>
      </span>
    </Link>
  )
}
