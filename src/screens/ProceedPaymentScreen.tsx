import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const canPay = amountPaid >= totalPayable && paidAmount.length > 0;

  const handleKeyPress = (key: string) => setPaidAmount((prev) => prev + key);
  const handleDelete = () => setPaidAmount((prev) => prev.slice(0, -1));
  const handleClear = () => setPaidAmount('');

  const handleCompleteOrder = async () => {
    if (!canPay) return;
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

  // ── Receipt view ──────────────────────────────────────────
  if (showReceipt && result) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* Success header */}
        <View style={styles.successHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.successBadge}>
            <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.success} />
            <Text style={styles.successText}>Payment Successful</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Receipt {...result} orderNumber={result.orderNumber} />
        </ScrollView>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}>
          <MaterialCommunityIcons name="home-outline" size={18} color="#fff" />
          <Text style={styles.doneBtnText}>Back to POS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Payment view ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Context chips */}
      {(customer || table) && (
        <View style={styles.contextRow}>
          {customer && (
            <View style={styles.contextChip}>
              <MaterialCommunityIcons name="account-outline" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.contextChipText}>{customer.name}</Text>
            </View>
          )}
          {table && (
            <View style={styles.contextChip}>
              <MaterialCommunityIcons name="table-furniture" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.contextChipText}>{table.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bill summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxes & Charges</Text>
          <Text style={styles.summaryValue}>₹{taxTotal.toLocaleString()}</Text>
        </View>
        {Number(discount) > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              − ₹{Number(discount).toLocaleString()}
            </Text>
          </View>
        )}
        <View style={styles.totalDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>₹{totalPayable.toLocaleString()}</Text>
        </View>
      </View>

      {/* Entered amount display */}
      <View style={styles.amountDisplay}>
        <Text style={styles.amountLabel}>Cash Received</Text>
        <Text style={[styles.amountValue, !paidAmount && styles.amountPlaceholder]}>
          ₹ {paidAmount || '0'}
        </Text>
        {paidAmount.length > 0 && (
          <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? theme.colors.successLight : theme.colors.dangerLight }]}>
            <Text style={[styles.changeText, { color: change >= 0 ? theme.colors.success : theme.colors.danger }]}>
              {change >= 0 ? `Change: ₹${change.toLocaleString()}` : `Short by ₹${Math.abs(change).toLocaleString()}`}
            </Text>
          </View>
        )}
      </View>

      {/* Keypad */}
      <BillingKeypad
        value={paidAmount}
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onClear={handleClear}
      />

      {/* CTA */}
      <TouchableOpacity
        style={[styles.completeBtn, !canPay && styles.completeBtnDisabled]}
        onPress={handleCompleteOrder}
        disabled={!canPay}
        activeOpacity={0.85}>
        <MaterialCommunityIcons
          name={canPay ? 'check-circle-outline' : 'cash'}
          size={20}
          color="#fff"
        />
        <Text style={styles.completeBtnText}>
          {!paidAmount
            ? 'Enter amount to pay'
            : !canPay
            ? `Need ₹${(totalPayable - amountPaid).toLocaleString()} more`
            : 'Complete Payment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  contextRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contextChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 8,
    borderStyle: 'dashed',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  amountPlaceholder: {
    color: theme.colors.textMuted,
  },
  changeBadge: {
    marginTop: 6,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.success,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    ...theme.shadow.md,
  },
  completeBtnDisabled: {
    backgroundColor: theme.colors.textMuted,
    shadowColor: 'transparent',
    elevation: 0,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  // Receipt view
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.success,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    margin: 12,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    ...theme.shadow.lg,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
