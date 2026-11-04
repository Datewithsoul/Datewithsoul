export const TIME_ZONE = "Asia/Bangkok";

const BANGKOK_UTC_OFFSET_HOURS = 7;
const MS_PER_HOUR = 3_600_000;
const BANGKOK_OFFSET_MS = BANGKOK_UTC_OFFSET_HOURS * MS_PER_HOUR;

/**
 * Today's Bangkok calendar date as UTC midnight, the form class dates are stored in.
 * Compare it with ClassEvent.date / endDate. Gives the same result on the server (UTC) and in the browser.
 */
export function bangkokToday(now = new Date()) {
  const bangkok = new Date(now.getTime() + BANGKOK_OFFSET_MS);
  return new Date(Date.UTC(bangkok.getUTCFullYear(), bangkok.getUTCMonth(), bangkok.getUTCDate()));
}

/** The instant today began in Bangkok (00:00 +07:00). Compare it with timestamps such as createdAt. */
export function bangkokStartOfDay(now = new Date()) {
  return new Date(bangkokToday(now).getTime() - BANGKOK_OFFSET_MS);
}

/** A stored class date (UTC midnight) moved by whole days. */
export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
