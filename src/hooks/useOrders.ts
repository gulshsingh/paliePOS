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

function applyItemStatusInPage(page: any, itemId: string, status: string): any {
  if (!page || !page.data) return page;
  const root = page.data;
  // paginated shape: root.data = { data: [...], pagination }
  // flat shape:      root.data = [...]
  const list: any[] | null = Array.isArray(root?.data?.data)
    ? root.data.data
    : Array.isArray(root?.data)
    ? root.data
    : null;
  if (!list) return page;

  const nextList = list.map((order: any) => {
    if (!order || !Array.isArray(order.items)) return order;
    return {
      ...order,
      items: order.items.map((it: any) =>
        it && it.id === itemId ? { ...it, status } : it,
      ),
    };
  });

  if (Array.isArray(root?.data?.data)) {
    return { ...page, data: { ...root, data: { ...root.data, data: nextList } } };
  }
  return { ...page, data: { ...root, data: nextList } };
}

function applyItemStatusInCache(old: any, itemId: string, status: string): any {
  if (!old) return old;
  // useInfiniteQuery stores data as { pages, pageParams }
  if (Array.isArray(old?.pages)) {
    return {
      ...old,
      pages: old.pages.map((page: any) => applyItemStatusInPage(page, itemId, status)),
    };
  }
  return applyItemStatusInPage(old, itemId, status);
}

export function useUpdateItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { item_id: string; status: string }) => updateItemStatus(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['orders'] });
      const previous = qc.getQueriesData({ queryKey: ['orders'] });
      qc.setQueriesData(
        { queryKey: ['orders'] },
        (old: any) => applyItemStatusInCache(old, data.item_id, data.status),
      );
      return { previous };
    },
    onError: (e, data, context) => {
      console.warn(
        `[status] item ${data.item_id} -> ${data.status} failed:`,
        (e as any)?.response?.status,
        (e as any)?.response?.data,
        e,
      );
      if (context?.previous) {
        for (const [key, value] of context.previous) {
          qc.setQueryData(key, value);
        }
      }
    },
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
