import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Order, ApiOrderItemStatus } from '../types/order';
import { theme } from '../theme';

interface Props {
  order: Order;
  onBillOrder: (order: Order) => void;
  onUpdateStatus: (itemId: string, status: ApiOrderItemStatus) => void;
}

export default function OrderCard({ order, onBillOrder, onUpdateStatus }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <Text style={styles.muted}>
            {order.items.length} items · {order.status}
          </Text>
          {order.table_name && (
            <Text style={styles.muted}>Table: {order.table_name}</Text>
          )}
        </View>
        <Text style={styles.total}>
          ₹ {order.total.toLocaleString()}
        </Text>
      </View>

      {expanded && (
        <View style={styles.itemsList}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.muted}>
                  {item.qty}x @ ₹ {item.price_per_unit.toLocaleString()}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <Text style={[styles.itemStatus, getStatusStyle(item.status)]}>
                  {item.status}
                </Text>
                {item.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(item.id, 'preparing')}>
                    <Text style={styles.actionBtnText}>Kitchen</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'preparing' && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(item.id, 'ready')}>
                    <Text style={styles.actionBtnText}>Ready</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'ready' && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onUpdateStatus(item.id, 'served')}>
                    <Text style={styles.actionBtnText}>Serve</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.billBtn}
            onPress={() => onBillOrder(order)}>
            <Text style={styles.billBtnText}>Bill This Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return { color: theme.colors.warning };
    case 'preparing':
      return { color: theme.colors.info };
    case 'ready':
      return { color: theme.colors.success };
    case 'served':
      return { color: theme.colors.textMuted };
    default:
      return { color: theme.colors.textSecondary };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  total: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  itemsList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  billBtn: {
    backgroundColor: theme.colors.success,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  billBtnText: {
      color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
