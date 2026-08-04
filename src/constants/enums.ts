export enum OrderStatus {
  PENDING   = 'PENDING',
  KITCHEN   = 'KITCHEN',
  SERVING   = 'SERVING',
  SERVED    = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID  = 'UNPAID',
  PAID    = 'PAID',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethod {
  CASH   = 'cash',
  CARD   = 'card',
  UPI    = 'upi',
  OTHER  = 'other',
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED  = 'occupied',
}

export enum ItemStatus {
  PENDING   = 'pending',
  PREPARING = 'preparing',
  READY     = 'ready',
  SERVED    = 'served',
}
