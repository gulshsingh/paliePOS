import React from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { styles } from './SubscriptionSection.styles';

export const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.error?.message || fallback;

export const fmtDate = (d?: string) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

export const findArray = (o: any): any[] => {
  if (!o) return [];
  if (Array.isArray(o)) return o;
  if (Array.isArray(o?.data)) return o.data;
  if (Array.isArray(o?.data?.data)) return o.data.data;
  if (Array.isArray(o?.plans)) return o.plans;
  return [];
};

export function CurrentPlanCard({
  current,
  isActive,
  isLoading,
  onOpenHistory,
  onExtend,
  onCancel,
  isExtending,
  isCancelling,
}: {
  current: any;
  isActive: boolean;
  isLoading: boolean;
  onOpenHistory: () => void;
  onExtend: () => void;
  onCancel: () => void;
  isExtending: boolean;
  isCancelling: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name="crown-outline"
          size={16}
          color={theme.colors.primary}
        />
        <Text style={styles.cardTitle}>Current Plan</Text>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={onOpenHistory}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="history"
            size={13}
            color={theme.colors.primary}
          />
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : !current || !isActive ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="shield-outline"
            size={32}
            color={theme.colors.textMuted}
          />
          <Text style={styles.muted}>No active plan</Text>
        </View>
      ) : (
        <>
          <View style={styles.planTop}>
            <Text style={styles.planName}>
              {current?.plan?.name ?? 'Current Plan'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {String(current?.status ?? 'active').toUpperCase()}
              </Text>
            </View>
          </View>

          {current?.plan?.description ? (
            <Text style={styles.planDesc}>{current.plan.description}</Text>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>
              {current?.plan?.price > 0
                ? `₹${current.plan.price} / ${
                    current.plan.billing_interval ?? 'month'
                  }`
                : 'Free'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Started</Text>
            <Text style={styles.infoValue}>
              {fmtDate(current?.starts_at ?? current?.started_at)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {current?.cancelled_at ? 'Ends' : 'Expires'}
            </Text>
            <Text style={styles.infoValue}>
              {fmtDate(current?.ends_at ?? current?.expires_at)}
            </Text>
          </View>

          {current?.cancelled_at ? (
            <View style={styles.cancelNote}>
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={theme.colors.warning}
              />
              <Text style={styles.cancelNoteText}>
                Cancelled — access till end date
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={onExtend}
              disabled={!current?.plan_id || isExtending}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.btnOutlineText}>
                {isExtending ? 'Extending...' : 'Extend'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={onCancel}
              disabled={isCancelling}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={styles.btnDangerText}>
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export function PlanItemCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  isSubscribing,
}: {
  plan: any;
  isCurrentPlan: boolean;
  onSubscribe: (planId: string, name?: string) => void;
  isSubscribing: boolean;
}) {
  const isFree = !plan.price || plan.price === 0;

  return (
    <View style={[styles.planBox, isCurrentPlan && styles.planBoxActive]}>
      <View style={styles.planBoxHead}>
        <Text style={styles.planBoxName} numberOfLines={1}>
          {plan.name}
        </Text>
        {isCurrentPlan && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{isFree ? 'Free' : `₹${plan.price}`}</Text>
        {!isFree && (
          <Text style={styles.priceInterval}>
            /{plan.billing_interval ?? 'month'}
          </Text>
        )}
      </View>

      {plan.description ? (
        <Text style={styles.planBoxDesc} numberOfLines={2}>
          {plan.description}
        </Text>
      ) : null}

      <View style={styles.planDivider} />

      {/* Features */}
      {Array.isArray(plan.features) && plan.features.length > 0 && (
        <View style={styles.featureList}>
          {plan.features.slice(0, 4).map((f: any, i: number) => {
            const label =
              typeof f === 'string'
                ? f
                : f?.name ?? f?.feature?.name ?? String(f);
            return (
              <View key={label || `feat-${i}`} style={styles.featureRow}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={14}
                  color={theme.colors.success}
                />
                <Text style={styles.featureText} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Max Users */}
      {plan.max_users ? (
        <View style={styles.userRow}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={14}
            color={theme.colors.textMuted}
          />
          <Text style={styles.userText}>Up to {plan.max_users} users</Text>
        </View>
      ) : null}

      {/* Action button */}
      <TouchableOpacity
        style={[
          styles.btn,
          styles.btnFull,
          isCurrentPlan ? styles.btnOutline : styles.btnSolid,
        ]}
        onPress={() => onSubscribe(plan.id, plan.name)}
        disabled={isCurrentPlan || isSubscribing}
        activeOpacity={0.85}
      >
        <Text
          style={isCurrentPlan ? styles.btnOutlineText : styles.btnSolidText}
        >
          {isCurrentPlan
            ? 'Active Plan'
            : isSubscribing
            ? 'Subscribing...'
            : isFree
            ? 'Get Started'
            : 'Subscribe'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function SubscriptionHistoryModal({
  visible,
  onClose,
  history,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: {
  visible: boolean;
  onClose: () => void;
  history: any[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalBox}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons
              name="history"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.modalTitle}>Subscription History</Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <Text style={styles.muted}>Loading...</Text>
            ) : history.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons
                  name="history"
                  size={32}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.muted}>No past subscriptions</Text>
              </View>
            ) : (
              history.map((s: any, idx: number) => {
                const st = String(s?.status ?? '').toLowerCase();
                const statusColor =
                  st === 'active'
                    ? theme.colors.success
                    : st === 'cancelled'
                    ? theme.colors.warning
                    : theme.colors.textMuted;
                return (
                  <View
                    key={s?.id ?? idx}
                    style={[
                      styles.histRow,
                      idx === history.length - 1 && styles.histRowLast,
                    ]}
                  >
                    <View style={styles.histLeft}>
                      <View style={styles.histHead}>
                        <Text style={styles.histName}>
                          {s?.plan?.name ?? 'Plan'}
                        </Text>
                        <View
                          style={[
                            styles.histBadge,
                            { backgroundColor: `${statusColor}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.histBadgeText,
                              { color: statusColor },
                            ]}
                          >
                            {String(s?.status ?? '—').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.histMeta}>
                        {fmtDate(s?.starts_at ?? s?.started_at)} →{' '}
                        {fmtDate(s?.ends_at ?? s?.expires_at)}
                      </Text>
                      {s?.cancelled_at ? (
                        <Text style={styles.histCancelled}>
                          Cancelled on {fmtDate(s.cancelled_at)}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.histPrice}>
                      {s?.plan?.price > 0 ? `₹${s.plan.price}` : 'Free'}
                    </Text>
                  </View>
                );
              })
            )}

            {hasNextPage ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={onFetchNextPage}
                disabled={isFetchingNextPage}
                activeOpacity={0.7}
              >
                <Text style={styles.loadMoreText}>
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
