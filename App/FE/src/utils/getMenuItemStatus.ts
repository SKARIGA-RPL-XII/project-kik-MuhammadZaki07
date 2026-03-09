export const getMenuItemStatus = (item: any) => {
  const isOutOfStock = item.stocks?.some(
    (stock: any) => (stock.quantity ?? 0) < (stock.pivot?.amount || 0)
  );

  const isBestSeller = !isOutOfStock && item.is_best_seller;

  const hasDiscount = item.discount && item.discount.value_discount > 0;
  
  const discountedPrice = hasDiscount
    ? item.price - (item.price * item.discount!.value_discount) / 100
    : item.price;

  return {
    isOutOfStock,
    isBestSeller,
    hasDiscount,
    discountedPrice,
    imagePath: `${import.meta.env.VITE_STORAGE_URL}/${item.menu_image}`
  };
};