import { TZ_OFFSET } from "contants";

export function formatWithTzOffset(date: Date | string): string {
  return new Date(
    new Date(date).toISOString().replace("Z", "").concat(TZ_OFFSET)
  ).toISOString();
}

export function getDateInseconds(date: Date | string) {
  return new Date(date).getTime() / 1000;
}

export function setStartHour(date: Date | string): string {
  const result = new Date(date);
  result.setUTCMilliseconds(0);
  result.setUTCSeconds(0);
  result.setUTCMinutes(0);
  return result.toISOString();
}

export function setStartYear(date: Date | string): string {
  const result = new Date(date);
  result.setUTCMilliseconds(0);
  result.setUTCSeconds(0);
  result.setUTCMinutes(0);
  result.setUTCHours(0);
  result.setUTCDate(1);
  result.setUTCMonth(0);
  return result.toISOString();
}

export function setEndHour(date: Date | string): string {
  const result = new Date(date);
  result.setUTCMilliseconds(999);
  result.setUTCSeconds(59);
  result.setUTCMinutes(59);
  return result.toISOString();
}
