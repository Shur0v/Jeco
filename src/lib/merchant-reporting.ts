export function dayKey(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
/** Cover a whole custom period with at most 31 readable chart bars. */
export function periodBuckets(start: string, end: string) {
  const total = Math.max(
    1,
    Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
    ) + 1,
  );
  const span = Math.max(1, Math.ceil(total / 31));
  return Array.from({ length: Math.ceil(total / span) }, (_, i) => {
    const from = new Date(`${start}T12:00:00+06:00`);
    from.setDate(from.getDate() + i * span);
    const to = new Date(from);
    to.setDate(to.getDate() + span - 1);
    const a = dayKey(from),
      b = dayKey(to) > end ? end : dayKey(to);
    return {
      start: a,
      end: b,
      label: span === 1 ? a.slice(5) : `${a.slice(5)}–${b.slice(5)}`,
    };
  });
}
