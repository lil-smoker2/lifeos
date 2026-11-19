const pad = (value: number) => String(value).padStart(2, '0')

export function clockTime(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function dayOf(iso: string): number {
  return new Date(iso).getDate()
}

export function localDateTime(year: number, monthIndex: number, day: number, time: string): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}T${time}:00`
}
