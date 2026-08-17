import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";
import type { ApiOrderItemStatus, Order } from "../../types/order";

interface Props {
	order: Order;
	onBillOrder?: (order: Order) => void;
	onAddItems?: (order: Order) => void;
	onUpdateStatus?: (itemId: string, status: ApiOrderItemStatus) => void;
	readOnly?: boolean;
}

const NEXT_STATUS: Record<
	string,
	{ action: string; next: ApiOrderItemStatus }
> = {
	pending: { action: "Send to Kitchen", next: "preparing" },
	preparing: { action: "Mark Ready", next: "ready" },
	ready: { action: "Serve Now", next: "served" },
};

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

export default memo(function OrderCard({
	order,
	onBillOrder,
	onAddItems,
	onUpdateStatus,
	readOnly = false,
}: Props) {
	const [expanded, setExpanded] = useState(false);

	const allServed = order.items.every((i) => i.status === "served");
	const isPaid = order.paymentStatus === "PAID";
	const totalQty = order.items.reduce((s, i) => s + i.qty, 0);

	// Group lines by their kitchen ticket (KOT). Lines without a KOT number
	// are treated as the original KOT #1.
	const groups = useMemo(() => {
		const map = new Map<number, CartItem[]>();
		for (const it of order.items) {
			const key = it.kotNo ?? 1;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(it);
		}
		return [...map.entries()].sort((a, b) => a[0] - b[0]);
	}, [order.items]);

	return (
		<TouchableOpacity
			style={styles.card}
			onPress={() => setExpanded(!expanded)}
			activeOpacity={0.95}
		>
			{/* Card header */}
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View style={styles.orderNumBadge}>
						<Text style={styles.orderNum}>#{order.order_number}</Text>
						{order.customer_name && (
							<Text style={styles.custChipText} numberOfLines={1}>
								{order.customer_name}
							</Text>
						)}
					</View>
					<View>
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

				<View style={styles.headerRight}>
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

			{/* Expanded items grouped by KOT */}
			{expanded && (
				<View style={styles.body}>
					<View style={styles.bodyDivider} />

					{groups.map(([kotNo, items]) => {
						const isAddition = kotNo > 1;
						return (
							<View key={kotNo} style={styles.kotBlock}>
								<View style={styles.kotHeader}>
									<View style={styles.kotLeft}>
										<Text style={styles.kotLabel}>KOT #{kotNo}</Text>
										{isAddition && (
											<View style={styles.kotAddTag}>
												<Text style={styles.kotAddTagText}>ADDITION</Text>
											</View>
										)}
									</View>
									{items.length > 1 && (
										<Text style={styles.kotCount}>
											{items.reduce((s, i) => s + i.qty, 0)} qty
										</Text>
									)}
								</View>

								{items.map((item, idx) => {
									const next = NEXT_STATUS[item.status];

									return (
										<View key={item.id} style={styles.itemRow}>
											<View style={styles.itemIdxWrap}>
												<Text style={styles.itemIdx}>{idx + 1}</Text>
												{isAddition && <Text style={styles.addPrefix}>+</Text>}
											</View>
											<Text style={styles.itemName} numberOfLines={1}>
												{item.name}
											</Text>
											<Text style={styles.itemQty}>
												{item.qty} X ₹{item.price_per_unit.toLocaleString("en-IN")}
											</Text>
{next && !readOnly && (
											<TouchableOpacity
												style={styles.actionChip}
												onPress={() =>
													onUpdateStatus?.(item.id, next.next)
												}
												activeOpacity={0.75}
											>
												<Text style={styles.actionChipText}>
													{next.action}
												</Text>
											</TouchableOpacity>
										)}
										{readOnly && (
											<View
												style={[
													styles.statusBadge,
													{ backgroundColor: STATUS_BADGE[item.status]?.bg },
												]}
											>
												<Text
													style={[
														styles.statusBadgeText,
														{ color: STATUS_BADGE[item.status]?.color },
													]}
												>
													{STATUS_BADGE[item.status]?.label ?? item.status}
												</Text>
											</View>
										)}
										</View>
									);
								})}
							</View>
						);
					})}

					{/* Add Items + Bill buttons */}
					{!readOnly && (
						<View style={styles.actionsRow}>
							{!isPaid && (
								<TouchableOpacity
									style={styles.addBtn}
									onPress={() => onAddItems?.(order)}
									activeOpacity={0.85}
								>
									<MaterialCommunityIcons
										name="plus"
										size={16}
										color={theme.colors.primary}
									/>
									<Text style={styles.addBtnText}>Add Items</Text>
								</TouchableOpacity>
							)}
							<TouchableOpacity
								style={[styles.billBtn, !allServed && styles.billBtnAlt]}
								onPress={() => onBillOrder?.(order)}
								activeOpacity={0.85}
							>
								<MaterialCommunityIcons
									name="cash-register"
									size={16}
									color={allServed ? "#fff" : theme.colors.primary}
								/>
								<Text
									style={[
										styles.billBtnText,
										!allServed && styles.billBtnTextAlt,
									]}
								>
									{allServed ? "Generate Bill" : "Bill This Order"}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			)}
		</TouchableOpacity>
	);
});

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		marginHorizontal: 12,
		marginVertical: 5,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		overflow: "hidden",
		...theme.shadow.sm,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 14,
	},
	headerLeft: {
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
	orderNum: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "900",
	},
	metaRow: {
		flexDirection: "row",
		gap: 6,
		flexWrap: "wrap",
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
	custChipText: {
		color: theme.colors.textSecondary,
		fontSize: 10,
		fontWeight: "600",
		marginTop: 2,
		maxWidth: 90,
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
	itemCount: {
		color: theme.colors.textMuted,
		fontSize: 11,
		marginTop: 2,
	},
	headerRight: {
		alignItems: "flex-end",
		gap: 4,
	},
	totalAmount: {
		color: theme.colors.textPrimary,
		fontSize: 16,
		fontWeight: "900",
	},
	body: {
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
	// KOT grouping
	kotBlock: {
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},
	kotHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	kotLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	kotLabel: {
		fontSize: 11,
		fontWeight: "900",
		color: theme.colors.textSecondary,
		letterSpacing: 0.5,
	},
	kotAddTag: {
		backgroundColor: theme.colors.warningLight,
		borderRadius: theme.radius.full,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	kotAddTagText: {
		fontSize: 9,
		fontWeight: "900",
		color: theme.colors.warning,
		letterSpacing: 0.8,
	},
	kotCount: {
		fontSize: 11,
		color: theme.colors.textMuted,
		fontWeight: "700",
	},
	itemIdxWrap: {
		flexDirection: "row",
		alignItems: "center",
	},
	addPrefix: {
		color: theme.colors.warning,
		fontSize: 13,
		fontWeight: "900",
		marginLeft: 2,
	},
	actionChip: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: theme.radius.full,
	},
	actionChipText: {
		color: "#fff",
		fontSize: 11,
		fontWeight: "700",
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
	actionsRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	addBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		paddingVertical: 12,
	},
	addBtnText: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "800",
	},
	billBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: theme.colors.primary,
		paddingVertical: 12,
		borderRadius: theme.radius.md,
		...theme.shadow.lg,
	},
	billBtnAlt: {
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
		shadowColor: "transparent",
		elevation: 0,
	},
	billBtnText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
	},
	billBtnTextAlt: {
		color: theme.colors.primary,
	},
});
