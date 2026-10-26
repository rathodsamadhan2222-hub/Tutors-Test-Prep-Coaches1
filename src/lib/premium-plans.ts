export const STARTER_PRICE = 999;
export const STARTER_LEARNER_LIMIT = 5;
export const MONTHLY_PRICE = 2499;
export const QUARTERLY_PRICE = 6999;
export const QUARTERLY_BASELINE = MONTHLY_PRICE * 3;
export const QUARTERLY_SAVING = QUARTERLY_BASELINE - QUARTERLY_PRICE;
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
/** Starter coaches hit the paywall when adding beyond the learner limit. */
export const needsProForNewLearner = (plan: string, currentLearners: number) =>
  plan === "free" && currentLearners >= STARTER_LEARNER_LIMIT;
