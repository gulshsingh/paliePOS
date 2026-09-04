import { memo, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { ApiOrderItemStatus, Order } from "../../types/order";

interface Props {
	order: Order;
	onBillOrder?: (order: Order) => void;
	onAddItems?: (order: Order) => void;
	onUpdateStatus?: (itemId: string, status: ApiOrderItemStatus) => void;
	readOnly?: boolean;
	actionableStatus?: string;
	hideAmount?: boolean;
	hideStatus?: boolean;
}

const NEXT_ACTION: Record<
	string,
	{ label: string; next: ApiOrderItemStatus; icon: string }
> = {
	pending: { label: "Send to Kitchen", next: "preparing", icon: "silverware-fork-knife" },
	preparing: { label: "Serve Now", next: "ready", icon: "check-circle-outline" },
	ready: { label: "Mark Served", next: "served", icon: "check-all" },
};

const ST = {
	pending:   { dot: "#F59E0B", bg: "#FEF3C7", text: "#92400E", label: "Pending" },
	preparing: { dot: "#3B82F6", bg: "#DBEAFE", text: "#1E40AF", label: "In Kitchen" },
	ready:     { dot: "#10B981", bg: "#D1FAE5", text: "#065F46", label: "Ready" },
	served:    { dot: "#6B7280", bg: "#F3F4F6", text: "#374151", label: "Served" },
	cancelled: { dot: "#EF4444", bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
};

const PAY = {
	PAID:           { dot: "#10B981", bg: "#D1FAE5", text: "#065F46", label: "Paid" },
	PARTIALLY_PAID: { dot: "#F59E0B", bg: "#FEF3C7", text: "#92400E", label: "Partial" },
	UNPAID:         { dot: "#EF4444", bg: "#FEE2E2", text: "#991B1B", label: "Unpaid" },
};

function elapsed(dateStr?: string): string {
	if (!dateStr) return "";
	const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
	if (m < 1) return "now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	return h < 24 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)}d`;
}

export default memo(function OrderCard({
	order,
	onBillOrder,
	onAddItems,
	onUpdateStatus,
	readOnly = false,
	actionableStatus,
	hideAmount = false,
	hideStatus = false,
}: Props) {
	const [open, setOpen] = useState(false);
	const fired = useRef<Record<string, ApiOrderItemStatus>>({});
	const prevId = useRef(order.id);
	if (prevId.current !== order.id) { prevId.current = order.id; fired.current = {}; }

	const items = order.items;
	const qty = items.reduce((s, i) => s + i.qty, 0);
	const total = items.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
	const allDone = items.every((i) => i.status === "served");
	const paid = order.paymentStatus === "PAID";
	const invoiced = order.invoice === true;
	const st = order.status?.toLowerCase?.() ?? "pending";

	const counts = useMemo(() => {
		const c: Record<string, number> = {};
		items.forEach((i) => { if (i.status !== "pending" && i.status !== "preparing") c[i.status] = (c[i.status] || 0) + 1; });
		return c;
	}, [items]);

	const stMap = ST as Record<string, { dot: string; bg: string; text: string; label: string }>;
	const payMap = PAY as Record<string, { dot: string; bg: string; text: string; label: string }>;
	const S = stMap[st] ?? ST.pending;
	const P = payMap[order.paymentStatus] ?? PAY.UNPAID;

	const steps = ["pending", "preparing", "ready", "served"];
	const idx = steps.indexOf(st);
	const pct = st === "served" ? 100 : st === "cancelled" ? 0 : ((idx + 1) / steps.length) * 100;

	return (
		<TouchableOpacity
			style={[s.card, open && s.cardOpen]}
			onPress={() => setOpen(!open)}
			activeOpacity={0.96}
		>
			{/* ── ROW 1: number + chips + price ── */}
			<View style={s.row}>
				<View style={s.left}>
					<View style={[s.numWrap, { backgroundColor: "#FEF2F2" }]}>
						<Text style={[s.num, { color: "#DC2626" }]}>#{order.order_number}</Text>
					</View>
					<View style={s.meta}>
						<View style={s.chips}>
							{order.customer_name ? (
								<View style={[s.chip, { backgroundColor: "#FFF1F2" }]}>
									<MaterialCommunityIcons name="account" size={10} color="#E11D48" />
									<Text style={[s.chipT, { color: "#E11D48" }]} numberOfLines={1}>{order.customer_name}</Text>
								</View>
							) : null}
						</View>
						<View style={s.infoRow}>
							<Text style={s.infoT} numberOfLines={1}>
								{items[0]?.name ?? ""}{items.length > 1 ? ` +${items.length - 1}` : ""}
							</Text>
							<View style={s.infoDot} />
							<Text style={s.infoT}>{elapsed(order.created_at)}</Text>
						</View>
					</View>
				</View>

				<View style={s.right}>
					{order.table_name ? (
						<View style={[s.tableChip, { backgroundColor: "#FEF2F2" }]}>
							<MaterialCommunityIcons name="table-furniture" size={14} color="#DC2626" />
							<Text style={[s.tableChipT, { color: "#DC2626" }]} numberOfLines={1}>{order.table_name}</Text>
						</View>
					) : null}
					{!hideAmount && <Text style={s.price}>₹{total.toLocaleString("en-IN")}</Text>}
					{!hideStatus && st !== "pending" && st !== "preparing" && (
						<View style={[s.pill, { backgroundColor: S.bg }]}>
							<View style={[s.pillDot, { backgroundColor: S.dot }]} />
							<Text style={[s.pillT, { color: S.text }]}>{S.label}</Text>
						</View>
					)}
				</View>
			</View>

			{/* ── ROW 2: thin progress ── */}
			{!readOnly && st !== "cancelled" && st !== "pending" && st !== "preparing" && (
				<View style={s.progTrack}>
					<View style={[s.progFill, { width: `${pct}%` as any, backgroundColor: S.dot }]} />
				</View>
			)}

			{/* ── EXPANDED ── */}
			{open && (
				<View style={s.body}>
					<View style={s.sep} />

					{/* status summary */}
					{Object.keys(counts).length > 1 && (
						<View style={s.sumRow}>
							{Object.entries(counts).map(([k, v]) => {
								const c = stMap[k]; if (!c) return null;
								return (
									<View key={k} style={[s.sumChip, { backgroundColor: c.bg }]}>
										<View style={[s.sumDot, { backgroundColor: c.dot }]} />
										<Text style={[s.sumT, { color: c.text }]}>{c.label} {v}</Text>
									</View>
								);
							})}
						</View>
					)}

					{/* items */}
					{items.map((item, i) => {
						const ef = fired.current[item.id] ?? item.status;
						const next = NEXT_ACTION[ef];
						const can = !actionableStatus || item.status === actionableStatus;
						const c = stMap[item.status] ?? ST.pending;
						return (
							<View key={`${item.id}-${i}`} style={[s.iRow, i === items.length - 1 && { borderBottomWidth: 0 }]}>
								<View style={[s.iBar, { backgroundColor: c.dot }]} />
								<View style={s.iBody}>
									<View style={s.iTop}>
										<Text style={s.iName} numberOfLines={1}>{item.name}</Text>
										<Text style={[s.iQty, { color: "#DC2626" }]}>× {item.qty}</Text>
										{readOnly && !hideStatus && (
											<View style={[s.iBadge, { backgroundColor: c.bg }]}>
												<Text style={[s.iBadgeT, { color: c.text }]}>{c.label}</Text>
											</View>
										)}
										{next && !readOnly && can && (
											<TouchableOpacity
												style={[s.iBtn, { backgroundColor: c.dot }]}
												onPress={() => { fired.current[item.id] = next.next; onUpdateStatus?.(item.id, next.next); }}
												activeOpacity={0.7}
											>
												<MaterialCommunityIcons name={next.icon} size={11} color="#fff" />
												<Text style={s.iBtnT}>{next.label}</Text>
											</TouchableOpacity>
										)}
									</View>
								</View>
							</View>
						);
					})}

					{/* actions */}
					{!readOnly && !invoiced && (
						<View style={s.actions}>
							{!paid && (
								<TouchableOpacity style={s.addBtn} onPress={() => onAddItems?.(order)} activeOpacity={0.8}>
									<MaterialCommunityIcons name="plus" size={16} color={theme.colors.primary} />
									<Text style={s.addBtnT}>Add</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity
								style={[s.billBtn, paid && { backgroundColor: "#10B981", shadowColor: "#10B981" }]}
								onPress={() => onBillOrder?.(order)}
								activeOpacity={0.8}
							>
								<MaterialCommunityIcons name={paid ? "receipt" : "cash-register"} size={16} color="#fff" />
								<Text style={s.billBtnT}>{paid ? "View Bill" : allDone ? "Generate Bill" : "Bill Order"}</Text>
							</TouchableOpacity>
						</View>
					)}

					{paid && !readOnly && (
						<View style={[s.paidBar, { backgroundColor: P.bg }]}>
							<MaterialCommunityIcons name="check-decagram" size={14} color={P.dot} />
							<Text style={[s.paidBarT, { color: P.text }]}>Payment Completed</Text>
						</View>
					)}
				</View>
			)}
		</TouchableOpacity>
	);
});

const s = StyleSheet.create({
	// card
	card: {
		backgroundColor: "#FFFFFF",
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

	// header row
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

	// order number
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

	// meta info
	meta: { flex: 1, gap: 4 },
	chips: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		borderRadius: 20,
		paddingHorizontal: 7,
		paddingVertical: 2,
		maxWidth: 110,
	},
	chipT: { fontSize: 10, fontWeight: "700", flexShrink: 1 },
	tableChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	tableChipT: { fontSize: 12, fontWeight: "800", flexShrink: 1 },
	infoRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	infoT: { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },
	infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#D1D5DB" },

	// price + status
	price: { fontSize: 16, fontWeight: "900", color: "#111827", letterSpacing: 0.2 },
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 20,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	pillDot: { width: 5, height: 5, borderRadius: 2.5 },
	pillT: { fontSize: 9, fontWeight: "700" },

	// progress
	progTrack: { height: 2, backgroundColor: "#F3F4F6", marginHorizontal: 14, marginBottom: 6 },
	progFill: { height: "100%", borderRadius: 1 },

	// payment badge (collapsed)
	payBadge: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		marginHorizontal: 14,
		marginBottom: 10,
		borderRadius: 8,
		paddingVertical: 5,
	},
	payBadgeT: { fontSize: 10, fontWeight: "700" },

	// expanded body
	body: { paddingHorizontal: 14, paddingBottom: 14 },
	sep: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 10 },

	// status summary
	sumRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 10 },
	sumChip: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3 },
	sumDot: { width: 4, height: 4, borderRadius: 2 },
	sumT: { fontSize: 9, fontWeight: "700" },

	// item row
	iRow: {
		flexDirection: "row",
		paddingVertical: 7,
		borderBottomWidth: 1,
		borderBottomColor: "#F5F5F5",
	},
	iBar: { width: 3, borderRadius: 1.5, marginRight: 8 },
	iBody: { flex: 1, gap: 3 },
	iTop: { flexDirection: "row", alignItems: "center", gap: 4 },
	iName: { fontSize: 13, fontWeight: "600", color: "#1F2937" },
	iBadge: { borderRadius: 20, paddingHorizontal: 6, paddingVertical: 1 },
	iBadgeT: { fontSize: 8, fontWeight: "700" },
	iBot: { flexDirection: "row", alignItems: "center", gap: 8 },
	iQty: { fontSize: 12, fontWeight: "800", color: "#374151" },
	iPrice: { fontSize: 11, fontWeight: "500", color: "#9CA3AF" },
	iTotal: { fontSize: 11, fontWeight: "700", color: "#374151" },
	iBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 20,
		marginLeft: "auto",
	},
	iBtnT: { color: "#fff", fontSize: 11, fontWeight: "700" },

	// action buttons
	actions: { flexDirection: "row", gap: 8, marginTop: 12 },
	addBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		backgroundColor: "#FFF4F5",
		borderWidth: 1.5,
		borderColor: "#F0555F",
		borderRadius: 10,
		paddingVertical: 11,
	},
	addBtnT: { color: "#F0555F", fontSize: 13, fontWeight: "800" },
	billBtn: {
		flex: 1.3,
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
	billBtnT: { color: "#fff", fontSize: 13, fontWeight: "800" },

	// paid bar
	paidBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		marginTop: 10,
		borderRadius: 10,
		paddingVertical: 7,
	},
	paidBarT: { fontSize: 11, fontWeight: "700" },
});
