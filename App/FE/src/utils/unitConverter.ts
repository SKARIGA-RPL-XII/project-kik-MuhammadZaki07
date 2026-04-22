export const convertToBaseUnit = (
  amount: number,
  multiplier: number,
): number => {
  return amount * multiplier;
};

export const formatToDisplay = (amount: number, multiplier: number): number => {
  return amount / multiplier;
};
