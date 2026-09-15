import { describe, it, expect } from "vitest";
import { formatDisplayDate } from "./formatDate";

describe("formatDisplayDate", () => {
  it("renders an ISO date as Month Day, Year", () => {
    expect(formatDisplayDate("2026-09-09")).toBe("September 9, 2026");
  });

  it("does not shift the day across time zones", () => {
    expect(formatDisplayDate("2026-01-01")).toBe("January 1, 2026");
    expect(formatDisplayDate("2026-12-31")).toBe("December 31, 2026");
  });
});
