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

const ST = {
	pending:   { dot: "#F59E0B", bg: "#FEF3C7", text: "#92400E", label: "Pending" },
	preparing: { dot: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF", label: "Kitchen" },
	ready:     { dot: "#10B981", bg: "#D1FAE5", text: "#065F46", label: "Ready" },
	served:    { dot: "#6B7280", bg: "#F3F4F6", text: "#374151", label: "Served" },
	cancelled: { dot: "#EF4444", bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
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
	const addOrder = useOrderStore((s) => s.addOrder);
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
		addOrder(order);
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
	const [open, setOpen] = useState(false);
	const items = order.items;
	const totalQty = items.reduce((s, i) => s + i.qty, 0);
	const st = (order.status?.toLowerCase?.() ?? "pending") as keyof typeof ST;
	const S = ST[st] ?? ST.pending;

	return (
		<TouchableOpacity
			style={[styles.card, open && styles.cardOpen]}
			onPress={() => setOpen(!open)}
			activeOpacity={0.96}
		>
			<View style={styles.cardInner}>
				<View style={[styles.accentStripe, { backgroundColor: S.dot }]} />
				<View style={styles.content}>
					{/* Header */}
					<View style={styles.row}>
						<View style={styles.left}>
							<View style={[styles.numWrap, { backgroundColor: "#FEF2F2" }]}>
								<Text style={[styles.num, { color: "#DC2626" }]}>#{order.order_number}</Text>
							</View>
							<View style={styles.meta}>
								<View style={styles.chips}>
									{order.customer_name ? (
										<View style={[styles.chip, { backgroundColor: "#FFF1F2" }]}>
											<MaterialCommunityIcons name="account" size={10} color="#E11D48" />
											<Text style={[styles.chipT, { color: "#E11D48" }]} numberOfLines={1}>{order.customer_name}</Text>
										</View>
									) : null}
								</View>
								<View style={styles.infoRow}>
									<Text style={styles.infoT} numberOfLines={1}>
										{items[0]?.name ?? ""}{items.length > 1 ? ` +${items.length - 1}` : ""}
									</Text>
									<View style={styles.infoDot} />
									<Text style={styles.infoT}>{timeAgo(new Date(order.created_at ?? Date.now()).getTime())}</Text>
								</View>
							</View>
						</View>
						<View style={styles.right}>
							{order.table_name ? (
								<View style={[styles.tableChip, { backgroundColor: "#FEF2F2" }]}>
									<MaterialCommunityIcons name="table-furniture" size={14} color="#DC2626" />
									<Text style={[styles.tableChipT, { color: "#DC2626" }]} numberOfLines={1}>{order.table_name}</Text>
								</View>
							) : null}
							<Text style={styles.price}>₹{order.total.toLocaleString("en-IN")}</Text>
						</View>
					</View>

					{/* Items */}
					{open && (
						<View style={styles.body}>
							<View style={styles.divider} />
							{items.map((item, i) => {
								const badge = ST[item.status] ?? ST.pending;
								return (
									<View key={`${item.id}-${i}`} style={[styles.iRow, i === items.length - 1 && { borderBottomWidth: 0 }]}>
										<View style={[styles.iBar, { backgroundColor: badge.dot }]} />
										<View style={styles.iContent}>
											<View style={styles.iTop}>
												<Text style={styles.iName} numberOfLines={1}>{item.name}</Text>
												<Text style={[styles.iQty, { color: "#DC2626" }]}>× {item.qty}</Text>
												<View style={[styles.iBadge, { backgroundColor: badge.bg }]}>
													<Text style={[styles.iBadgeT, { color: badge.text }]}>{badge.label}</Text>
												</View>
											</View>
										</View>
									</View>
								);
							})}
							<TouchableOpacity
								style={styles.payBtn}
								onPress={() => onPress(order)}
								activeOpacity={0.8}
							>
								<MaterialCommunityIcons name="cash-register" size={16} color="#fff" />
								<Text style={styles.payBtnT}>Pay This Order</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
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
	const [open, setOpen] = useState(false);
	const total = draft.items.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
	const qty = draft.items.reduce((s, i) => s + i.qty, 0);

	return (
		<TouchableOpacity
			style={[styles.card, open && styles.cardOpen]}
			onPress={() => setOpen(!open)}
			activeOpacity={0.96}
		>
			<View style={styles.cardInner}>
				<View style={[styles.accentStripe, { backgroundColor: "#F59E0B" }]} />
				<View style={styles.content}>
					{/* Header */}
					<View style={styles.row}>
						<View style={styles.left}>
							<View style={[styles.numWrap, { backgroundColor: "#FEF3C7" }]}>
								<Text style={[styles.num, { color: "#92400E", fontSize: 10 }]}>DRAFT</Text>
							</View>
							<View style={styles.meta}>
								<View style={styles.chips}>
									{draft.customer_name ? (
										<View style={[styles.chip, { backgroundColor: "#FFF1F2" }]}>
											<MaterialCommunityIcons name="account" size={10} color="#E11D48" />
											<Text style={[styles.chipT, { color: "#E11D48" }]} numberOfLines={1}>{draft.customer_name}</Text>
										</View>
									) : null}
								</View>
								<View style={styles.infoRow}>
									<Text style={styles.infoT} numberOfLines={1}>
										{draft.items[0]?.name ?? ""}{draft.items.length > 1 ? ` +${draft.items.length - 1}` : ""}
									</Text>
									<View style={styles.infoDot} />
									<Text style={styles.infoT}>{timeAgo(draft.updated_at)}</Text>
								</View>
							</View>
						</View>
						<View style={styles.right}>
							{draft.table_name ? (
								<View style={[styles.tableChip, { backgroundColor: "#FEF2F2" }]}>
									<MaterialCommunityIcons name="table-furniture" size={14} color="#DC2626" />
									<Text style={[styles.tableChipT, { color: "#DC2626" }]} numberOfLines={1}>{draft.table_name}</Text>
								</View>
							) : null}
							<Text style={styles.price}>₹{total.toLocaleString("en-IN")}</Text>
						</View>
					</View>

					{/* Items */}
					{open && (
						<View style={styles.body}>
							<View style={styles.divider} />
							{draft.items.map((item, i) => {
								const badge = item.sentToKitchen ? ST.preparing : ST.pending;
								return (
									<View key={`${item.id}-${i}`} style={[styles.iRow, i === draft.items.length - 1 && { borderBottomWidth: 0 }]}>
										<View style={[styles.iBar, { backgroundColor: badge.dot }]} />
										<View style={styles.iContent}>
											<View style={styles.iTop}>
												<Text style={styles.iName} numberOfLines={1}>{item.name}</Text>
												<Text style={[styles.iQty, { color: "#DC2626" }]}>× {item.qty}</Text>
												<View style={[styles.iBadge, { backgroundColor: badge.bg }]}>
													<Text style={[styles.iBadgeT, { color: badge.text }]}>{badge.label}</Text>
												</View>
											</View>
										</View>
									</View>
								);
							})}
							<View style={styles.draftActions}>
								<TouchableOpacity
									style={styles.resumeBtn}
									onPress={() => onPress(draft)}
									activeOpacity={0.8}
								>
									<MaterialCommunityIcons name="play" size={16} color="#fff" />
									<Text style={styles.resumeBtnT}>Resume</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.deleteBtn}
									onPress={() => onRemove(draft.id)}
									activeOpacity={0.8}
								>
									<MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
								</TouchableOpacity>
							</View>
						</View>
					)}
				</View>
			</View>
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

	// ── Card ──
	card: {
		backgroundColor: "#fff",
		borderRadius: 18,
		marginHorizontal: 12,
		marginVertical: 5,
		borderWidth: 0,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	cardOpen: {
		shadowOpacity: 0.12,
		shadowRadius: 16,
		elevation: 8,
	},
	cardInner: {
		flexDirection: "row",
	},
	accentStripe: {
		width: 4,
	},
	content: {
		flex: 1,
	},

	// ── Header ──
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 8,
	},
	left: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		flex: 1,
	},
	right: {
		alignItems: "flex-end",
		gap: 5,
		marginLeft: 8,
	},
	numWrap: {
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 6,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 56,
	},
	num: {
		fontSize: 13,
		fontWeight: "800",
		letterSpacing: 0.2,
	},
	meta: {
		flex: 1,
		gap: 4,
	},
	chips: {
		flexDirection: "row",
		gap: 4,
		flexWrap: "wrap",
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		borderRadius: 20,
		paddingHorizontal: 7,
		paddingVertical: 2,
		maxWidth: 110,
	},
	chipT: {
		fontSize: 10,
		fontWeight: "700",
		flexShrink: 1,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	infoT: {
		fontSize: 10,
		fontWeight: "500",
		color: "#9CA3AF",
	},
	infoDot: {
		width: 3,
		height: 3,
		borderRadius: 1.5,
		backgroundColor: "#D1D5DB",
	},
	tableChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	tableChipT: {
		fontSize: 12,
		fontWeight: "800",
		flexShrink: 1,
	},
	price: {
		fontSize: 16,
		fontWeight: "900",
		color: "#111827",
		letterSpacing: 0.2,
	},

	// ── Body ──
	body: {
		paddingHorizontal: 14,
		paddingBottom: 14,
	},
	divider: {
		height: 1,
		backgroundColor: "#F0F0F0",
		marginBottom: 10,
	},

	// ── Items ──
	iRow: {
		flexDirection: "row",
		alignItems: "stretch",
		paddingVertical: 7,
		borderBottomWidth: 1,
		borderBottomColor: "#F5F5F5",
	},
	iBar: {
		width: 3,
		borderRadius: 1.5,
		marginRight: 8,
	},
	iContent: {
		flex: 1,
		gap: 3,
	},
	iTop: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	iName: {
		flex: 1,
		fontSize: 13,
		fontWeight: "600",
		color: "#1F2937",
	},
	iQty: {
		fontSize: 12,
		fontWeight: "800",
	},
	iBadge: {
		borderRadius: 20,
		paddingHorizontal: 6,
		paddingVertical: 1,
	},
	iBadgeT: {
		fontSize: 8,
		fontWeight: "700",
	},

	// ── Buttons ──
	payBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: "#10B981",
		borderRadius: 10,
		paddingVertical: 11,
		marginTop: 12,
		shadowColor: "#10B981",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	payBtnT: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
	draftActions: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	resumeBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: "#F0555F",
		borderRadius: 10,
		paddingVertical: 11,
		shadowColor: "#F0555F",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	resumeBtnT: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
	deleteBtn: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FEF2F2",
		borderRadius: 10,
		paddingVertical: 11,
		paddingHorizontal: 16,
		borderWidth: 1.5,
		borderColor: "#FECACA",
	},

	// ── Skeleton ──
	skeletonCard: {
		backgroundColor: "#fff",
		borderRadius: 18,
		marginHorizontal: 12,
		marginVertical: 5,
		padding: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	skeletonHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
