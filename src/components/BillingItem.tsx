import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CartItem } from '../types/cart';
import { theme } from '../theme';

interface Props {
  item: CartItem;
  onUpdate: (id: string, data: Partial<CartItem>) => void;
  onRemove: (id: string) => void;
}

export default function BillingItem({ item, onUpdate, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={() => onRemove(item.id)}>
          <Text style={styles.remove}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              const cartStore = require('../store/cartStore').useCartStore;
              cartStore.getState().decreaseQty(item.id);
            }}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => {
              const cartStore = require('../store/cartStore').useCartStore;
              cartStore.getState().increaseQty(item.id);
            }}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.priceInfo}>
          <TextInput
            style={styles.input}
            value={String(item.price_per_unit)}
            keyboardType="numeric"
            onChangeText={(v) =>
              onUpdate(item.id, {
                price_per_unit: Number(v),
                price: Number(v) * item.qty,
              })
            }
          />
          <Text style={styles.totalPrice}>
            ₹ {(item.price_per_unit * item.qty).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  remove: {
    color: theme.colors.danger,
    fontSize: 18,
    marginLeft: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qtyBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  qty: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 70,
    textAlign: 'right',
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  totalPrice: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 70,
    textAlign: 'right',
  },
});
