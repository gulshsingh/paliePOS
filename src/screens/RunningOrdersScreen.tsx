import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import { Order } from '../types/order';
import { theme } from '../theme';

export default function RunningOrdersScreen() {
  const navigation = useNavigation<any>();
  const orders = useOrderStore((s) => s.orders);
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
  const setCart = useCartStore((s) => s.setCart);

  const handleSelectOrder = (order: Order) => {
    setCart(order.items);
    setActiveOrder(order.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Running Orders</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleSelectOrder(item)}>
            <Text style={styles.orderNumber}>
              #{item.order_number}
            </Text>
            <Text style={styles.orderMeta}>
              {item.items.length} items · ₹ {item.total.toLocaleString()}
            </Text>
            <Text style={styles.orderStatus}>{item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No running orders</Text>
          </View>
        }
      />
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
  orderCard: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  orderNumber: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  orderMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  orderStatus: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
