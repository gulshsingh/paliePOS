import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
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
import {
  CurrentPlanCard,
  errMsg,
  findArray,
  PlanItemCard,
  SubscriptionHistoryModal,
} from './SubscriptionSection.components';
import { styles } from './SubscriptionSection.styles';

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

  // ── Current subscription
  const subBody: any = (subRes as any)?.data;
  const subWrap: any = subBody?.data ?? subBody;
  const current: any =
    subWrap?.data && typeof subWrap.data === 'object'
      ? subWrap.data
      : subWrap?.subscription ?? subWrap?.sub ?? subWrap;

  // ── Plans
  const plans: any[] = findArray((plansRes as any)?.data)
    .filter((p: any) => p?.is_active !== false)
    .sort((a: any, b: any) => (a?.price ?? 0) - (b?.price ?? 0));

  // ── History
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
      {/* ── Current Plan Card ── */}
      <CurrentPlanCard
        current={current}
        isActive={isActive}
        isLoading={subLoading}
        onOpenHistory={() => setHistoryVisible(true)}
        onExtend={() => current?.plan_id && extendMut.mutate(current.plan_id)}
        onCancel={handleCancel}
        isExtending={extendMut.isPending}
        isCancelling={cancelMut.isPending}
      />

      {/* ── All Plans (Slider) ── */}
      <View style={styles.sliderCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="format-carousel"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.cardTitle}>Available Plans</Text>
          <Text style={styles.swipeHint}>Swipe →</Text>
        </View>

        {plansLoading ? (
          <Text style={styles.muted}>Loading plans...</Text>
        ) : plans.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="package-variant"
              size={32}
              color={theme.colors.textMuted}
            />
            <Text style={styles.muted}>No plans available</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderRow}
          >
            {plans.map(p => (
              <PlanItemCard
                key={p.id}
                plan={p}
                isCurrentPlan={p.id === currentPlanId && isActive}
                onSubscribe={handleSubscribe}
                isSubscribing={
                  subscribeMut.isPending &&
                  subscribeMut.variables === p.id
                }
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* ── History Modal ── */}
      <SubscriptionHistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        history={history}
        isLoading={historyLoading}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={() => fetchNextPage()}
      />
    </>
  );
}
