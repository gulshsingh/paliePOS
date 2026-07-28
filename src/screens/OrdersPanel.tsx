import { useState, useMemo, useCallback } from 'react';
import { Order } from '../types/order';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import OrderCard from '../components/OrderCard';
import Skeleton from '../components/Skeleton';
import { useOrders } from '../hooks/useOrders';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import { useCart } from '../hooks/useCart';
import { ORDER_TABS, OrderTab } from '../types/order-status';
import { theme } from '../theme';

const TAB_ITEM_STATUS: Record<OrderTab, string> = {
  PENDING: 'pending',
  KITCHEN: 'preparing',
  SERVING: 'ready',
  SERVED: 'served',
};

export default function OrdersPanel({ onBillToCart }: { onBillToCart?: () => void }) {
  const [activeTab, setActiveTab] = useState<OrderTab>('PENDING');
  const { data, isLoading } = useOrders(TAB_ITEM_STATUS[activeTab]);
  const { updateItemStatusLocally } = useUpdateOrderStatus();
  const { onBillOrder } = useCart();

  const handleBillOrder = useCallback((order: Order) => {
    onBillOrder(order);
    onBillToCart?.();
  }, [onBillOrder, onBillToCart]);

  const renderOrder = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onBillOrder={handleBillOrder}
      onUpdateStatus={updateItemStatusLocally}
    />
  ), [handleBillOrder, updateItemStatusLocally]);

  const orders = useMemo(() => {
    const allOrders = data?.pages.flatMap((p) => {
      const d = (p.data as any);
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [];
    return allOrders.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      items: (o.items ?? []).map((i: any) => ({
        id: i.id,
        name: i.product?.name ?? i.product_name ?? '',
        price: Number(i.total),
        price_per_unit: Number(i.price),
        qty: Number(i.quantity),
        tax: 0,
        status: i.status,
      })),
      total: Number(o.grand_total),
      status: o.status,
      paymentStatus: o.payment_status,
      table_name: o.table?.name,
      customer_name: o.account?.name,
    }));
  }, [data]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {ORDER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <FlatList
          data={[1,2,3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => (
            <View style={styles.orderSkeleton}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Skeleton width={100} height={18} borderRadius={6} />
                <Skeleton width={80} height={18} borderRadius={6} />
              </View>
              <Skeleton width="40%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
              <Skeleton width="30%" height={14} borderRadius={6} style={{ marginTop: 4 }} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No {activeTab} orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 16 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  orderSkeleton: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  },
});
