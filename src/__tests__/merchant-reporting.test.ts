import { describe, it, expect } from "vitest";
import { periodBuckets, dayKey } from "@/lib/merchant-reporting";
describe("merchant reporting periods", () => {
  it("keeps every day in a long custom period with at most 31 chart bars", () => {
    const buckets = periodBuckets("2026-01-01", "2026-12-31");
    expect(buckets.length).toBeLessThanOrEqual(31);
    expect(buckets[0].start).toBe("2026-01-01");
    expect(buckets.at(-1)?.end).toBe("2026-12-31");
    for (let i = 1; i < buckets.length; i++) {
      const next = new Date(`${buckets[i - 1].end}T12:00:00+06:00`);
      next.setDate(next.getDate() + 1);
      expect(buckets[i].start).toBe(dayKey(next));
    }
  });
  it("uses Bangladesh calendar days at the UTC date boundary", () => {
    expect(dayKey("2026-10-22T20:00:00Z")).toBe("2026-10-23");
    expect(periodBuckets("2026-10-23", "2026-10-23")).toEqual([
      { start: "2026-10-23", end: "2026-10-23", label: "10-23" },
    ]);
  });
});
