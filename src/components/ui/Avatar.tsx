import { cn } from '@/lib/cn'
import { getInitials } from '@/lib/format'
import { SmartImage } from './SmartImage'

interface AvatarProps {
  firstName: string
  lastName: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
}

export function Avatar({ firstName, lastName, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(firstName || '?', lastName || '?')

  if (src) {
    return (
      <SmartImage
        src={src}
        alt={`${firstName} ${lastName}`}
        fallbackSeed={`${firstName} ${lastName}`}
        className={cn('shrink-0 rounded-full object-cover', SIZES[size], className)}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
