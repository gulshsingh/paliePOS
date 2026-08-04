export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
};
