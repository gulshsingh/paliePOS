export const calculateTax = (price: number, taxPercent: number): number => {
  return parseFloat(((price * taxPercent) / 100).toFixed(2));
};

export const calculateTotal = (price: number, qty: number): number => {
  return parseFloat((price * qty).toFixed(2));
};

export const calculateGrandTotal = (subtotal: number, tax: number, discount = 0): number => {
  return parseFloat((subtotal + tax - discount).toFixed(2));
};
