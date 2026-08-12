/**
 * Görsel yüklenemediği durumlar için, metinden türetilmiş degradeli SVG
 * yer tutucu üretir. Ağ bağlantısı gerektirmez, her zaman çalışır.
 */

const PALETTES: Array<[string, string]> = [
  ['#6366f1', '#a855f7'],
  ['#0ea5e9', '#22d3ee'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#0ea5e9'],
  ['#ec4899', '#8b5cf6'],
  ['#14b8a6', '#84cc16'],
]

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Başlıktan türetilmiş, kararlı (aynı metin -> aynı görsel) SVG data URI. */
export function createPlaceholder(text: string, width = 800, height = 600): string {
  const hash = hashString(text || 'AlPaSa')
  const [from, to] = PALETTES[hash % PALETTES.length]
  const label = escapeXml(
    (text || 'AlPaSa')
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toLocaleUpperCase('tr') || 'AP',
  )

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${from}"/>
    <stop offset="100%" stop-color="${to}"/>
  </linearGradient>
</defs>
<rect width="${width}" height="${height}" fill="url(#g)"/>
<circle cx="${width * 0.82}" cy="${height * 0.18}" r="${height * 0.3}" fill="#ffffff" opacity="0.08"/>
<circle cx="${width * 0.15}" cy="${height * 0.85}" r="${height * 0.22}" fill="#ffffff" opacity="0.08"/>
<text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#ffffff" fill-opacity="0.92"
  font-family="system-ui, -apple-system, Segoe UI, sans-serif"
  font-size="${Math.round(height * 0.28)}" font-weight="700">${label}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Kullanıcı avatarı için kare yer tutucu. */
export function createAvatarPlaceholder(name: string): string {
  return createPlaceholder(name, 200, 200)
}
