import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, createOrder, updateItemStatus, updateOrderStatus } from '../api/services/orders';
import { CreateOrderPayload } from '../types/api';

export function useOrders(itemStatus?: string) {
  return useInfiniteQuery({
    queryKey: ['orders', itemStatus],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getOrders({ item_status: itemStatus, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_cursor ?? undefined,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { item_id: string; status: string }) => updateItemStatus(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
