import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import { Order } from '../types/order';
import { theme } from '../theme';

const STATUS_COLOR: Record<string, string> = {
  PENDING:   theme.colors.warning,
  KITCHEN:   theme.colors.info,
  SERVING:   theme.colors.success,
  COMPLETED: theme.colors.textMuted,
};

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

  const renderItem = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLOR[item.status] ?? theme.colors.textMuted;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectOrder(item)}
        activeOpacity={0.88}>

        {/* Left: order badge */}
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>#{item.order_number}</Text>
        </View>

        {/* Middle: info */}
        <View style={styles.cardBody}>
          <View style={styles.cardMeta}>
            {item.table_name && (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="table-furniture" size={11} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.table_name}</Text>
              </View>
            )}
            {item.customer_name && (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="account-outline" size={11} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.customer_name}</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
        </View>

        {/* Right: total + status */}
        <View style={styles.cardRight}>
          <Text style={styles.total}>₹{item.total.toLocaleString()}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Running Orders</Text>
          <Text style={styles.headerSub}>{orders.length} active orders</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={56} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No running orders</Text>
            <Text style={styles.emptySub}>Orders you send to kitchen will appear here</Text>
          </View>
        }
      />
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
    marginBottom: 8,
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
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: 12,
    ...theme.shadow.sm,
  },
  orderBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  itemCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  total: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
