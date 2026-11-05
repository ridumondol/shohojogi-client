import { addDays, format, isValid, parseISO } from "date-fns";

export function formatEventDate(dateValue: string | undefined, pattern: string): string {
  if (!dateValue) return "";

  const date = parseISO(`${dateValue.slice(0, 10)}T00:00:00`);
  return isValid(date) ? format(date, pattern) : "";
}

export function formatTimestamp(dateValue: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseISO(dateValue);
  return isValid(date)
    ? new Intl.DateTimeFormat("en-BD", { ...options, timeZone: "UTC" }).format(date)
    : "";
}

export function getDateStringAfter(dateValue: string, days: number): string {
  const date = parseISO(`${dateValue}T00:00:00`);
  return format(addDays(date, days), "yyyy-MM-dd");
}
