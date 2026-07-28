import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartItem } from '../types/cart';
import { theme } from '../theme';

interface Props {
  item: CartItem;
  onUpdate: (id: string, data: Partial<CartItem>) => void;
  onRemove: (id: string) => void;
}

export default function BillingItem({ item }: Props) {
  const lineTotal = item.price_per_unit * item.qty;

  const decrease = () => {
    const cartStore = require('../store/cartStore').useCartStore;
    cartStore.getState().decreaseQty(item.id);
  };

  const increase = () => {
    const cartStore = require('../store/cartStore').useCartStore;
    cartStore.getState().increaseQty(item.id);
  };

  return (
    <View style={styles.container}>
      {/* Left: name + price */}
      <View style={styles.left}>
        <View style={styles.vegIndicator} />
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.unitPrice}>₹{item.price_per_unit.toLocaleString()} each</Text>
        </View>
      </View>

      {/* Right: qty stepper + total */}
      <View style={styles.right}>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={decrease} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={item.qty === 1 ? 'trash-can-outline' : 'minus'}
              size={14}
              color={item.qty === 1 ? theme.colors.danger : theme.colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.qty}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={increase} activeOpacity={0.7}>
            <MaterialCommunityIcons name="plus" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.lineTotal}>₹{lineTotal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 12,
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  unitPrice: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  qty: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 12,
  },
  lineTotal: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
