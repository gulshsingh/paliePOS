import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import BillingKeypad from '../components/BillingKeypad';
import Receipt from '../components/Receipt';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useCreateOrder } from '../hooks/useOrders';
import { createPayment } from '../api/services/payments';
import { theme } from '../theme';

export default function ProceedPaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotals = useCartStore((s) => s.getTotals);
  const activeOrderId = useOrderStore((s) => s.activeOrderId);
  const addOrder = useOrderStore((s) => s.addOrder);
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
  const createOrder = useCreateOrder();

  const customer = route.params?.customer;
  const table = route.params?.table;
  const { subtotal, taxTotal, grandTotal } = getTotals();

  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [alreadyPaid, setAlreadyPaid] = useState('0');
  const [showReceipt, setShowReceipt] = useState(false);
  const [result, setResult] = useState<any>(null);

  const totalPayable = grandTotal - Number(discount || 0) - Number(alreadyPaid || 0);
  const amountPaid = Number(paidAmount || 0);
  const change = amountPaid - totalPayable;

  const handleKeyPress = (key: string) => {
    setPaidAmount((prev) => prev + key);
  };

  const handleDelete = () => {
    setPaidAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPaidAmount('');
  };

  const handleCompleteOrder = async () => {
    if (amountPaid < totalPayable) {
      return;
    }

    try {
      let orderId: string | null = activeOrderId;

      if (!orderId) {
        const res = await createOrder.mutateAsync({
          table_id: table?.id ?? null,
          account_id: customer?.id ?? null,
          total_amount: grandTotal,
          tax_amount: taxTotal,
          discount_amount: Number(discount || 0),
          grand_total: grandTotal,
          items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            price: i.price_per_unit,
            total: i.price_per_unit * i.qty,
          })),
        });
        orderId = (res.data as any).data.data.id;
        addOrder({
          id: orderId!,
          order_number: (res.data as any).data.data.order_number,
          items: cart.map((i) => ({ ...i, status: 'served' as const })),
          total: grandTotal,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          table_id: table?.id ?? null,
          account_id: customer?.id ?? null,
        });
      }

      await createPayment({
        order_id: orderId!,
        amount_paid: amountPaid,
        payment_method: 'cash',
        discount_amount: Number(discount || 0),
        already_paid: Number(alreadyPaid || 0),
      });

      setResult({
        orderNumber: activeOrderId ? 'N/A' : 'NEW',
        items: cart,
        subtotal,
        taxTotal,
        discount: Number(discount || 0),
        grandTotal,
        amountPaid,
        change,
      });
      setShowReceipt(true);
      clearCart();
      setActiveOrder(null);
    } catch (e) {
      console.error('Payment failed', e);
    }
  };

  if (showReceipt && result) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Receipt {...result} orderNumber={result.orderNumber} />
        </ScrollView>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Payable</Text>
          <Text style={styles.summaryValue}>
            ₹ {totalPayable.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.summaryValue}>
            ₹ {Number(discount).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Already Paid</Text>
          <Text style={styles.summaryValue}>
            ₹ {Number(alreadyPaid).toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Change</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: change >= 0 ? theme.colors.success : theme.colors.danger },
            ]}>
            ₹ {Math.max(0, change).toLocaleString()}
          </Text>
        </View>
      </View>

      <BillingKeypad
        value={paidAmount}
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onClear={handleClear}
      />

      <TouchableOpacity
        style={[
          styles.completeBtn,
          amountPaid < totalPayable && styles.disabledBtn,
        ]}
        onPress={handleCompleteOrder}
        disabled={amountPaid < totalPayable}>
        <Text style={styles.completeBtnText}>
          {amountPaid < totalPayable
            ? `Enter ₹ ${(totalPayable - amountPaid).toLocaleString()} more`
            : 'Complete Order'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  summary: {
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: theme.colors.success,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  completeBtnText: {
      color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: theme.colors.accent,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
