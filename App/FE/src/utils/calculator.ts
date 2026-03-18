export const calculateOrder = (items: any[], settings: any) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.discount_price !== null && item.discount_price !== undefined
      ? Number(item.discount_price)
      : Number(item.price);
    return acc + (price * Number(item.quantity));
  }, 0);

  const servicePercent = Number(settings?.service_percent || 0);
  const taxPercent = Number(settings?.tax_percent || 0);

  const serviceAmount = (settings?.is_service_active == true || settings?.is_service_active == 1)
    ? (subtotal * servicePercent / 100)
    : 0;

  const taxAmount = (settings?.is_tax_active == true || settings?.is_tax_active == 1)
    ? ((subtotal + serviceAmount) * taxPercent / 100)
    : 0;

  const total = subtotal + serviceAmount + taxAmount;

  return { subtotal, serviceAmount, taxAmount, total };
};