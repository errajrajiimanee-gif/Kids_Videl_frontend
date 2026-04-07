export function formatMAD(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits,
  }).format(value);
}

export function getMockDiscountPercent(productId: number) {
  if (productId % 5 === 0) return 30;
  if (productId % 3 === 0) return 15;
  return 0;
}

export function getMockRating(productId: number) {
  const base = 3.9 + (productId % 12) * 0.1;
  return Math.min(5, Math.round(base * 10) / 10);
}

export function getMockReviewCount(productId: number) {
  return 12 + (productId % 25) * 3;
}

