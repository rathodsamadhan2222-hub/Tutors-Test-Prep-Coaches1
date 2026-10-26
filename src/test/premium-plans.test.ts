import { describe, expect, it } from "vitest";
import { STARTER_PRICE, MONTHLY_PRICE, QUARTERLY_PRICE, QUARTERLY_SAVING, needsProForNewLearner } from "@/lib/premium-plans";

describe("Coach plans", () => {
  it("prices Starter at ₹999 and Pro at ₹2,499 / ₹6,999", () => {
    expect(STARTER_PRICE).toBe(999);
    expect(MONTHLY_PRICE).toBe(2499);
    expect(QUARTERLY_PRICE).toBe(6999);
  });
  it("quarterly saves ₹498 vs three ₹2,499 months", () => expect(QUARTERLY_SAVING).toBe(498));
  it("Starter allows 5 learners, blocks the 6th", () => {
    expect(needsProForNewLearner("free", 4)).toBe(false);
    expect(needsProForNewLearner("free", 5)).toBe(true);
    expect(needsProForNewLearner("monthly", 50)).toBe(false);
  });
});
