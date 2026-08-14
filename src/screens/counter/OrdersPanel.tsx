import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Skeleton from "../../components/common/Skeleton";
import OrderCard from "../../components/order/OrderCard";
import { useCart } from "../../hooks/useCart";
import { useCustomers } from "../../hooks/useCustomers";
import { useOrders } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import { useOrderStore } from "../../store/orderStore";
import { theme } from "../../theme";
import type { Order } from "../../types/order";
import { ORDER_TABS, type OrderTab } from "../../types/order-status";

const TAB_ITEM_STATUS: Record<OrderTab, string> = {
	PENDING: "pending",
	KITCHEN: "preparing",
	SERVING: "ready",
	SERVED: "served",
};

const TAB_META: Record<OrderTab, { icon: string; color: string; bg: string }> =
	{
		PENDING: {
			icon: "clock-outline",
			color: theme.colors.warning,
			bg: theme.colors.warningLight,
		},
		KITCHEN: {
			icon: "fire",
			color: theme.colors.info,
			bg: theme.colors.infoLight,
		},
		SERVING: {
			icon: "check-circle-outline",
			color: theme.colors.success,
			bg: theme.colors.successLight,
		},
		SERVED: {
			icon: "silverware",
			color: theme.colors.textMuted,
			bg: theme.colors.surfaceTertiary,
		},
	};

export default function OrdersPanel({
	onBillToCart,
}: {
	onBillToCart?: () => void;
}) {
	const [activeTab, setActiveTab] = useState<OrderTab>("PENDING");
	const { data, isLoading } = useOrders(TAB_ITEM_STATUS[activeTab]);
	const { updateItemStatusLocally } = useUpdateOrderStatus();
	const { onBillOrder } = useCart();
	const localOrders = useOrderStore((s) => s.orders);
	const tablesData = useTables();
	const customersData = useCustomers();

	const tableMap = useMemo(() => {
		const d = tablesData.data as any;
		const list =
			d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? [];
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
		return new Map<string, string>(
			list.map((c: any) => [c.id, c.name]),
		);
	}, [customersData.data]);

	const handleBillOrder = useCallback(
		(order: Order) => {
			onBillOrder(order);
			onBillToCart?.();
		},
		[onBillOrder, onBillToCart],
	);

	const renderOrder = useCallback(
		({ item }: { item: Order }) => (
			<OrderCard
				order={item}
				onBillOrder={handleBillOrder}
				onAddItems={handleBillOrder}
				onUpdateStatus={updateItemStatusLocally}
			/>
		),
		[handleBillOrder, updateItemStatusLocally],
	);

	const orders = useMemo(() => {
		const tabStatus = TAB_ITEM_STATUS[activeTab];
		const apiOrders =
			data?.pages.flatMap((p) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [];

		const apiMapped: Order[] = apiOrders.map((o: any) => ({
			id: o.id,
			order_number: o.order_number,
			items: (o.items ?? [])
				.filter((i: any) => i.status === tabStatus)
				.map((i: any) => ({
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
			customer_name: o.account?.name ?? customerMap.get(o.account_id) ?? "",
		}));

		// Merge session (local zustand) orders on top so edits & additions
		// made in this session stay visible. Local copy wins on id clash.
		const merged = new Map<string, Order>();
		for (const o of apiMapped) merged.set(o.id, o);
		for (const lo of localOrders) merged.set(lo.id, lo);

		return [...merged.values()]
			.map((o) => ({
				...o,
				items: o.items.filter((i) => i.status === tabStatus),
			}))
			.filter((o) => o.items.length > 0);
	}, [data, activeTab, localOrders, tableMap, customerMap]);

	return (
		<View style={styles.container}>
			{/* Tab bar */}
			<View style={styles.tabScroll}>
				{ORDER_TABS.map((tab) => {
					const isActive = activeTab === tab;
					const meta = TAB_META[tab];
					return (
						<TouchableOpacity
							key={tab}
							style={[
								styles.tab,
								isActive && {
									backgroundColor: meta.bg,
									borderColor: meta.color,
								},
							]}
							onPress={() => setActiveTab(tab)}
							activeOpacity={0.8}
						>
							<MaterialCommunityIcons
								name={meta.icon}
								size={14}
								color={isActive ? meta.color : theme.colors.textMuted}
							/>
							<Text style={[styles.tabText, isActive && { color: meta.color }]}>
								{tab}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			{/* Order list */}
			{isLoading ? (
				<FlatList
					data={[1, 2, 3]}
					keyExtractor={(i) => String(i)}
					renderItem={() => (
						<View style={styles.skeletonCard}>
							<View style={styles.skeletonRow}>
								<Skeleton width={70} height={32} borderRadius={8} />
								<View style={styles.skeletonFlex}>
									<Skeleton width="60%" height={14} borderRadius={6} />
									<Skeleton
										width="35%"
										height={12}
										borderRadius={6}
										style={styles.skeletonMarginTop}
									/>
								</View>
								<Skeleton width={60} height={20} borderRadius={6} />
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
						name={TAB_META[activeTab].icon}
						size={52}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.emptyTitle}>
						No {activeTab.toLowerCase()} orders
					</Text>
					<Text style={styles.emptySubtitle}>
						{activeTab === "PENDING"
							? "New orders will appear here"
							: activeTab === "KITCHEN"
								? "Orders being prepared will show here"
								: activeTab === "SERVING"
									? "Ready-to-serve orders will appear here"
									: "Completed orders will appear here"}
					</Text>
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(item) => item.id}
					renderItem={renderOrder}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
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
	},
	tabScroll: {
		flexDirection: "row",
		paddingHorizontal: 10,
		paddingVertical: 10,
		gap: 8,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 8,
		borderRadius: theme.radius.full,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	tabText: {
		color: theme.colors.textMuted,
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	listContent: {
		paddingTop: 8,
		paddingBottom: 20,
	},
	skeletonCard: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		marginHorizontal: 12,
		marginVertical: 5,
		padding: 14,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
	},
	skeletonRow: {
		flexDirection: "row",
		alignItems: "center",
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
		textTransform: "capitalize",
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	skeletonFlex: {
		flex: 1,
		marginLeft: 12,
	},
	skeletonMarginTop: {
		marginTop: 6,
	},
});
