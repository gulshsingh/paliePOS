import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Skeleton from "../../components/common/Skeleton";
import { useOrders } from "../../hooks/useOrders";
import { useCartStore, mergeOrderItems } from "../../store/cartStore";
import { useOrderStore } from "../../store/orderStore";
import { theme } from "../../theme";
import type { Order } from "../../types/order";
import { extractList } from "../../utils/apiHelpers";
import { mapApiItemsToCart } from "../../utils/orderMappers";

const STATUS_COLOR: Record<string, string> = {
	PENDING: theme.colors.warning,
	PREPARING: theme.colors.info,
	KITCHEN: theme.colors.info,
	SERVING: theme.colors.success,
	READY: theme.colors.success,
	SERVED: theme.colors.textMuted,
	COMPLETED: theme.colors.textMuted,
};

function isToday(dateStr?: string): boolean {
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

export default function RunningOrdersScreen() {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<any>();
	const sessionOrders = useOrderStore((s) => s.orders);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
	const setCart = useCartStore((s) => s.setCart);
	const itemStatusOverrides = useOrderStore((s) => s.itemStatusOverrides);

	const { data, isLoading } = useOrders();

	const apiOrders = useMemo(() => {
		const all = data?.pages.flatMap((p) => extractList(p.data)) ?? [];
		return all
			.filter((o: any) => isToday(o.created_at))
			.map((o: any) => ({
				id: o.id,
				order_number: o.order_number,
				items: mapApiItemsToCart(o.items ?? [], {}).map((item) => ({
					...item,
					status: itemStatusOverrides[item.id] ?? item.status,
				})),
				total: Number(o.grand_total),
				tax_amount: Number(o.tax_amount) || 0,
				status: o.status,
				invoice: o.invoice === true,
				paymentStatus: o.payment_status ?? "UNPAID",
				table_id: o.table_id,
				account_id: o.account_id,
				table_name: o.table?.name ?? "",
				customer_name: o.account?.name ?? "",
			}));
	}, [data, itemStatusOverrides]);

	const orders = useMemo(() => {
		const merged = new Map<string, Order>();
		for (const o of apiOrders) merged.set(o.id, o);
		for (const o of sessionOrders) merged.set(o.id, o);
		return [...merged.values()];
	}, [apiOrders, sessionOrders]);

	const handleSelectOrder = (order: Order) => {
		setCart(mergeOrderItems(order.items));
		setActiveOrder(order.id);
		navigation.goBack();
	};

	const renderItem = ({ item }: { item: Order }) => {
		const statusColor = STATUS_COLOR[item.status] ?? theme.colors.textMuted;

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => handleSelectOrder(item)}
				activeOpacity={0.88}
			>
				{/* Left: order badge */}
				<View style={styles.orderBadge}>
					<Text style={styles.orderBadgeText}>#{item.order_number}</Text>
				</View>

				{/* Middle: info */}
				<View style={styles.cardBody}>
					<View style={styles.cardMeta}>
						{item.table_name && (
							<View style={styles.metaChip}>
								<MaterialCommunityIcons
									name="table-furniture"
									size={11}
									color={theme.colors.textSecondary}
								/>
								<Text style={styles.metaText}>{item.table_name}</Text>
							</View>
						)}
						{item.customer_name && (
							<View style={styles.metaChip}>
								<MaterialCommunityIcons
									name="account-outline"
									size={11}
									color={theme.colors.textSecondary}
								/>
								<Text style={styles.metaText}>{item.customer_name}</Text>
							</View>
						)}
					</View>
					<Text style={styles.itemCount}>{item.items.length} items</Text>
				</View>

				{/* Right: total + status */}
				<View style={styles.cardRight}>
					<Text style={styles.total}>₹{item.total.toLocaleString("en-IN")}</Text>
					<View
						style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}
					>
						<Text style={[styles.statusText, { color: statusColor }]}>
							{item.status}
						</Text>
					</View>
				</View>

				<MaterialCommunityIcons
					name="chevron-right"
					size={18}
					color={theme.colors.textMuted}
				/>
			</TouchableOpacity>
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<MaterialCommunityIcons
						name="arrow-left"
						size={20}
						color={theme.colors.textSecondary}
					/>
				</TouchableOpacity>
				<View>
					<Text style={styles.headerTitle}>Running Orders</Text>
					<Text style={styles.headerSub}>{orders.length} active orders</Text>
				</View>
				<View style={styles.headerSpacer} />
			</View>

			{isLoading ? (
				<View style={styles.listContent}>
					{[1, 2, 3].map((i) => (
						<View key={i} style={styles.skeletonCard}>
							<View style={styles.skeletonRow}>
								<Skeleton width={70} height={32} borderRadius={8} />
								<View style={styles.skeletonFlex}>
									<Skeleton width="60%" height={14} borderRadius={6} />
									<Skeleton width="35%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
								</View>
								<Skeleton width={60} height={20} borderRadius={6} />
							</View>
						</View>
					))}
				</View>
			) : (
				<FlatList
					data={orders}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<MaterialCommunityIcons
								name="receipt"
								size={56}
								color={theme.colors.textMuted}
							/>
							<Text style={styles.emptyTitle}>No running orders</Text>
							<Text style={styles.emptySub}>
								Orders you send to kitchen will appear here
							</Text>
						</View>
					}
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
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
		marginBottom: 8,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: theme.colors.surfaceSecondary,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		textAlign: "center",
	},
	headerSub: {
		fontSize: 12,
		color: theme.colors.textMuted,
		textAlign: "center",
		marginTop: 1,
	},
	listContent: {
		paddingHorizontal: 12,
		paddingBottom: 24,
		paddingTop: 4,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
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
		alignItems: "center",
		justifyContent: "center",
	},
	orderBadgeText: {
		color: theme.colors.primary,
		fontSize: 13,
		fontWeight: "900",
	},
	cardBody: {
		flex: 1,
	},
	cardMeta: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginBottom: 3,
	},
	metaChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	metaText: {
		fontSize: 11,
		fontWeight: "600",
		color: theme.colors.textSecondary,
	},
	itemCount: {
		fontSize: 12,
		color: theme.colors.textMuted,
	},
	cardRight: {
		alignItems: "flex-end",
		gap: 5,
	},
	total: {
		fontSize: 15,
		fontWeight: "900",
		color: theme.colors.textPrimary,
	},
	statusPill: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: theme.radius.full,
	},
	statusText: {
		fontSize: 10,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
	emptyState: {
		alignItems: "center",
		paddingTop: 80,
		paddingHorizontal: 40,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 8,
	},
	emptySub: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		lineHeight: 20,
	},
	headerSpacer: {
		width: 36,
	},
	skeletonCard: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 14,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
	},
	skeletonRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	skeletonFlex: {
		flex: 1,
	},
});
