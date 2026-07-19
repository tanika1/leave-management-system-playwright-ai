export type DateFactory = ReturnType<typeof createDateFactory>;

function pad2(n: number) { return String(n).padStart(2, '0'); }

function toYMD(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function createDateFactory() {
  // Uses UTC to align with backend date validation rules.
  function today(): string {
    const now = new Date();
    return toYMD(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
  }

  function addDaysUTC(d: Date, days: number) {
    const copy = new Date(d.getTime());
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
  }

  function isWeekendUTC(d: Date) {
    const day = d.getUTCDay();
    return day === 0 || day === 6; // Sun or Sat
  }

  function nextWeekday(offsetDays = 1): string {
    const now = new Date();
    let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d = addDaysUTC(d, offsetDays);
    while (isWeekendUTC(d)) d = addDaysUTC(d, 1);
    return toYMD(d);
  }

  function rangeWeekdays(startOffset: number, days: number): { startDate: string; endDate: string } {
    const now = new Date();
    let start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start = addDaysUTC(start, startOffset);
    while (isWeekendUTC(start)) start = addDaysUTC(start, 1);

    let count = 1;
    let end = new Date(start.getTime());
    while (count < days) {
      end = addDaysUTC(end, 1);
      if (!isWeekendUTC(end)) count++;
    }
    return { startDate: toYMD(start), endDate: toYMD(end) };
  }

  function weekendOnlyRange(): { startDate: string; endDate: string } {
    // Next Saturday-Sunday
    const now = new Date();
    let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    while (d.getUTCDay() !== 6) d = addDaysUTC(d, 1); // move to Saturday
    const start = d;
    const end = addDaysUTC(start, 1); // Sunday
    return { startDate: toYMD(start), endDate: toYMD(end) };
  }

  return { today, nextWeekday, rangeWeekdays, weekendOnlyRange };
}
