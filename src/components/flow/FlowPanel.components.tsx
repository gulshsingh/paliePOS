import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import type { FlowDraft } from '../../types/flow';
import type { Order } from '../../types/order';
import { styles } from './FlowPanel.styles';

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export function isToday(dateStr?: string): boolean {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const STATUS_BADGE: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Pending',
    color: theme.colors.warning,
    bg: theme.colors.warningLight,
  },
  preparing: {
    label: 'Kitchen',
    color: theme.colors.info,
    bg: theme.colors.infoLight,
  },
  ready: {
    label: 'Serving',
    color: theme.colors.success,
    bg: theme.colors.successLight,
  },
  served: {
    label: 'Served',
    color: theme.colors.textSecondary,
    bg: theme.colors.surfaceTertiary,
  },
  cancelled: {
    label: 'Cancelled',
    color: theme.colors.danger,
    bg: theme.colors.dangerLight,
  },
};

export function FlowOrderCard({
  order,
  onPress,
}: {
  order: Order;
  onPress: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalQty = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View style={styles.orderNumBadge}>
            <Text style={styles.orderNumText}>#{order.order_number}</Text>
            {order.customer_name && (
              <Text style={styles.custText} numberOfLines={1}>
                {order.customer_name}
              </Text>
            )}
          </View>
          <View style={styles.orderMeta}>
            <View style={styles.metaRow}>
              {order.table_name ? (
                <View style={styles.tableChip}>
                  <MaterialCommunityIcons
                    name="table-furniture"
                    size={12}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.tableChipText} numberOfLines={1}>
                    {order.table_name}
                  </Text>
                </View>
              ) : (
                <View style={styles.walkinChip}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={12}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.walkinChipText}>Walk-in</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemCount}>
              {totalQty} {totalQty === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        </View>
        <View style={styles.orderHeaderRight}>
          <Text style={styles.totalAmount}>
            ₹{order.total.toLocaleString('en-IN')}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textMuted}
          />
        </View>
      </View>

      {/* Items */}
      {expanded && (
        <View style={styles.orderBody}>
          <View style={styles.bodyDivider} />
          {order.items.map((item, idx) => {
            const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.pending;
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemIdxWrap}>
                  <Text style={styles.itemIdx}>{idx + 1}</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>
                  {item.qty} X ₹{item.price_per_unit.toLocaleString('en-IN')}
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                >
                  <Text
                    style={[styles.statusBadgeText, { color: badge.color }]}
                  >
                    {badge.label}
                  </Text>
                </View>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.payOrderBtn}
            onPress={() => onPress(order)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="cash-register"
              size={16}
              color="#fff"
            />
            <Text style={styles.payOrderText}>Pay This Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function FlowDraftCard({
  draft,
  onPress,
  onRemove,
}: {
  draft: FlowDraft;
  onPress: (draft: FlowDraft) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = draft.items.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
  const qty = draft.items.reduce((s, i) => s + i.qty, 0);

  return (
    <TouchableOpacity
      style={styles.draftCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.draftHeader}>
        <View style={styles.draftIcon}>
          <MaterialCommunityIcons
            name="file-document-edit-outline"
            size={20}
            color={theme.colors.warning}
          />
        </View>

        <View style={styles.draftInfo}>
          <View style={styles.draftTitleRow}>
            <Text style={styles.draftTitle} numberOfLines={1}>
              {draft.customer_name || draft.table_name || ''}
            </Text>
            <View style={styles.draftBadge}>
              <Text style={styles.draftBadgeText}>DRAFT</Text>
            </View>
          </View>
          <View style={styles.draftMetaRow}>
            {draft.table_name ? (
              <View style={styles.tableChip}>
                <MaterialCommunityIcons
                  name="table-furniture"
                  size={11}
                  color={theme.colors.primary}
                />
                <Text style={styles.tableChipText} numberOfLines={1}>
                  {draft.table_name}
                </Text>
              </View>
            ) : (
              <View style={styles.walkinChip}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={11}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.walkinChipText}>Walk-in</Text>
              </View>
            )}
            <View style={styles.draftMetaDot} />
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color={theme.colors.textMuted}
            />
            <Text style={styles.draftTime}>{timeAgo(draft.updated_at)}</Text>
          </View>
        </View>

        <View style={styles.draftRight}>
          <Text style={styles.draftTotal}>
            ₹{total.toLocaleString('en-IN')}
          </Text>
          <View style={styles.draftItemsPill}>
            <MaterialCommunityIcons
              name="food-variant"
              size={11}
              color={theme.colors.warning}
            />
            <Text style={styles.draftItemsText}>
              {qty} {qty === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
      </View>

      {/* Items + Actions */}
      {expanded && (
        <View style={styles.draftBody}>
          <View style={styles.draftDivider} />
          {draft.items.map((item, idx) => {
            const badge = item.sentToKitchen
              ? STATUS_BADGE.preparing
              : STATUS_BADGE.pending;
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemIdxWrap}>
                  <Text style={styles.itemIdx}>{idx + 1}</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>
                  {item.qty} X ₹{item.price_per_unit.toLocaleString('en-IN')}
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                >
                  <Text
                    style={[styles.statusBadgeText, { color: badge.color }]}
                  >
                    {badge.label}
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.draftActions}>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => onPress(draft)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="play-circle"
                size={18}
                color="#fff"
              />
              <Text style={styles.resumeText}>Resume Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onRemove(draft.id)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
