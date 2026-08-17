import { useCallback, useMemo } from "react";
import {
	ActivityIndicator,
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Skeleton from "../../components/common/Skeleton";
import OrderCard from "../../components/order/OrderCard";
import { useOrders } from "../../hooks/useOrders";
import { useCustomers } from "../../hooks/useCustomers";
import { useTables } from "../../hooks/useTables";
import { theme } from "../../theme";
import type { Order } from "../../types/order";

export default function AllOrdersScreen({
	embedded = false,
}: {
	embedded?: boolean;
}) {
	const insets = useSafeAreaInsets();
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useOrders();
	const tablesData = useTables();
	const customersData = useCustomers();

	const tableMap = useMemo(() => {
		const d = tablesData.data as any;
		const list = d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? [];
		return new Map<string, string>(
			(list ?? []).map((t: any) => [t.id, t.name]),
		);
	}, [tablesData.data]);

	const customerMap = useMemo(() => {
		const list =
			customersData.data?.pages.flatMap((p: any) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [];
		return new Map<string, string>(list.map((c: any) => [c.id, c.name]));
	}, [customersData.data]);

	const orders: Order[] = useMemo(() => {
		const apiOrders =
			data?.pages.flatMap((p) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [];

		return apiOrders.map((o: any) => ({
			id: o.id,
			order_number: o.order_number,
			items: (o.items ?? []).map((i: any) => ({
				id: i.id,
				name: i.product?.name ?? i.product_name ?? "",
				price: Number(i.total),
				price_per_unit: Number(i.price),
				qty: Number(i.quantity),
				tax: 0,
				status: i.status,
				product_id: i.product_id,
			})),
			total: Number(o.grand_total),
			status: o.status,
			paymentStatus: o.payment_status ?? "UNPAID",
			table_id: o.table_id,
			account_id: o.account_id,
			table_name: o.table?.name ?? tableMap.get(o.table_id) ?? "",
			customer_name:
				o.account?.name ?? customerMap.get(o.account_id) ?? "",
		}));
	}, [data, tableMap, customerMap]);

	const renderOrder = useCallback(
		({ item }: { item: Order }) => <OrderCard order={item} readOnly />,
		[],
	);

	const onEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<View style={[styles.container, !embedded && { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{isLoading ? (
				<FlatList
					data={[1, 2, 3, 4]}
					keyExtractor={(i) => String(i)}
					renderItem={() => (
						<View style={styles.skeletonCard}>
							<View style={styles.skeletonHeader}>
								<View style={styles.skeletonHeaderLeft}>
									<Skeleton
										width={86}
										height={32}
										borderRadius={8}
										style={styles.skeletonBadge}
									/>
									<View style={styles.skeletonMeta}>
										<Skeleton
											width={76}
											height={20}
											borderRadius={10}
											style={styles.skeletonChip}
										/>
										<Skeleton width={58} height={11} borderRadius={6} />
									</View>
								</View>
								<View style={styles.skeletonHeaderRight}>
									<Skeleton width={72} height={16} borderRadius={7} />
									<Skeleton width={12} height={12} borderRadius={6} />
								</View>
							</View>
						</View>
					)}
					contentContainerStyle={styles.listContent}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			) : orders.length === 0 ? (
				<View style={styles.emptyState}>
					<MaterialCommunityIcons
						name="receipt-text-outline"
						size={52}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.emptyTitle}>No orders found</Text>
					<Text style={styles.emptySubtitle}>
						Orders will appear here once you start taking them.
					</Text>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(item) => item.id}
					renderItem={renderOrder}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					onEndReached={onEndReached}
					onEndReachedThreshold={0.4}
					ListFooterComponent={
						isFetchingNextPage ? (
							<ActivityIndicator
								color={theme.colors.primary}
								style={styles.footerLoader}
							/>
						) : null
					}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
		paddingTop: 0,
	},
	listContent: {
		paddingTop: 8,
		paddingBottom: 24,
	},
	skeletonCard: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		marginHorizontal: 12,
		marginVertical: 5,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		overflow: "hidden",
		...theme.shadow.sm,
	},
	skeletonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 14,
		gap: 10,
	},
	skeletonHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	skeletonBadge: {
		backgroundColor: theme.colors.surfaceTertiary,
	},
	skeletonMeta: {
		flex: 1,
		gap: 7,
	},
	skeletonChip: {
		backgroundColor: theme.colors.surfaceTertiary,
	},
	skeletonHeaderRight: {
		alignItems: "flex-end",
		gap: 5,
	},
	skeletonMargin: {
		marginTop: 8,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 60,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	footerLoader: {
		marginVertical: 14,
	},
});
