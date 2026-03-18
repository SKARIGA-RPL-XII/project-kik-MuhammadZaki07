export function formatCurrency(amount: number): string {
  const roundedAmount = Math.round(amount);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(roundedAmount);
}
