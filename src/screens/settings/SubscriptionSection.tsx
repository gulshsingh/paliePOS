import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  cancelSubscription,
  extendSubscription,
  getSubscriptionHistory,
  getCurrentSubscription,
  getPlans,
  subscribeToPlan,
} from '../../api/services/subscriptions';
import { theme } from '../../theme';

const CARD_W = 230;

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.error?.message || fallback;

const fmtDate = (d?: string) => {
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

// body → {data:{data:{data:[...]}}} — kisi bhi level pe array dhoond lo
const findArray = (o: any): any[] => {
  if (!o) return [];
  if (Array.isArray(o)) return o;
  if (Array.isArray(o?.data)) return o.data;
  if (Array.isArray(o?.data?.data)) return o.data.data;
  if (Array.isArray(o?.plans)) return o.plans;
  return [];
};



export default function SubscriptionSection() {
  const qc = useQueryClient();
  const [historyVisible, setHistoryVisible] = useState(false);

  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getCurrentSubscription(),
  });

  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => getPlans(),
  });

  

    const {
    data: historyData,
    isLoading: historyLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['subscription-history'],
    queryFn: ({ pageParam }) => getSubscriptionHistory(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: any) =>
      lastPage?.data?.pagination?.next_cursor || undefined,
  });

  // ── Current subscription — exact shape:
  // body.data.data = { id, status, starts_at, ends_at, plan: {...} }
  const subBody: any = (subRes as any)?.data; // axios body
  const subWrap: any = subBody?.data ?? subBody; // { pagination, data }
  const current: any =
    subWrap?.data && typeof subWrap.data === 'object'
      ? subWrap.data
      : subWrap?.subscription ?? subWrap?.sub ?? subWrap;

  // ── Plans ──
  const plans: any[] = findArray((plansRes as any)?.data)
    .filter((p: any) => p?.is_active !== false)
    .sort((a: any, b: any) => (a?.price ?? 0) - (b?.price ?? 0));

    // ── History ──
   const history: any[] = (historyData?.pages ?? [])
    .flatMap((p: any) => findArray(p?.data))
    .filter((s: any) => s?.id !== current?.id)
    .sort((a: any, b: any) =>
      String(b?.created_at ?? '').localeCompare(String(a?.created_at ?? '')),
    );
  const currentPlanId: string | undefined =
    current?.plan_id ?? current?.plan?.id;
  const isActive =
    current?.is_active === true ||
    String(current?.status ?? '').toLowerCase() === 'active';

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['subscription'] });
    qc.invalidateQueries({ queryKey: ['plans'] });
    qc.invalidateQueries({ queryKey: ['subscription-history'] });
  };

  const subscribeMut = useMutation({
    mutationFn: (plan_id: string) => subscribeToPlan({ plan_id }),
    onSuccess: invalidate,
    onError: (e: any) =>
      Alert.alert('Subscribe failed', errMsg(e, 'Please try again')),
  });

  const extendMut = useMutation({
    mutationFn: (plan_id: string) => extendSubscription({ plan_id }),
    onSuccess: invalidate,
    onError: (e: any) =>
      Alert.alert('Extend failed', errMsg(e, 'Please try again')),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelSubscription(),
    onSuccess: invalidate,
    onError: (e: any) =>
      Alert.alert('Cancel failed', errMsg(e, 'Please try again')),
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelMut.mutate(),
        },
      ],
    );
  };

  const handleSubscribe = (planId: string, name?: string) => {
    if (planId === currentPlanId && isActive) return;
    Alert.alert('Subscribe', `Confirm "${name ?? 'this plan'}"?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => subscribeMut.mutate(planId),
      },
    ]);
  };

  return (
    <>
      {/* ── Current Plan ── */}
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
            onPress={() => setHistoryVisible(true)}
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

        {subLoading ? (
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
                onPress={() =>
                  current?.plan_id && extendMut.mutate(current.plan_id)
                }
                disabled={!current?.plan_id || extendMut.isPending}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.btnOutlineText}>
                  {extendMut.isPending ? 'Extending...' : 'Extend'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={handleCancel}
                disabled={cancelMut.isPending}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={16}
                  color={theme.colors.danger}
                />
                <Text style={styles.btnDangerText}>
                  {cancelMut.isPending ? 'Cancelling...' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ── All Plans (Slider) ── */}
      <View style={styles.sliderCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="format-carousel"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.cardTitle}>All Plans</Text>
          <Text style={styles.swipeHint}>swipe →</Text>
        </View>

        {plansLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : plans.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={32}
              color={theme.colors.textMuted}
            />
            <Text style={styles.muted}>No plans available</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_W + 14}
            contentContainerStyle={styles.sliderRow}
          >
            {plans.map((p: any, idx: number) => {
              const isCurrent = p?.id === currentPlanId && isActive;
              const price = p?.price > 0 ? `₹${p.price}` : 'Free';
              const interval =
                p?.billing_interval && p?.price > 0
                  ? `/${p.billing_interval}`
                  : '';
              return (
                <View
                  key={p?.id ?? idx}
                  style={[styles.planBox, isCurrent && styles.planBoxActive]}
                >
                  {/* Header */}
                  <View style={styles.planBoxHead}>
                    <Text style={styles.planBoxName}>{p?.name ?? 'Plan'}</Text>
                    {isCurrent ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>CURRENT</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{price}</Text>
                    {interval ? (
                      <Text style={styles.priceInterval}>{interval}</Text>
                    ) : null}
                  </View>

                  {p?.description ? (
                    <Text style={styles.planBoxDesc} numberOfLines={2}>
                      {p.description}
                    </Text>
                  ) : null}

                  <View style={styles.planDivider} />

                  {/* Features */}
                  {Array.isArray(p?.features) && p.features.length > 0 ? (
                    <View style={styles.featureList}>
                      {p.features.map((f: string, i: number) => (
                        <View key={i} style={styles.featureRow}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={13}
                            color={theme.colors.success}
                          />
                          <Text style={styles.featureText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.featureText}>Basic access</Text>
                  )}

                  {/* Users */}
                  {p?.max_users ? (
                    <View style={styles.userRow}>
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={14}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.userText}>
                        {p.max_users >= 999999
                          ? 'Unlimited users'
                          : `${p.max_users} user${p.max_users > 1 ? 's' : ''}`}
                      </Text>
                    </View>
                  ) : null}

                  {/* Button */}
                  {isCurrent ? (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnOutline, styles.btnFull]}
                      onPress={() =>
                        currentPlanId && extendMut.mutate(currentPlanId)
                      }
                      disabled={extendMut.isPending}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnOutlineText}>
                        {extendMut.isPending ? 'Extending...' : 'Extend'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnSolid, styles.btnFull]}
                      onPress={() => p?.id && handleSubscribe(p.id, p?.name)}
                      disabled={subscribeMut.isPending}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnSolidText}>
                        {currentPlanId === p?.id ? 'Extend' : 'Subscribe'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── History Modal ── */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHistoryVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="history"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.modalTitle}>Subscription History</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setHistoryVisible(false)}
              >
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
              {historyLoading ? (
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
                    onPress={() => fetchNextPage()}
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
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  sliderCard: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.xl,
    padding: 18,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  swipeHint: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  muted: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
  },
  btnFull: {
    flex: 0,
    width: '100%',
    marginTop: 'auto',
  },
  btnOutline: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  btnOutlineText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  btnDanger: {
    flex: 1,
    borderColor: `${theme.colors.danger}40`,
    backgroundColor: theme.colors.dangerLight,
  },
  btnDangerText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  btnSolid: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  btnSolidText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  sliderRow: {
    gap: 14,
    paddingVertical: 2,
  },
  planBox: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: 16,
  },
  planBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  planBoxHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  planBoxName: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 6,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  priceInterval: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  planBoxDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    lineHeight: 17,
  },
  planDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 12,
  },
  featureList: {
    gap: 7,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  userText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  planDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 17,
  },
  cancelNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  cancelNoteText: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '700',
    flex: 1,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.xl,
    padding: 18,
    maxHeight: '75%',
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modalTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 420,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: 10,
  },
  histRowLast: { borderBottomWidth: 0 },
  histLeft: { flex: 1, gap: 4 },
  histHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  histName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  histBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
  },
  histBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  histMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  histPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  histCancelled: {
    fontSize: 11,
    color: theme.colors.danger,
    fontWeight: '700',
    marginTop: 2,
  },
    loadMoreBtn: {
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});

