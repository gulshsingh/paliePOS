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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

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
    <BillingItem
      item={item}
      onUpdate={updateItem}
      onRemove={removeItem}
    />
  ), [updateItem, removeItem]);

  return (
    <View style={styles.container}>
      <View style={styles.selectionRow}>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setCustomerModal(true)}>
          <Text style={styles.selectBtnText}>
            {selectedCustomer ? selectedCustomer.name : 'Customer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => setTableModal(true)}>
          <Text style={styles.selectBtnText}>
            {selectedTable ? selectedTable.name : 'Table'}
          </Text>
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No items in cart</Text>
          <Text style={styles.mutedText}>
            Tap a product to add it here
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={6}
          />

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹ {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>₹ {taxTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                ₹ {grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.kitchenBtn}
              onPress={handleSendToKitchen}>
              <Text style={styles.kitchenBtnText}>Send to Kitchen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentBtn}
              onPress={handlePayment}>
              <Text style={styles.paymentBtnText}>Payment</Text>
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
    backgroundColor: theme.colors.surface,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  selectBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    alignItems: 'center',
  },
  selectBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  totals: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  totalValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 4,
  },
  grandTotalLabel: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  grandTotalValue: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  kitchenBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceTertiary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  kitchenBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  paymentBtn: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
