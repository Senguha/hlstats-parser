import type { ChartOption, GameSession, GameSessionShort } from "@/types/types"

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

export function formatSecondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const timeString = formatMinutesToTime(minutes);
  return timeString;
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

  const compDate = new Date(date);
  const now = new Date()
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return compDate >= daysAgo
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


export function fillMissingDates(data: GameSession[], filter?: ChartOption): GameSessionShort[] {
  if (!data || data.length === 0) return [];
  
  // Sort the data by date
  const sorted = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Helper function to get date string in YYYY-MM-DD format
  const getDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Helper function to format date for display
  const formatDateDisplay = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };
  
  // Get start and end dates
  let startDate = new Date(sorted[0].date);
  let endDate = new Date();
  
  if (filter?.type === "30days") {
    startDate = new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);
  } else if (filter?.type === "7days") {
    startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
  } else if (filter?.type === "Range") {
    startDate = new Date(filter.startRange.getTime()+ 24 * 60 * 60 * 1000);
    endDate = new Date(filter.endRange.getTime()+ 24 * 60 * 60 * 1000);
  }
  
  // Create a map for quick lookup (using date string as key)
  const dataMap = new Map<string, GameSession>();
  sorted.forEach(item => {
    const dateKey = getDateKey(new Date(item.date));
    dataMap.set(dateKey, item);
  });
  
  // Get date keys for iteration
  const startKey = getDateKey(startDate);
  const endKey = getDateKey(endDate);
  
  // Fill in missing dates
  const result: GameSessionShort[] = [];
  const currentDate = new Date(startKey + 'T00:00:00.000Z'); // Use UTC to avoid timezone issues
  const finalDate = new Date(endKey + 'T00:00:00.000Z');
  
  while (currentDate <= finalDate) {
    const dateKey = getDateKey(currentDate);
    
    if (dataMap.has(dateKey)) {
      const session = dataMap.get(dateKey)!;
      result.push({
        date: formatDateDisplay(dateKey),
        timeInSeconds: session.timeInSeconds
      });
    } else {
      // Add missing date with timeInSeconds 0
      result.push({
        date: formatDateDisplay(dateKey),
        timeInSeconds: 0
      });
    }
    
    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return result.reverse();
}
