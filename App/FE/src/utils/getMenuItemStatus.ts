export const getMenuItemStatus = (item: any) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isOutOfStock = item.stocks?.some(
    (stock: any) => (stock.quantity ?? 0) < (stock.pivot?.amount || 0),
  );

  const isBestSeller = !isOutOfStock && item.is_best_seller;

  let hasDiscount = false;

  if (
    item.discount &&
    item.discount.is_active === 1 &&
    item.discount.value_discount > 0
  ) {
    const startDate = new Date(item.discount.start_date);
    const endDate = new Date(item.discount.end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const isWithinRange = now >= startDate && now <= endDate;

    if (isWithinRange) {
      hasDiscount = true;
    }
  }

  const discountedPrice = hasDiscount
    ? Math.round(item.price - (item.price * item.discount.value_discount) / 100)
    : item.price;

  return {
    isOutOfStock,
    isBestSeller,
    hasDiscount,
    discountedPrice,
    imagePath:
      item.menu_image && item.menu_image !== "image-dumy.png"
        ? `${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`
        : "/image-dumy.png",
  };
};
