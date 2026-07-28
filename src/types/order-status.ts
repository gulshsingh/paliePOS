export const ORDER_STATUS_FLOW: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'completed',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};

export const ORDER_TABS = ['PENDING', 'KITCHEN', 'SERVING', 'SERVED'] as const;

export type OrderTab = (typeof ORDER_TABS)[number];
