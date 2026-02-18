import { useSettings } from "@/context/SettingsContext";

export const useCalculateBilling = () => {
  const { getSetting } = useSettings();

  const calculate = (subtotal: number) => {
    const isTaxActive = getSetting('is_tax_active', true);
    const isServiceActive = getSetting('is_service_active', true);
    const taxPercent = getSetting('tax_percent', 0);
    const servicePercent = getSetting('service_percent', 0);
    const taxType = getSetting('tax_type', 'after_service');

    let serviceCharge = 0;
    if (isServiceActive) {
      serviceCharge = subtotal * (servicePercent / 100);
    }

    let taxUsage = 0;
    if (isTaxActive) {
      const baseForTax = taxType === 'after_service' ? (subtotal + serviceCharge) : subtotal;
      taxUsage = baseForTax * (taxPercent / 100);
    }

    const total = subtotal + serviceCharge + taxUsage;

    return {
      subtotal,
      serviceCharge,
      taxUsage,
      total,
      taxPercent,
      servicePercent
    };
  };

  return { calculate };
};