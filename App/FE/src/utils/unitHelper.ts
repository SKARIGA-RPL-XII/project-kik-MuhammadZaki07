export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  multiplier: number;
  category: 'weight' | 'volume' | 'unit';
  base_unit_id?: number | null;
}

/**
 * Mengonversi input user ke nilai Base Unit (Gram/Ml/Pcs)
 * @param amount - Angka yang diinput user (misal: 1.5)
 * @param multiplier - Pengali dari unit yang dipilih (misal: 1000 untuk Kg)
 */
export const toBaseValue = (amount: number, multiplier: number): number => {
  if (isNaN(amount)) return 0;
  return amount * multiplier;
};

/**
 * Mengonversi nilai dari DB (Base Unit) kembali ke nilai display unit tertentu
 * @param baseAmount - Angka dari DB (misal: 1500)
 * @param targetMultiplier - Pengali unit tujuan (misal: 1000 untuk Kg)
 */
export const fromBaseValue = (baseAmount: number, targetMultiplier: number): number => {
  if (!targetMultiplier || targetMultiplier === 0) return baseAmount;
  return baseAmount / targetMultiplier;
};