import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCartStore } from "../../store/cartStore";
import { useCustomerStore } from "../../store/customerStore";
import { useFlowStore } from "../../store/flowStore";
import { useTableStore } from "../../store/tableStore";
import { theme } from "../../theme";
import type { FlowDraft } from "../../types/flow";

function timeAgo(ts: number) {
	const diff = Date.now() - ts;
	const min = Math.floor(diff / 60000);
	if (min < 1) return "just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.floor(min / 60);
	return `${hr}h ago`;
}

interface Props {
	onResume: () => void;
}

export default function FlowPanel({ onResume }: Props) {
	const drafts = useFlowStore((s) => s.drafts);
	const setActiveDraftId = useFlowStore((s) => s.setActiveDraftId);
	const removeDraft = useFlowStore((s) => s.removeDraft);
	const setCart = useCartStore((s) => s.setCart);
	const setSelectedTable = useTableStore((s) => s.setSelectedTable);
	const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);

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
			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.title}>Running Orders</Text>
					<Text style={styles.subtitle}>
						{drafts.length} {drafts.length === 1 ? "draft" : "drafts"} not
						confirmed yet
					</Text>
				</View>
			</View>

			{/* List */}
			{drafts.length === 0 ? (
				<View style={styles.empty}>
					<MaterialCommunityIcons
						name="format-list-bulleted"
						size={48}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.emptyTitle}>No running orders</Text>
					<Text style={styles.emptySubtitle}>
						Start an order from the Menu tab — unfinished orders are saved
						here automatically.
					</Text>
				</View>
			) : (
				<FlatList
					data={drafts}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					removeClippedSubviews={true}
					initialNumToRender={8}
					maxToRenderPerBatch={10}
					windowSize={7}
					renderItem={({ item }) => {
						const total = item.items.reduce(
							(s, i) => s + i.price_per_unit * i.qty,
							0,
						);
						const qty = item.items.reduce((s, i) => s + i.qty, 0);
						const confirmed = item.items.filter((i) => i.sentToKitchen);
						const pending = item.items.filter((i) => !i.sentToKitchen);
						return (
							<TouchableOpacity
								style={styles.card}
								activeOpacity={0.8}
								onPress={() => handleResume(item)}
							>
								<View style={styles.cardLeft}>
									<View
										style={[
											styles.iconWrap,
											item.table_id && styles.iconWrapTable,
										]}
									>
										<MaterialCommunityIcons
											name={item.table_id ? "table-furniture" : "account-outline"}
											size={20}
											color={
												item.table_id
													? theme.colors.primary
													: theme.colors.textSecondary
											}
										/>
									</View>
									<View style={styles.cardInfo}>
										<Text style={styles.tableName} numberOfLines={1}>
											{item.table_name ?? "Walk-in"}
										</Text>
										<Text style={styles.cardSub} numberOfLines={1}>
											{item.customer_name
												? `${item.customer_name} · `
												: ""}
											{qty} {qty === 1 ? "item" : "items"} · ₹
											{total.toLocaleString()}
										</Text>
										{(confirmed.length > 0 || pending.length > 0) && (
											<View style={styles.statusBlock}>
												{confirmed.length > 0 && (
													<Text style={styles.kitchenLine} numberOfLines={1}>
														<Text style={styles.kitchenLabel}>Kitchen: </Text>
														{confirmed
															.map(
																(i) =>
																	`${i.name} ×${i.qty}`,
															)
															.join(", ")}
													</Text>
												)}
												{pending.length > 0 && (
													<Text style={styles.pendingLine} numberOfLines={1}>
														<Text style={styles.pendingLabel}>Pending: </Text>
														{pending
															.map((i) => `+ ${i.name} ×${i.qty}`)
															.join(", ")}
													</Text>
												)}
											</View>
										)}
										<Text style={styles.timeText}>
											{timeAgo(item.updated_at)}
										</Text>
									</View>
								</View>
								<View style={styles.cardRight}>
									<View style={styles.loadBtn}>
										<MaterialCommunityIcons
											name="play"
											size={16}
											color="#fff"
										/>
										<Text style={styles.loadText}>Open</Text>
									</View>
									<TouchableOpacity
										style={styles.deleteBtn}
										onPress={() => removeDraft(item.id)}
										hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
									>
										<MaterialCommunityIcons
											name="trash-can-outline"
											size={16}
											color={theme.colors.danger}
										/>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						);
					}}
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
	header: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	title: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	subtitle: {
		fontSize: 12,
		color: theme.colors.textMuted,
		marginTop: 2,
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
		padding: 12,
		paddingBottom: 24,
		gap: 10,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 12,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	cardLeft: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.surfaceTertiary,
	},
	iconWrapTable: {
		backgroundColor: theme.colors.primaryLight,
	},
	cardInfo: {
		flex: 1,
	},
	tableName: {
		fontSize: 15,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	cardSub: {
		fontSize: 12,
		color: theme.colors.textSecondary,
		marginTop: 2,
	},
	timeText: {
		fontSize: 11,
		color: theme.colors.textMuted,
		marginTop: 3,
	},
	statusBlock: {
		marginTop: 4,
		gap: 2,
	},
	kitchenLine: {
		fontSize: 11,
		color: theme.colors.textSecondary,
	},
	kitchenLabel: {
		fontWeight: "800",
		color: theme.colors.success,
	},
	pendingLine: {
		fontSize: 11,
		color: theme.colors.textSecondary,
	},
	pendingLabel: {
		fontWeight: "800",
		color: theme.colors.warning,
	},
	cardRight: {
		alignItems: "flex-end",
		gap: 8,
		marginLeft: 8,
	},
	loadBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 10,
		paddingVertical: 6,
		...theme.shadow.sm,
	},
	loadText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "800",
	},
	deleteBtn: {
		padding: 2,
	},
});
