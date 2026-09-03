import { useMemo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Skeleton from "../common/Skeleton";
import { useOrders } from "../../hooks/useOrders";
import { useCustomers } from "../../hooks/useCustomers";
import { useTables } from "../../hooks/useTables";
import { useCartStore } from "../../store/cartStore";
import { useCustomerStore } from "../../store/customerStore";
import { useFlowStore } from "../../store/flowStore";
import { useOrderStore } from "../../store/orderStore";
import { useTableStore } from "../../store/tableStore";
import { theme } from "../../theme";
import type { FlowDraft } from "../../types/flow";
import type { Order } from "../../types/order";
import { extractList } from "../../utils/apiHelpers";
import { mapApiItemsToCart } from "../../utils/orderMappers";

function timeAgo(ts: number) {
	const diff = Date.now() - ts;
	const min = Math.floor(diff / 60000);
	if (min < 1) return "just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.floor(min / 60);
	return `${hr}h ago`;
}

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

const STATUS_BADGE: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	pending: {
		label: "Pending",
		color: theme.colors.warning,
		bg: theme.colors.warningLight,
	},
	preparing: {
		label: "Kitchen",
		color: theme.colors.info,
		bg: theme.colors.infoLight,
	},
	ready: {
		label: "Serving",
		color: theme.colors.success,
		bg: theme.colors.successLight,
	},
	served: {
		label: "Served",
		color: theme.colors.textSecondary,
		bg: theme.colors.surfaceTertiary,
	},
	cancelled: {
		label: "Cancelled",
		color: theme.colors.danger,
		bg: theme.colors.dangerLight,
	},
};

interface Props {
	onResume: () => void;
	onPayOrder?: () => void;
}

export default function FlowPanel({ onResume, onPayOrder }: Props) {
	const drafts = useFlowStore((s) => s.drafts);
	const setActiveDraftId = useFlowStore((s) => s.setActiveDraftId);
	const removeDraft = useFlowStore((s) => s.removeDraft);
	const setCart = useCartStore((s) => s.setCart);
	const clearCart = useCartStore((s) => s.clearCart);
	const setSelectedTable = useTableStore((s) => s.setSelectedTable);
	const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);
	const sessionOrders = useOrderStore((s) => s.orders);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
	const itemStatusOverrides = useOrderStore((s) => s.itemStatusOverrides);

	const { data, isLoading } = useOrders();
	const tablesData = useTables();
	const customersData = useCustomers();

	const tableMap = useMemo(() => {
		const list = extractList(tablesData.data);
		return new Map<string, string>(
			(list ?? []).map((t: any) => [t.id, t.name]),
		);
	}, [tablesData.data]);

	const customerMap = useMemo(() => {
		const list =
			customersData.data?.pages.flatMap((p: any) => extractList(p.data)) ?? [];
		return new Map<string, string>(list.map((c: any) => [c.id, c.name]));
	}, [customersData.data]);

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
				table_name: o.table?.name ?? tableMap.get(o.table_id) ?? "",
				customer_name: o.account?.name ?? customerMap.get(o.account_id) ?? "",
			}));
	}, [data, itemStatusOverrides, tableMap, customerMap]);

	const orders = useMemo(() => {
		const merged = new Map<string, Order>();
		for (const o of apiOrders) merged.set(o.id, o);
		for (const o of sessionOrders) merged.set(o.id, o);
		return [...merged.values()];
	}, [apiOrders, sessionOrders]);

	const handleSelectOrder = (order: Order) => {
		clearCart();
		setActiveOrder(order.id);
		if (order.table_id && order.table_name) {
			setSelectedTable({
				id: order.table_id,
				name: order.table_name,
				capacity: 0,
				status: "occupied",
			});
		} else {
			setSelectedTable(null);
		}
		if (order.account_id && order.customer_name) {
			setSelectedCustomer({
				id: order.account_id,
				name: order.customer_name,
			});
		} else {
			setSelectedCustomer(null);
		}
		onPayOrder?.() ?? onResume();
	};

	const handleResume = (draft: FlowDraft) => {
		setCart(draft.items);
		setSelectedTable(
			draft.table_id && draft.table_name
				? {
						id: draft.table_id,
						name: draft.table_name,
						capacity: 0,
						status: "occupied",
					}
				: null,
		);
		setSelectedCustomer(
			draft.customer_id && draft.customer_name
				? { id: draft.customer_id, name: draft.customer_name }
				: null,
		);
		setActiveDraftId(draft.id);
		onResume();
	};

	return (
		<View style={styles.container}>
			{isLoading ? (
				<View style={styles.list}>
					{[1, 2, 3].map((i) => (
						<View key={i} style={styles.skeletonCard}>
							<View style={styles.skeletonHeader}>
								<Skeleton width={80} height={30} borderRadius={8} />
								<Skeleton width={60} height={20} borderRadius={6} />
							</View>
							<Skeleton width="60%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
							<Skeleton width="40%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
						</View>
					))}
				</View>
			) : orders.length === 0 && drafts.length === 0 ? (
				<View style={styles.empty}>
					<MaterialCommunityIcons
						name="format-list-bulleted"
						size={48}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.emptyTitle}>No orders yet</Text>
					<Text style={styles.emptySubtitle}>
						Start an order from the Menu tab — orders and drafts will appear here.
					</Text>
				</View>
			) : (
				<ScrollView
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				>
					{orders.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>Running Orders</Text>
							{orders.map((o) => (
								<OrderCard key={o.id} order={o} onPress={handleSelectOrder} />
							))}
						</>
					)}
					{drafts.length > 0 && (
						<>
							<Text
								style={[
									styles.sectionTitle,
									{ marginTop: orders.length > 0 ? 16 : 0 },
								]}
							>
								Unsaved Drafts
							</Text>
							{drafts.map((d) => (
								<DraftCard key={d.id} draft={d} onPress={handleResume} onRemove={removeDraft} />
							))}
						</>
					)}
				</ScrollView>
			)}
		</View>
	);
}

function OrderCard({
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
							{totalQty} {totalQty === 1 ? "Item" : "Items"}
						</Text>
					</View>
				</View>
				<View style={styles.orderHeaderRight}>
					<Text style={styles.totalAmount}>
						₹{order.total.toLocaleString("en-IN")}
					</Text>
					<MaterialCommunityIcons
						name={expanded ? "chevron-up" : "chevron-down"}
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
							<View key={`${item.id}-${idx}`} style={styles.itemRow}>
								<View style={styles.itemIdxWrap}>
									<Text style={styles.itemIdx}>{idx + 1}</Text>
								</View>
								<Text style={styles.itemName} numberOfLines={1}>
									{item.name}
								</Text>
								<Text style={styles.itemQty}>
									{item.qty} X ₹
									{item.price_per_unit.toLocaleString("en-IN")}
								</Text>
								<View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
									<Text style={[styles.statusBadgeText, { color: badge.color }]}>
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
						<MaterialCommunityIcons name="cash-register" size={16} color="#fff" />
						<Text style={styles.payOrderText}>Pay This Order</Text>
					</TouchableOpacity>
				</View>
			)}
		</TouchableOpacity>
	);
}

function DraftCard({
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
			style={styles.orderCard}
			onPress={() => setExpanded(!expanded)}
			activeOpacity={0.95}
		>
			<View style={styles.orderHeader}>
				<View style={styles.orderHeaderLeft}>
					<View style={styles.draftBadge}>
						<Text style={styles.draftBadgeText}>DRAFT</Text>
					</View>
					<View style={styles.orderMeta}>
						<View style={styles.metaRow}>
							{draft.table_name ? (
								<View style={styles.tableChip}>
									<MaterialCommunityIcons
										name="table-furniture"
										size={12}
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
										size={12}
										color={theme.colors.textMuted}
									/>
									<Text style={styles.walkinChipText}>Walk-in</Text>
								</View>
							)}
							{draft.customer_name && (
								<Text style={styles.custText} numberOfLines={1}>
									{draft.customer_name}
								</Text>
							)}
						</View>
						<Text style={styles.itemCount}>
							{qty} {qty === 1 ? "Item" : "Items"} · {timeAgo(draft.updated_at)}
						</Text>
					</View>
				</View>
				<View style={styles.orderHeaderRight}>
					<Text style={styles.totalAmount}>
						₹{total.toLocaleString("en-IN")}
					</Text>
					<MaterialCommunityIcons
						name={expanded ? "chevron-up" : "chevron-down"}
						size={18}
						color={theme.colors.textMuted}
					/>
				</View>
			</View>

			{expanded && (
				<View style={styles.orderBody}>
					<View style={styles.bodyDivider} />
					{draft.items.map((item, idx) => {
						const badge = item.sentToKitchen
							? STATUS_BADGE.preparing
							: STATUS_BADGE.pending;
						return (
							<View key={`${item.id}-${idx}`} style={styles.itemRow}>
								<View style={styles.itemIdxWrap}>
									<Text style={styles.itemIdx}>{idx + 1}</Text>
								</View>
								<Text style={styles.itemName} numberOfLines={1}>
									{item.name}
								</Text>
								<Text style={styles.itemQty}>
									{item.qty} X ₹
									{item.price_per_unit.toLocaleString("en-IN")}
								</Text>
								<View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
									<Text style={[styles.statusBadgeText, { color: badge.color }]}>
										{badge.label}
									</Text>
								</View>
							</View>
						);
					})}
					<View style={styles.draftActions}>
						<TouchableOpacity
							style={styles.openOrderBtn}
							onPress={() => onPress(draft)}
							activeOpacity={0.8}
						>
							<MaterialCommunityIcons name="play" size={16} color="#fff" />
							<Text style={styles.openOrderText}>Resume</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.removeBtn}
							onPress={() => onRemove(draft.id)}
							activeOpacity={0.8}
						>
							<MaterialCommunityIcons
								name="trash-can-outline"
								size={16}
								color={theme.colors.danger}
							/>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	empty: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
		paddingBottom: 60,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 6,
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		lineHeight: 19,
	},
	list: {
		paddingTop: 8,
		paddingBottom: 24,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "800",
		color: theme.colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		paddingHorizontal: 14,
		marginBottom: 6,
	},
	orderCard: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		marginHorizontal: 12,
		marginVertical: 5,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		overflow: "hidden",
		...theme.shadow.sm,
	},
	orderHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 14,
	},
	orderHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	orderNumBadge: {
		backgroundColor: theme.colors.primaryLight,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	orderNumText: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "900",
	},
	draftBadge: {
		backgroundColor: theme.colors.warningLight,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	draftBadgeText: {
		color: theme.colors.warning,
		fontSize: 12,
		fontWeight: "900",
	},
	orderMeta: {
		flex: 1,
	},
	metaRow: {
		flexDirection: "row",
		gap: 6,
		flexWrap: "wrap",
		alignItems: "center",
	},
	tableChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: theme.colors.primaryLight,
		borderRadius: theme.radius.full,
		paddingHorizontal: 8,
		paddingVertical: 3,
		maxWidth: 140,
	},
	tableChipText: {
		color: theme.colors.primary,
		fontSize: 11,
		fontWeight: "700",
		flexShrink: 1,
	},
	walkinChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: theme.colors.surfaceTertiary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	walkinChipText: {
		color: theme.colors.textMuted,
		fontSize: 11,
		fontWeight: "600",
	},
	custText: {
		color: theme.colors.textSecondary,
		fontSize: 10,
		fontWeight: "600",
	},
	itemCount: {
		color: theme.colors.textMuted,
		fontSize: 11,
		marginTop: 2,
	},
	orderHeaderRight: {
		alignItems: "flex-end",
		gap: 4,
	},
	totalAmount: {
		color: theme.colors.textPrimary,
		fontSize: 16,
		fontWeight: "900",
	},
	orderBody: {
		paddingHorizontal: 14,
		paddingBottom: 14,
	},
	bodyDivider: {
		height: 1,
		backgroundColor: theme.colors.borderLight,
		marginBottom: 10,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	itemIdxWrap: {
		flexDirection: "row",
		alignItems: "center",
	},
	itemIdx: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: theme.colors.surfaceTertiary,
		textAlign: "center",
		lineHeight: 22,
		fontSize: 11,
		fontWeight: "700",
		color: theme.colors.textSecondary,
	},
	itemName: {
		flex: 1,
		color: theme.colors.textPrimary,
		fontSize: 13,
		fontWeight: "600",
	},
	itemQty: {
		color: theme.colors.textSecondary,
		fontSize: 11,
		fontWeight: "600",
		textAlign: "center",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: theme.radius.full,
	},
	statusBadgeText: {
		fontSize: 11,
		fontWeight: "700",
	},
	openOrderBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		paddingVertical: 16,
		paddingHorizontal: 20,
		marginTop: 12,
		...theme.shadow.sm,
	},
	openOrderText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
	},
	payOrderBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: theme.colors.success,
		borderRadius: theme.radius.md,
		paddingVertical: 12,
		marginTop: 12,
		...theme.shadow.sm,
	},
	payOrderText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
	},
	draftActions: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	removeBtn: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.dangerLight,
		borderRadius: theme.radius.md,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderWidth: 1.5,
		borderColor: theme.colors.danger,
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
	skeletonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
