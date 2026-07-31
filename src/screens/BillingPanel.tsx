import { useState, useCallback, useMemo, useEffect } from 'react';
import { CartItem } from '../types/cart';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import BillingItem from '../components/BillingItem';
import CustomerModal from '../components/CustomerModal';
import TableModal from '../components/TableModal';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useTableStore } from '../store/tableStore';
import { useCustomers } from '../hooks/useCustomers';
import { useTables } from '../hooks/useTables';
import { useCreateOrder } from '../hooks/useOrders';
import { Customer } from '../types/customer';
import { RestaurantTable } from '../types/table';
import { Order } from '../types/order';
import { theme } from '../theme';

export default function BillingPanel() {
  const navigation = useNavigation<any>();
  const cart       = useCartStore((s) => s.cart);
  const clearCart  = useCartStore((s) => s.clearCart);
  const addOrder   = useOrderStore((s) => s.addOrder);
  const activeOrderId  = useOrderStore((s) => s.activeOrderId);
  const orders         = useOrderStore((s) => s.orders);
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
  const selectedTable   = useTableStore((s) => s.selectedTable);
  const setSelectedTable = useTableStore((s) => s.setSelectedTable);

  const [customerModal, setCustomerModal] = useState(false);
  const [tableModal,    setTableModal]    = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customersData } = useCustomers();
  const { data: tablesData }    = useTables();
  const createOrder = useCreateOrder();

  const customers = useMemo(
    () => customersData?.pages?.flatMap((p) => {
      const d = (p.data as any);
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [],
    [customersData],
  );
  const tables: RestaurantTable[] = useMemo(
    () => (tablesData as any)?.data?.data?.data
      ?? (tablesData as any)?.data?.data
      ?? (tablesData as any)?.data
      ?? [],
    [tablesData],
  );

  const existingOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId) ?? null,
    [orders, activeOrderId],
  );

  // ── Auto-fill customer & table from the order being billed ──
  const [autofilledFor, setAutofilledFor] = useState<string | null>(null);
  useEffect(() => {
    if (!existingOrder) return;
    if (autofilledFor === existingOrder.id) return;

    if (existingOrder.account_id) {
      const c = customers.find((cc) => cc.id === existingOrder.account_id);
      setSelectedCustomer(c ?? null);
    }
    if (existingOrder.table_id) {
      const t = tables.find((tt) => tt.id === existingOrder.table_id);
      setSelectedTable(t ?? null);
    }
    setAutofilledFor(existingOrder.id);
  }, [existingOrder, customers, tables, autofilledFor, setSelectedCustomer, setSelectedTable]);

  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    const sub = cart.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
    const tax = cart.reduce((s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100, 0);
    return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
  }, [cart]);

  const handleSendToKitchen = async () => {
    if (cart.length === 0 || activeOrderId) return;
    try {
      const res = await createOrder.mutateAsync({
        table_id:        selectedTable?.id ?? existingOrder?.table_id ?? null,
        account_id:      selectedCustomer?.id ?? existingOrder?.account_id ?? null,
        total_amount:    subtotal,
        tax_amount:      taxTotal,
        discount_amount: 0,
        grand_total:     grandTotal,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity:   i.qty,
          price:      i.price_per_unit,
          total:      i.price_per_unit * i.qty,
        })),
      });

      const created = (res.data as any)?.data;
      const o = created?.data ?? created;

      const newOrder: Order = {
        id:           o?.id,
        order_number: o?.order_number,
        items:        cart.map((i) => ({ ...i, status: 'pending' as const })),
        total:        grandTotal,
        status:       'PENDING',
        paymentStatus:'UNPAID',
        table_id:     selectedTable?.id ?? null,
        account_id:   selectedCustomer?.id ?? null,
        table_name:   selectedTable?.name,
        customer_name:selectedCustomer?.name,
      };

      addOrder(newOrder);
      clearCart();
      setActiveOrder(null);
      setSelectedTable(null);
      setSelectedCustomer(null);
    } catch (e) {
      console.error('Failed to create order', e);
    }
  };

  const handlePayment = () => {
    navigation.navigate('ProceedPayment', {
      customer: selectedCustomer,
      table:    selectedTable,
    });
  };

  // ── ALL hooks must be declared before any conditional return ──

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <BillingItem item={item} />
  ), []);

  const renderFooter = useCallback(() => (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>Bill Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Item Total</Text>
        <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxes & Charges</Text>
        <Text style={styles.summaryValue}>₹{taxTotal.toLocaleString()}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.grandLabel}>To Pay</Text>
        <Text style={styles.grandValue}>₹{grandTotal.toLocaleString()}</Text>
      </View>
    </View>
  ), [subtotal, taxTotal, grandTotal]);

  const renderHeader = useCallback(() => (
    <View style={styles.itemsHeader}>
      <Text style={styles.itemsHeaderText}>
        {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
      </Text>
      <TouchableOpacity onPress={clearCart}>
        <Text style={styles.clearText}>Clear all</Text>
      </TouchableOpacity>
    </View>
  ), [cart.length, clearCart]);

  const isBillingExisting = activeOrderId != null;
  const isPaid = existingOrder?.paymentStatus === 'PAID';

  return (
    <View style={styles.container}>

      {/* ── Fixed top: Customer / Table chips ── */}
      <View style={styles.selectionRow}>
        <TouchableOpacity
          style={[styles.chip, selectedCustomer && styles.chipActive]}
          onPress={() => setCustomerModal(true)}
          activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="account-outline"
            size={15}
            color={selectedCustomer ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[styles.chipText, selectedCustomer && styles.chipTextActive]}
            numberOfLines={1}>
            {selectedCustomer ? selectedCustomer.name : 'Add Customer'}
          </Text>
          {selectedCustomer && (
            <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.primary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, selectedTable && styles.chipActive]}
          onPress={() => setTableModal(true)}
          activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="table-furniture"
            size={15}
            color={selectedTable ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[styles.chipText, selectedTable && styles.chipTextActive]}
            numberOfLines={1}>
            {selectedTable ? selectedTable.name : 'Select Table'}
          </Text>
          {selectedTable && (
            <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Billing existing order info ── */}
      {existingOrder && (
        <View style={styles.orderInfoRow}>
          <View style={styles.orderInfoLeft}>
            <MaterialCommunityIcons name="receipt" size={13} color={theme.colors.primary} />
            <Text style={styles.orderInfoText}>ORDER #{existingOrder.order_number}</Text>
          </View>
          <View
            style={[
              styles.payStatusChip,
              {
                backgroundColor:
                  isPaid ? theme.colors.successLight : theme.colors.warningLight,
              },
            ]}>
            <Text
              style={[
                styles.payStatusText,
                { color: isPaid ? theme.colors.success : theme.colors.warning },
              ]}>
              {isPaid ? 'PAID' : existingOrder.paymentStatus ?? 'UNPAID'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Empty state ── */}
      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="cart-outline" size={48} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from the Menu tab</Text>
        </View>
      ) : (
        <>
          {/* ── FlatList: items + Bill Summary footer ── */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={7}
          />

          {/* ── Fixed bottom: action buttons ── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.kitchenBtn]}
              onPress={handleSendToKitchen}
              disabled={createOrder.isPending || isBillingExisting || isPaid}
              activeOpacity={0.85}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={18}
                color={isBillingExisting || isPaid ? theme.colors.textMuted : theme.colors.primary}
              />
              <Text style={styles.kitchenBtnText}>
                {isPaid
                  ? 'Order Paid'
                  : isBillingExisting
                  ? 'Existing Order'
                  : createOrder.isPending
                  ? 'Sending...'
                  : 'Send to Kitchen'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.payBtn, isPaid && styles.payBtnDisabled]}
              onPress={handlePayment}
              disabled={isPaid}
              activeOpacity={0.85}>
              <MaterialCommunityIcons
                name={isPaid ? 'check-circle-outline' : 'cash-register'}
                size={18}
                color="#fff"
              />
              <Text style={styles.payBtnText}>
                {isPaid ? 'Invoice Paid' : 'Proceed to Pay'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <CustomerModal
        visible={customerModal}
        customers={customers}
        onSelect={(c) => setSelectedCustomer(c)}
        onClose={() => setCustomerModal(false)}
      />
      <TableModal
        visible={tableModal}
        tables={tables}
        onSelect={(t) => setSelectedTable(t)}
        onClose={() => setTableModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
  },

  // ── Fixed top chips ───────────────────────────────────
  selectionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.primary,
  },

  // ── Billing existing order info ────────────────────────
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  orderInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderInfoText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  payStatusChip: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  payStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Empty state ───────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },

  // ── FlatList ──────────────────────────────────────────
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  // ── ListHeader ────────────────────────────────────────
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  itemsHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.danger,
  },

  // ── Bill Summary (ListFooter) ─────────────────────────
  summary: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    padding: 16,
    marginTop: 10,
    ...theme.shadow.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 8,
  },
  grandLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  grandValue: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.primary,
  },

  // ── Fixed bottom buttons ──────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
  },
  kitchenBtn: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  kitchenBtnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  payBtn: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.lg,
  },
  payBtnDisabled: {
    backgroundColor: theme.colors.success,
    shadowColor: 'transparent',
    elevation: 0,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
