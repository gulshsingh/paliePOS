import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Skeleton from '../common/Skeleton';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import { useTables } from '../../hooks/useTables';
import { useCartStore } from '../../store/cartStore';
import { useCustomerStore } from '../../store/customerStore';
import { useFlowStore } from '../../store/flowStore';
import { useOrderStore } from '../../store/orderStore';
import { useTableStore } from '../../store/tableStore';
import { theme } from '../../theme';
import type { FlowDraft } from '../../types/flow';
import type { Order } from '../../types/order';
import { extractList } from '../../utils/apiHelpers';
import { mapApiItemsToCart } from '../../utils/orderMappers';
import {
  FlowDraftCard,
  FlowOrderCard,
  isToday,
} from './FlowPanel.components';
import { styles } from './FlowPanel.styles';

interface Props {
  onResume: () => void;
  onPayOrder?: () => void;
}

export default function FlowPanel({ onResume, onPayOrder }: Props) {
  const drafts = useFlowStore(s => s.drafts);
  const setActiveDraftId = useFlowStore(s => s.setActiveDraftId);
  const removeDraft = useFlowStore(s => s.removeDraft);
  const setCart = useCartStore(s => s.setCart);
  const clearCart = useCartStore(s => s.clearCart);
  const setSelectedTable = useTableStore(s => s.setSelectedTable);
  const setSelectedCustomer = useCustomerStore(s => s.setSelectedCustomer);
  const sessionOrders = useOrderStore(s => s.orders);
  const setActiveOrder = useOrderStore(s => s.setActiveOrder);
  const itemStatusOverrides = useOrderStore(s => s.itemStatusOverrides);

  const { data, isLoading } = useOrders();
  const tablesData = useTables();
  const customersData = useCustomers();

  const tableMap = useMemo(() => {
    const list = extractList(tablesData.data);
    return new Map<string, string>(
      (list ?? []).map((t: any) => [t.id, t.name]),
    );
  }, [tablesData.data]);

  const customerMap = useMemo(() => {
    const list =
      customersData.data?.pages.flatMap((p: any) => extractList(p.data)) ?? [];
    return new Map<string, string>(list.map((c: any) => [c.id, c.name]));
  }, [customersData.data]);

  const apiOrders = useMemo(() => {
    const all = data?.pages.flatMap(p => extractList(p.data)) ?? [];
    return all
      .filter((o: any) => isToday(o.created_at))
      .map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        items: mapApiItemsToCart(o.items ?? [], {}).map(item => ({
          ...item,
          status: itemStatusOverrides[item.id] ?? item.status,
        })),
        total: Number(o.grand_total),
        tax_amount: Number(o.tax_amount) || 0,
        status: o.status,
        invoice: o.invoice === true,
        paymentStatus: o.payment_status ?? 'UNPAID',
        table_id: o.table_id,
        account_id: o.account_id,
        table_name: o.table?.name ?? tableMap.get(o.table_id) ?? '',
        customer_name: o.account?.name ?? customerMap.get(o.account_id) ?? '',
      }));
  }, [data, itemStatusOverrides, tableMap, customerMap]);

  const orders = useMemo(() => {
    const merged = new Map<string, Order>();
    for (const o of apiOrders) merged.set(o.id, o);
    for (const o of sessionOrders) merged.set(o.id, o);
    return [...merged.values()];
  }, [apiOrders, sessionOrders]);

  const handleSelectOrder = (order: Order) => {
    clearCart();
    setActiveOrder(order.id);
    if (order.table_id && order.table_name) {
      setSelectedTable({
        id: order.table_id,
        name: order.table_name,
        capacity: 0,
        status: 'occupied',
      });
    } else {
      setSelectedTable(null);
    }
    if (order.account_id && order.customer_name) {
      setSelectedCustomer({
        id: order.account_id,
        name: order.customer_name,
      });
    } else {
      setSelectedCustomer(null);
    }
    onPayOrder?.() ?? onResume();
  };

  const handleResume = (draft: FlowDraft) => {
    setCart(draft.items);
    setSelectedTable(
      draft.table_id && draft.table_name
        ? {
            id: draft.table_id,
            name: draft.table_name,
            capacity: 0,
            status: 'occupied',
          }
        : null,
    );
    setSelectedCustomer(
      draft.customer_id && draft.customer_name
        ? { id: draft.customer_id, name: draft.customer_name }
        : null,
    );
    setActiveDraftId(draft.id);
    onResume();
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader}>
                <Skeleton width={80} height={30} borderRadius={8} />
                <Skeleton width={60} height={20} borderRadius={6} />
              </View>
              <Skeleton
                width="60%"
                height={14}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
              <Skeleton
                width="40%"
                height={12}
                borderRadius={6}
                style={{ marginTop: 6 }}
              />
            </View>
          ))}
        </View>
      ) : orders.length === 0 && drafts.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={48}
            color={theme.colors.textMuted}
          />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start an order from the Menu tab — orders and drafts will appear
            here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {orders.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Running Orders</Text>
              {orders.map(o => (
                <FlowOrderCard key={o.id} order={o} onPress={handleSelectOrder} />
              ))}
            </>
          )}
          {drafts.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginTop: orders.length > 0 ? 16 : 0 },
                ]}
              >
                Unsaved Drafts
              </Text>
              {drafts.map(d => (
                <FlowDraftCard
                  key={d.id}
                  draft={d}
                  onPress={handleResume}
                  onRemove={removeDraft}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
