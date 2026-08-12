const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const relativeFormatter = new Intl.RelativeTimeFormat('tr-TR', { numeric: 'auto' })

export function formatPrice(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

/** "3 gün önce", "az önce" gibi göreli zaman metni üretir. */
export function formatRelativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const absDiff = Math.abs(diff)

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (absDiff >= ms) {
      return relativeFormatter.format(Math.round(diff / ms), unit)
    }
  }
  return 'az önce'
}

/** 1250 -> "1,2B" şeklinde kısaltır (istatistik kartları için). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(value)
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase('tr')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
