export function getDiscountPercent(course = {}) {
  return Math.min(
    100,
    Math.max(0, Number(course.discountPercent ?? course.discount_percent) || 0)
  );
}

export function normalizeCoursePricing(course = {}) {
  const price = Number(course.price) || 0;
  const discountPercent = getDiscountPercent(course);
  const computed = lineTotal(price, discountPercent);
  const finalPrice =
    Number(course.finalPrice) > 0 ? Number(course.finalPrice) : computed;
  return {
    ...course,
    price,
    discountPercent,
    finalPrice,
  };
}

/** Payable line amount (price after course discount %). */
export function getItemPayableTotal(course = {}) {
  const normalized = normalizeCoursePricing(course);
  return normalized.finalPrice;
}

export function lineTotal(price, discountPercent = 0) {
  const p = Number(price) || 0;
  const d = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  return Math.round(p * (1 - d / 100) * 100) / 100;
}

export function cartTotals(items = []) {
  const subtotal = items.reduce(
    (sum, c) => sum + (Number(c.price) || 0),
    0
  );

  const total = items.reduce(
    (sum, c) => sum + getItemPayableTotal(c),
    0
  );

  const discount = subtotal - total;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
// export function cartTotals(items = []) {
//   const total = items.reduce((sum, c) => sum + getItemPayableTotal(c), 0);
//   return {
//     total: Math.round(total * 100) / 100,
//   };
// }

export function formatRupee(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}
