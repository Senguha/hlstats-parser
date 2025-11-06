export function parseTimeToMinutes(timeString: string): number {
  // Parse time strings like "0d 02:30:45" (days hours:minutes:seconds)
  const match = timeString.match(/(\d+)d\s+(\d+):(\d+):(\d+)/)

  if (!match) {
    // Parse time strings like "1h 30m", "45m", "2h", etc.
    const hours = timeString.match(/(\d+)h/)
    const minutes = timeString.match(/(\d+)m/)

    const h = hours ? Number.parseInt(hours[1]) : 0
    const m = minutes ? Number.parseInt(minutes[1]) : 0

    return h * 60 + m
  }

  const days = Number.parseInt(match[1])
  const hours = Number.parseInt(match[2])
  const minutes = Number.parseInt(match[3])
  const seconds = Number.parseInt(match[4])

  // Convert everything to minutes
  return days * 24 * 60 + hours * 60 + minutes + Math.round(seconds / 60)
}

export function formatMinutesToTime(minutes: number): string {
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = minutes % 60

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`
  }
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function parseDateString(dateString: string): Date | null {
  // Parse dates like "2025-01-15 14:30:00" or "15/01/2025 14:30"
  try {
    // Try ISO format first
    let date = new Date(dateString)
    if (!isNaN(date.getTime())) return date

    // Try DD/MM/YYYY HH:MM format
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/)
    if (parts) {
      const [, day, month, year, hour, minute] = parts
      date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
        Number.parseInt(hour),
        Number.parseInt(minute),
      )
      if (!isNaN(date.getTime())) return date
    }

    return null
  } catch {
    return null
  }
}

export function isWithinDays(date: Date, days: number): boolean {

  const now = new Date()
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return date >= daysAgo
}

export function parseTimeToSeconds(timeString: string): number {
  // Parse time strings like "0d 02:30:45" (days hours:minutes:seconds)
  const match = timeString.match(/(\d+)d\s+(\d+):(\d+):(\d+)/)

  if (!match) {
    return 0
  }

  const days = Number.parseInt(match[1])
  const hours = Number.parseInt(match[2])
  const minutes = Number.parseInt(match[3])
  const seconds = Number.parseInt(match[4])

  // Convert everything to seconds
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
}
