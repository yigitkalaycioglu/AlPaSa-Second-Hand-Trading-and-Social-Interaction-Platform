type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[]

/**
 * Koşullu sınıf adlarını birleştirir.
 * (clsx'in ihtiyaç duydugumuz kadarlık, bağımlılıksız karşılığı.)
 */
export function cn(...inputs: ClassValue[]): string {
  const output: string[] = []

  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) output.push(nested)
    } else {
      output.push(String(input))
    }
  }

  return output.join(' ')
}
