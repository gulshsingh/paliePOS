import { useUpdateOrderStatus as useUpdateOrderStatusMutation } from './useOrders';
import { useUpdateItemStatus } from './useOrders';
import { useOrderStore } from '../store/orderStore';
import { ApiOrderItemStatus } from '../types/order';

export function useUpdateOrderStatus() {
  const updateRemote = useUpdateOrderStatusMutation();
  const updateItemRemote = useUpdateItemStatus();

  const updateItemStatusLocally = (itemId: string, status: ApiOrderItemStatus) => {
    const { orders, updateItemStatus } = useOrderStore.getState();
    const order = orders.find((o) => o.items.some((i) => i.id === itemId));
    // Sync local zustand copy if the order is known (created in this session)
    if (order) {
      updateItemStatus(order.id, itemId, status);
    }
    // Always push to the server — server-loaded orders are not in zustand
    updateItemRemote.mutate({ item_id: itemId, status });
  };

  return {
    updateItemStatusLocally,
    updateOrderStatus: (orderId: string, status: string) =>
      updateRemote.mutate({ orderId, status }),
    isPending: updateRemote.isPending || updateItemRemote.isPending,
  };
}
