export const prices = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  business: process.env.STRIPE_PRICE_BUSINESS ?? ""
};
