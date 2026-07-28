import { useState, useCallback } from 'react';
import { CartItem } from '../types/cart';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  const cart = useCartStore((s) => s.cart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotals = useCartStore((s) => s.getTotals);
  const addOrder = useOrderStore((s) => s.addOrder);
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
  const selectedTable = useTableStore((s) => s.selectedTable);
  const setSelectedTable = useTableStore((s) => s.setSelectedTable);

  const [customerModal, setCustomerModal] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customersData } = useCustomers();
  const { data: tablesData } = useTables();
  const createOrder = useCreateOrder();

  const customers = customersData?.pages?.flatMap((p) => {
    const d = (p.data as any);
    return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
  }) ?? [];
  const tables = (tablesData as any)?.data?.data?.data ?? [];
  const { subtotal, taxTotal, grandTotal } = getTotals();

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    try {
      const res = await createOrder.mutateAsync({
        table_id: selectedTable?.id ?? null,
        account_id: selectedCustomer?.id ?? null,
        total_amount: grandTotal,
        tax_amount: taxTotal,
        discount_amount: 0,
        grand_total: grandTotal,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
          price: i.price_per_unit,
          total: i.price_per_unit * i.qty,
        })),
      });

      const newOrder: Order = {
        id: (res.data as any).data.data.id,
        order_number: (res.data as any).data.data.order_number,
        items: cart.map((i) => ({ ...i, status: 'pending' as const })),
        total: grandTotal,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        table_id: selectedTable?.id ?? null,
        account_id: selectedCustomer?.id ?? null,
        table_name: selectedTable?.name,
        customer_name: selectedCustomer?.name,
      };

      addOrder(newOrder);
      clearCart();
      setSelectedTable(null);
      setSelectedCustomer(null);
    } catch (e) {
      console.error('Failed to create order', e);
    }
  };

  const handlePayment = () => {
    navigation.navigate('ProceedPayment', {
      customer: selectedCustomer,
      table: selectedTable,
    });
  };

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <BillingItem item={item} onUpdate={updateItem} onRemove={removeItem} />
  ), [updateItem, removeItem]);

  return (
    <View style={styles.container}>

      {/* Selector chips */}
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
          <Text style={[styles.chipText, selectedCustomer && styles.chipTextActive]} numberOfLines={1}>
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
          <Text style={[styles.chipText, selectedTable && styles.chipTextActive]} numberOfLines={1}>
            {selectedTable ? selectedTable.name : 'Select Table'}
          </Text>
          {selectedTable && (
            <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Empty state */}
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
          {/* Items header */}
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeaderText}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
            </Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* Cart list */}
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={6}
          />

          {/* Bill summary */}
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

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.kitchenBtn]}
              onPress={handleSendToKitchen}
              disabled={createOrder.isPending}
              activeOpacity={0.85}>
              <MaterialCommunityIcons name="chef-hat" size={18} color={theme.colors.primary} />
              <Text style={styles.kitchenBtnText}>
                {createOrder.isPending ? 'Sending...' : 'Send to Kitchen'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.payBtn]}
              onPress={handlePayment}
              activeOpacity={0.85}>
              <MaterialCommunityIcons name="cash-register" size={18} color="#fff" />
              <Text style={styles.payBtnText}>Proceed to Pay</Text>
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
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  summary: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 10,
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
    borderStyle: 'dashed',
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
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
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
  payBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
