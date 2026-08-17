import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	SectionList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BillingItem from "../../components/billing/BillingItem";
import CustomerModal from "../../components/customer/CustomerModal";
import TableModal from "../../components/table/TableModal";
import { useCustomers } from "../../hooks/useCustomers";
import { useAddOrderItems, useCreateOrder } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";
import { useCartStore } from "../../store/cartStore";
import { useCustomerStore } from "../../store/customerStore";
import { useFlowStore } from "../../store/flowStore";
import { useOrderStore } from "../../store/orderStore";
import { useTableStore } from "../../store/tableStore";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";

interface Props {
	onRequestClose?: () => void;
}

export default function BillingPanel({ onRequestClose }: Props) {
	const navigation = useNavigation<any>();
	const cart = useCartStore((s) => s.cart);
	const clearCart = useCartStore((s) => s.clearCart);
	const setCart = useCartStore((s) => s.setCart);
	const addOrder = useOrderStore((s) => s.addOrder);
	const updateOrder = useOrderStore((s) => s.updateOrder);
	const activeOrderId = useOrderStore((s) => s.activeOrderId);
	const orders = useOrderStore((s) => s.orders);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
	const selectedTable = useTableStore((s) => s.selectedTable);
	const setSelectedTable = useTableStore((s) => s.setSelectedTable);
	const activeDraftId = useFlowStore((s) => s.activeDraftId);
	const removeDraft = useFlowStore((s) => s.removeDraft);
	const setActiveDraftId = useFlowStore((s) => s.setActiveDraftId);

	const [customerModal, setCustomerModal] = useState(false);
	const [tableModal, setTableModal] = useState(false);
	const submittingRef = useRef(false);
	const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
	const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);

	const { data: customersData } = useCustomers();
	const { data: tablesData } = useTables();
	const createOrder = useCreateOrder();
	const addOrderItems = useAddOrderItems();

	const customers = useMemo(
		() =>
			customersData?.pages?.flatMap((p) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [],
		[customersData],
	);

	const tables: RestaurantTable[] = useMemo(() => {
		const d = tablesData?.data as any;
		return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? [];
	}, [tablesData]);

	const existingOrder = useMemo(
		() => orders.find((o) => o.id === activeOrderId) ?? null,
		[orders, activeOrderId],
	);

	// Model B: while editing an existing order, only lines that were never
	// confirmed to kitchen (sentToKitchen = false) are pending additions.
	const additions = useMemo(() => cart.filter((i) => !i.sentToKitchen), [cart]);

	const isBillingExisting = activeOrderId != null;

	// Sections: locked existing items + editable new additions.
	const cartSections = useMemo(() => {
		if (!isBillingExisting) return [{ key: "all", data: cart }];
		const existingItems = cart.filter((i) => i.sentToKitchen);
		const newItems = cart.filter((i) => !i.sentToKitchen);
		const sections: {
			key: string;
			title?: string;
			locked?: boolean;
			data: CartItem[];
		}[] = [];
		if (existingItems.length > 0) {
			sections.push({
				key: "existing",
				title: "Existing Items",
				locked: true,
				data: existingItems,
			});
		}
		if (newItems.length > 0) {
			sections.push({
				key: "new",
				title: "New Items",
				locked: false,
				data: newItems,
			});
		}
		return sections;
	}, [cart, isBillingExisting]);

	// ── Auto-fill customer & table from the order being billed ──
	const [autofilledFor, setAutofilledFor] = useState<string | null>(null);
	useEffect(() => {
		if (!existingOrder) return;
		if (autofilledFor === existingOrder.id) return;

		const customerFound = existingOrder.account_id
			? customers.find((cc) => cc.id === existingOrder.account_id)
			: null;
		const tableFound = existingOrder.table_id
			? tables.find((tt) => tt.id === existingOrder.table_id)
			: null;

		// Only apply values we can resolve. Don't set the re-run guard until
		// every referenced id has resolved, so a late-arriving customers/tables
		// fetch can still populate the chips.
		if (existingOrder.account_id && !customerFound) return;
		if (existingOrder.table_id && !tableFound) return;
		if (customerFound) setSelectedCustomer(customerFound);
		if (tableFound) setSelectedTable(tableFound);
		setAutofilledFor(existingOrder.id);
	}, [
		existingOrder,
		customers,
		tables,
		autofilledFor,
		setSelectedTable,
		setSelectedCustomer,
	]);

	const { subtotal, taxTotal, grandTotal } = useMemo(() => {
		const sub = cart.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
		// Existing order: tax already computed by backend (items carry tax=0),
		// so use the order's tax_amount + tax on newly added lines.
		const existingTax = isBillingExisting
			? Number(existingOrder?.tax_amount) || 0
			: 0;
		const additionsTax = additions.reduce(
			(s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100,
			0,
		);
		const tax = existingTax + additionsTax;
		return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
	}, [cart, additions, isBillingExisting, existingOrder]);

	const handleClearAll = useCallback(() => {
		// In edit mode only the unsent additions can be cleared; the confirmed
		// existing items stay locked.
		if (existingOrder) {
			setCart(cart.filter((i) => i.sentToKitchen));
		} else {
			clearCart();
		}
		setSelectedCustomer(null);
		setSelectedTable(null);
	}, [
		existingOrder,
		cart,
		setCart,
		clearCart,
		setSelectedCustomer,
		setSelectedTable,
	]);

	const handleSendToKitchen = async () => {
		if (cart.length === 0 || submittingRef.current) return;
		submittingRef.current = true;
		if (existingOrder) {
			if (existingOrder.paymentStatus === "PAID") {
				submittingRef.current = false;
				return;
			}
			handleEditSend(existingOrder);
			submittingRef.current = false;
			return;
		}
		try {
			const res = await createOrder.mutateAsync({
				table_id: selectedTable?.id ?? null,
				account_id: selectedCustomer?.id ?? null,
				total_amount: subtotal,
				tax_amount: taxTotal,
				discount_amount: 0,
				grand_total: grandTotal,
				items: cart.map((i) => ({
					product_id: i.id,
					quantity: i.qty,
					price: i.price_per_unit,
					total: i.price_per_unit * i.qty,
				})),
			});

			const created = (res.data as any)?.data;
			const o = created?.data ?? created;

			const newOrder: Order = {
				id: o?.id,
				order_number: o?.order_number,
				items: cart.map((i) => ({
					...i,
					status: "pending" as const,
					sentToKitchen: true,
					kotNo: 1,
				})),
				total: grandTotal,
				tax_amount: taxTotal,
				status: "PENDING",
				paymentStatus: "UNPAID",
				table_id: selectedTable?.id ?? null,
				account_id: selectedCustomer?.id ?? null,
				table_name: selectedTable?.name,
				customer_name: selectedCustomer?.name,
				kots: [
					{
						kotNo: 1,
						items: cart.map(({ id, name, qty, price_per_unit }) => ({
							id,
							name,
							qty,
							price_per_unit,
						})),
						createdAt: new Date().toISOString(),
					},
				],
				nextKotNo: 2,
			};

			addOrder(newOrder);
			clearCart();
			setActiveOrder(null);
			setSelectedTable(null);
			setSelectedCustomer(null);
			if (activeDraftId) removeDraft(activeDraftId);
			setActiveDraftId(null);
			onRequestClose?.();
		} catch (e) {
			console.error("Failed to create order", e);
		} finally {
			submittingRef.current = false;
		}
	};

	// Model B delta: only never-sent lines go to the kitchen as a new KOT.
	// Original items keep their status — kitchen never re-cooks them.
	const handleEditSend = (order: Order) => {
		if (additions.length === 0) return;
		const kotNo = Math.max(
			order.nextKotNo ?? 1,
			order.items.reduce((m, i) => Math.max(m, i.kotNo ?? 0), 0) + 1,
			(order.kots?.length ?? 0) + 1,
		);
		const sentAdditions = additions.map((i) => ({
			...i,
			status: "pending" as const,
			sentToKitchen: true,
			kotNo,
		}));
		const deltaTotal = sentAdditions.reduce(
			(s, i) =>
				s + i.price_per_unit * i.qty + (i.price_per_unit * i.qty * i.tax) / 100,
			0,
		);
		const deltaTax = sentAdditions.reduce(
			(s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100,
			0,
		);
		updateOrder(order.id, {
			items: [...order.items, ...sentAdditions],
			total: order.total + deltaTotal,
			tax_amount: (order.tax_amount ?? 0) + deltaTax,
			nextKotNo: kotNo + 1,
			kots: [
				...(order.kots ?? []),
				{
					kotNo,
					items: sentAdditions.map(({ id, name, qty, price_per_unit }) => ({
						id,
						name,
						qty,
						price_per_unit,
					})),
					createdAt: new Date().toISOString(),
				},
			],
		});
		addOrderItems.mutate({
			orderId: order.id,
			items: sentAdditions.map((i) => ({
				product_id: i.id,
				quantity: i.qty,
				price: i.price_per_unit,
				total: i.price_per_unit * i.qty,
			})),
		});
		clearCart();
		setActiveOrder(null);
		setSelectedTable(null);
		setSelectedCustomer(null);
		if (activeDraftId) removeDraft(activeDraftId);
		setActiveDraftId(null);
		onRequestClose?.();
		Alert.alert(
			"Sent to Kitchen",
			`KOT #${kotNo} — ${additions.length} item${additions.length === 1 ? "" : "s"} added to Order #${order.order_number}`,
		);
	};

	const handlePayment = () => {
		onRequestClose?.();
		navigation.navigate("ProceedPayment", {
			customer: selectedCustomer,
			table: selectedTable,
		});
	};

	// ── ALL hooks must be declared before any conditional return ──

	const renderItem = useCallback(
		({ item, section }: { item: CartItem; section: any }) => (
			<BillingItem item={item} locked={section?.locked} />
		),
		[],
	);

	const renderSectionHeader = useCallback(
		({ section }: { section: any }) =>
			section.title ? (
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionHeaderText}>{section.title}</Text>
					{section.locked ? (
						<View style={styles.sectionTag}>
							<MaterialCommunityIcons
								name="lock-outline"
								size={11}
								color={theme.colors.textMuted}
							/>
							<Text style={styles.sectionTagText}>Locked</Text>
						</View>
					) : (
						<View style={[styles.sectionTag, styles.sectionTagNew]}>
							<MaterialCommunityIcons
								name="plus"
								size={11}
								color={theme.colors.success}
							/>
							<Text
								style={[styles.sectionTagText, { color: theme.colors.success }]}
							>
								Editable
							</Text>
						</View>
					)}
				</View>
			) : null,
		[],
	);

	const renderFooter = useCallback(
		() => (
			<View style={styles.summary}>
				<View style={styles.summaryHeader}>
					<MaterialCommunityIcons
						name="calculator-variant"
						size={16}
						color={theme.colors.primary}
					/>
					<Text style={styles.summaryTitle}>Bill Summary</Text>
				</View>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryLabel}>
						Item Total ({cart.length} {cart.length === 1 ? "item" : "items"})
					</Text>
					<Text style={styles.summaryValue}>₹{subtotal.toLocaleString("en-IN")}</Text>
				</View>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryLabel}>Taxes & Charges</Text>
					<Text style={styles.summaryValue}>₹{taxTotal.toLocaleString("en-IN")}</Text>
				</View>
				<View style={styles.divider} />
				<View style={styles.grandRow}>
					<Text style={styles.grandLabel}>To Pay</Text>
					<Text style={styles.grandValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
				</View>
			</View>
		),
		[subtotal, taxTotal, grandTotal, cart.length],
	);

	const renderHeader = useCallback(
		() => (
			<View style={styles.itemsHeader}>
				<View style={styles.itemsHeaderLeft}>
					<View style={styles.itemsHeaderIcon}>
						<MaterialCommunityIcons
							name="shopping-outline"
							size={13}
							color={theme.colors.primary}
						/>
					</View>
					<Text style={styles.itemsHeaderText}>
						{cart.length} {cart.length === 1 ? "item" : "items"} in cart
					</Text>
				</View>
				<TouchableOpacity onPress={handleClearAll}>
					<Text style={styles.clearText}>
						{isBillingExisting ? "Clear new" : "Clear all"}
					</Text>
				</TouchableOpacity>
			</View>
		),
		[cart.length, handleClearAll, isBillingExisting],
	);

	const isPaid = existingOrder?.paymentStatus === "PAID";

	return (
		<View style={styles.container}>
			{/* ── Fixed top: Customer / Table chips ── */}
			<View style={styles.selectionRow}>
				<TouchableOpacity
					style={[styles.chip, selectedCustomer && styles.chipActive]}
					onPress={() => setCustomerModal(true)}
					activeOpacity={0.8}
				>
					<MaterialCommunityIcons
						name="account-outline"
						size={15}
						color={
							selectedCustomer ? theme.colors.primary : theme.colors.textMuted
						}
					/>
					<Text
						style={[styles.chipText, selectedCustomer && styles.chipTextActive]}
						numberOfLines={1}
					>
						{selectedCustomer ? selectedCustomer.name : "Add Customer"}
					</Text>
					{selectedCustomer && (
						<MaterialCommunityIcons
							name="check-circle"
							size={14}
							color={theme.colors.primary}
						/>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.chip, selectedTable && styles.chipActive]}
					onPress={() => setTableModal(true)}
					activeOpacity={0.8}
				>
					<MaterialCommunityIcons
						name="table-furniture"
						size={15}
						color={
							selectedTable ? theme.colors.primary : theme.colors.textMuted
						}
					/>
					<Text
						style={[styles.chipText, selectedTable && styles.chipTextActive]}
						numberOfLines={1}
					>
						{selectedTable ? selectedTable.name : "Select Table"}
					</Text>
					{selectedTable && (
						<MaterialCommunityIcons
							name="check-circle"
							size={14}
							color={theme.colors.primary}
						/>
					)}
				</TouchableOpacity>
			</View>

			{/* ── Billing existing order info ── */}
			{existingOrder && (
				<View style={styles.orderInfoRow}>
					<View style={styles.orderInfoLeft}>
						<View style={styles.orderInfoIcon}>
							<MaterialCommunityIcons
								name="receipt"
								size={14}
								color="#fff"
							/>
						</View>
						<View>
							<Text style={styles.orderInfoText}>
								ORDER #{existingOrder.order_number}
							</Text>
							{(selectedTable?.name || selectedCustomer?.name) && (
								<Text style={styles.orderInfoSub} numberOfLines={1}>
									{[selectedTable?.name, selectedCustomer?.name]
										.filter(Boolean)
										.join(" · ")}
								</Text>
							)}
						</View>
					</View>
					<View
						style={[
							styles.payStatusChip,
							{
								backgroundColor: isPaid
									? theme.colors.successLight
									: theme.colors.warningLight,
							},
						]}
					>
						<MaterialCommunityIcons
							name={isPaid ? "check-circle" : "clock-outline"}
							size={12}
							color={isPaid ? theme.colors.success : theme.colors.warning}
						/>
						<Text
							style={[
								styles.payStatusText,
								{ color: isPaid ? theme.colors.success : theme.colors.warning },
							]}
						>
							{isPaid ? "PAID" : (existingOrder.paymentStatus ?? "UNPAID")}
						</Text>
					</View>
				</View>
			)}

			{/* ── Empty state ── */}
			{cart.length === 0 ? (
				<View style={styles.emptyState}>
					<View style={styles.emptyIconWrap}>
						<MaterialCommunityIcons
							name="cart-outline"
							size={48}
							color={theme.colors.textMuted}
						/>
					</View>
					<Text style={styles.emptyTitle}>Your cart is empty</Text>
					<Text style={styles.emptySubtitle}>Add items from the Menu tab</Text>
				</View>
			) : (
				<>
					{/* ── SectionList: Existing (locked) / New items + summary ── */}
					<SectionList
						sections={cartSections}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						renderSectionHeader={renderSectionHeader}
						ListHeaderComponent={renderHeader}
						ListFooterComponent={renderFooter}
						contentContainerStyle={styles.listContent}
						stickySectionHeadersEnabled={false}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						removeClippedSubviews={true}
						initialNumToRender={6}
						maxToRenderPerBatch={6}
						windowSize={7}
					/>

					{/* ── Fixed bottom: action buttons ── */}
					<View style={styles.actions}>
						<TouchableOpacity
							style={[styles.actionBtn, styles.kitchenBtn]}
							onPress={handleSendToKitchen}
							disabled={
								isPaid ||
								(isBillingExisting
									? additions.length === 0
									: createOrder.isPending)
							}
							activeOpacity={0.85}
						>
							<MaterialCommunityIcons
								name="chef-hat"
								size={18}
								color={
									isPaid || (isBillingExisting && additions.length === 0)
										? theme.colors.textMuted
										: theme.colors.primary
								}
							/>
							<Text style={styles.kitchenBtnText}>
								{isPaid
									? "Order Paid"
									: isBillingExisting
										? additions.length > 0
											? `Send to Kitchen (${additions.length})`
											: "No New Items"
										: createOrder.isPending
											? "Sending..."
											: "Send to Kitchen"}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.actionBtn,
								styles.payBtn,
								isPaid && styles.payBtnDisabled,
							]}
							onPress={handlePayment}
							disabled={isPaid}
							activeOpacity={0.85}
						>
							<MaterialCommunityIcons
								name={isPaid ? "check-circle-outline" : "cash-register"}
								size={18}
								color="#fff"
							/>
							<Text style={styles.payBtnText}>
								{isPaid ? "Invoice Paid" : "Proceed to Pay"}
							</Text>
						</TouchableOpacity>
					</View>
				</>
			)}

			<CustomerModal
				visible={customerModal}
				customers={customers}
				onSelect={(c) => setSelectedCustomer(c)}
				onClose={() => setCustomerModal(false)}
			/>
			<TableModal
				visible={tableModal}
				tables={tables}
				onSelect={(t) => setSelectedTable(t)}
				onClose={() => setTableModal(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},

	// ── Fixed top chips ───────────────────────────────────
	selectionRow: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	chip: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.full,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	chipActive: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	chipText: {
		flex: 1,
		color: theme.colors.textMuted,
		fontSize: 12,
		fontWeight: "600",
	},
	chipTextActive: {
		color: theme.colors.primary,
	},

	// ── Billing existing order info ────────────────────────
	orderInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: theme.colors.primaryLight,
		borderBottomWidth: 1,
		borderBottomColor: `${theme.colors.primary}22`,
	},
	orderInfoLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	orderInfoIcon: {
		width: 28,
		height: 28,
		borderRadius: 9,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	orderInfoText: {
		color: theme.colors.textPrimary,
		fontSize: 13,
		fontWeight: "800",
		letterSpacing: 0.3,
	},
	orderInfoSub: {
		color: theme.colors.textSecondary,
		fontSize: 11,
		fontWeight: "600",
		marginTop: 1,
		maxWidth: 220,
	},
	payStatusChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: theme.radius.full,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	payStatusText: {
		fontSize: 11,
		fontWeight: "800",
	},

	// ── Empty state ───────────────────────────────────────
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 60,
	},
	emptyIconWrap: {
		width: 90,
		height: 90,
		borderRadius: 45,
		backgroundColor: theme.colors.surfaceTertiary,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	emptyTitle: {
		color: theme.colors.textPrimary,
		fontSize: 18,
		fontWeight: "700",
	},
	emptySubtitle: {
		color: theme.colors.textMuted,
		fontSize: 13,
		marginTop: 6,
	},

	// ── FlatList ──────────────────────────────────────────
	listContent: {
		paddingHorizontal: 12,
		paddingBottom: 12,
	},

	// ── ListHeader ────────────────────────────────────────
	itemsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 12,
		paddingBottom: 6,
	},
	itemsHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	itemsHeaderIcon: {
		width: 22,
		height: 22,
		borderRadius: 7,
		backgroundColor: theme.colors.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	itemsHeaderText: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.textSecondary,
	},
	clearText: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.danger,
	},

	// ── Section headers (Existing / New) ──────────────────
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 10,
		marginBottom: 6,
	},
	sectionHeaderText: {
		fontSize: 12,
		fontWeight: "800",
		color: theme.colors.textMuted,
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	sectionTag: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		backgroundColor: theme.colors.surfaceTertiary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	sectionTagNew: {
		backgroundColor: theme.colors.successLight,
	},
	sectionTagText: {
		fontSize: 10,
		fontWeight: "700",
		color: theme.colors.textMuted,
	},

	// ── Bill Summary (ListFooter) ─────────────────────────
	summary: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 16,
		marginTop: 10,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	summaryHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	summaryTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	summaryLabel: {
		fontSize: 13,
		color: theme.colors.textSecondary,
	},
	summaryValue: {
		fontSize: 13,
		color: theme.colors.textPrimary,
		fontWeight: "600",
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.borderLight,
		marginVertical: 10,
	},
	grandRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: theme.colors.primaryLight,
		borderRadius: theme.radius.md,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	grandLabel: {
		fontSize: 15,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	grandValue: {
		fontSize: 18,
		fontWeight: "900",
		color: theme.colors.primary,
	},

	// ── Fixed bottom buttons ──────────────────────────────
	actions: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: theme.colors.surfaceSecondary,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},
	actionBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: theme.radius.md,
	},
	kitchenBtn: {
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
	},
	kitchenBtnText: {
		color: theme.colors.primary,
		fontSize: 13,
		fontWeight: "800",
	},
	payBtn: {
		backgroundColor: theme.colors.primary,
		...theme.shadow.lg,
	},
	payBtnDisabled: {
		backgroundColor: theme.colors.success,
		shadowColor: "transparent",
		elevation: 0,
	},
	payBtnText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
});
