export const calculateOrder = (items: any[], config: any) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const taxRate = Number(config.tax_percent?.value || 0);
    const serviceRate = Number(config.service_percent?.value || 0);
    const isTaxActive = config.is_tax_active?.value === 1;
    const isServiceActive = config.is_service_active?.value === 1;

    const serviceAmount = isServiceActive ? (subtotal * serviceRate / 100) : 0;

    let taxAmount = 0;
    if (isTaxActive) {
        if (config.tax_type?.value === "subtotal_only") {
            taxAmount = (subtotal * taxRate / 100);
        } else {
            taxAmount = ((subtotal + serviceAmount) * taxRate / 100);
        }
    }

    const total = subtotal + serviceAmount + taxAmount;

    return {
        subtotal,
        serviceAmount,
        taxAmount,
        total: Math.round(total)
    };
};