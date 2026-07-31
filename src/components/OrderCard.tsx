import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order, ApiOrderItemStatus } from '../types/order';
import { theme } from '../theme';

interface Props {
  order: Order;
  onBillOrder: (order: Order) => void;
  onUpdateStatus: (itemId: string, status: ApiOrderItemStatus) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending',   color: theme.colors.warning,  bg: theme.colors.warningLight,  icon: 'clock-outline' },
  preparing: { label: 'Preparing', color: theme.colors.info,     bg: theme.colors.infoLight,     icon: 'fire' },
  ready:     { label: 'Ready',     color: theme.colors.success,  bg: theme.colors.successLight,  icon: 'check-circle-outline' },
  served:    { label: 'Served',    color: theme.colors.textMuted, bg: theme.colors.surfaceTertiary, icon: 'silverware' },
};

const NEXT_STATUS: Record<string, { action: string; next: ApiOrderItemStatus }> = {
  pending:   { action: 'Send to Kitchen', next: 'preparing' },
  preparing: { action: 'Mark Ready',      next: 'ready' },
  ready:     { action: 'Serve Now',       next: 'served' },
};

export default function OrderCard({ order, onBillOrder, onUpdateStatus }: Props) {
  const [expanded, setExpanded] = useState(false);

  const allServed = order.items.every((i) => i.status === 'served');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.95}>

      {/* Card header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.orderNumBadge}>
            <Text style={styles.orderNum}>#{order.order_number}</Text>
          </View>
          <View>
            <View style={styles.metaRow}>
              {order.table_name && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="table-furniture" size={11} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{order.table_name}</Text>
                </View>
              )}
              {order.customer_name && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="account-outline" size={11} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{order.customer_name}</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemCount}>{order.items.length} items</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.totalAmount}>₹{order.total.toLocaleString()}</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textMuted}
          />
        </View>
      </View>

      {/* Expanded items */}
      {expanded && (
        <View style={styles.body}>
          <View style={styles.bodyDivider} />

          {order.items.map((item, idx) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
            const next = NEXT_STATUS[item.status];

            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIdx}>{idx + 1}</Text>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.qty}x · ₹{item.price_per_unit.toLocaleString()}</Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
                    <MaterialCommunityIcons name={cfg.icon} size={11} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  {next && (
                    <TouchableOpacity
                      style={styles.actionChip}
                      onPress={() => onUpdateStatus(item.id, next.next)}
                      activeOpacity={0.75}>
                      <Text style={styles.actionChipText}>{next.action}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Bill button */}
          <TouchableOpacity
            style={[styles.billBtn, !allServed && styles.billBtnAlt]}
            onPress={() => onBillOrder(order)}
            activeOpacity={0.85}>
            <MaterialCommunityIcons
              name="cash-register"
              size={16}
              color={allServed ? '#fff' : theme.colors.primary}
            />
            <Text style={[styles.billBtnText, !allServed && styles.billBtnTextAlt]}>
              {allServed ? 'Generate Bill' : 'Bill This Order'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    marginHorizontal: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderNumBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderNum: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  itemCount: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  totalAmount: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  bodyDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemIdx: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.surfaceTertiary,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemQty: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  actionChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  billBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    marginTop: 12,
    ...theme.shadow.lg,
  },
  billBtnAlt: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowColor: 'transparent',
    elevation: 0,
  },
  billBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  billBtnTextAlt: {
    color: theme.colors.primary,
  },
});
