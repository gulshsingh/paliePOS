import { useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCustomers } from "../../hooks/useCustomers";
import { useCreateOrder } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";
import { useCartStore } from "../../store/cartStore";
import { useCustomerStore } from "../../store/customerStore";
import { useOrderStore } from "../../store/orderStore";
import { useTableStore } from "../../store/tableStore";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";
import type { Order } from "../../types/order";
import CustomerModal from "../customer/CustomerModal";
import TableModal from "../table/TableModal";
import CartModalItem from "./CartModalItem";

export const CART_ITEM_HEIGHT = 70;

interface Props {
	visible: boolean;
	cart: CartItem[];
	onClose: () => void;
}

export default function CartModal({ visible, cart, onClose }: Props) {
	const navigation = useNavigation<any>();
	const increaseQty = useCartStore((s) => s.increaseQty);
	const decreaseQty = useCartStore((s) => s.decreaseQty);
	const clearCart = useCartStore((s) => s.clearCart);
	const addOrder = useOrderStore((s) => s.addOrder);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);

	const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
	const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);
	const selectedTable = useTableStore((s) => s.selectedTable);
	const setSelectedTable = useTableStore((s) => s.setSelectedTable);

	const [customerModal, setCustomerModal] = useState(false);
	const [tableModal, setTableModal] = useState(false);

	const { data: customersData } = useCustomers();
	const { data: tablesData } = useTables();
	const createOrder = useCreateOrder();

	const customers = useMemo(
		() =>
			customersData?.pages?.flatMap((p) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [],
		[customersData],
	);

	const tables: any[] = useMemo(() => {
		const d = tablesData?.data as any;
		return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? [];
	}, [tablesData]);

	const { subtotal, taxTotal, grandTotal } = useMemo(() => {
		const sub = cart.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
		const tax = cart.reduce(
			(s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100,
			0,
		);
		return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
	}, [cart]);

	const handleClearAll = useCallback(() => {
		clearCart();
		setSelectedCustomer(null);
		setSelectedTable(null);
	}, [clearCart, setSelectedCustomer, setSelectedTable]);

	const handleSendToKitchen = async () => {
		if (cart.length === 0) return;
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
				items: cart.map((i) => ({ ...i, status: "pending" as const })),
				total: grandTotal,
				status: "PENDING",
				paymentStatus: "UNPAID",
				table_id: selectedTable?.id ?? null,
				account_id: selectedCustomer?.id ?? null,
				table_name: selectedTable?.name,
				customer_name: selectedCustomer?.name,
			};

			addOrder(newOrder);
			clearCart();
			setActiveOrder(null);
			setSelectedTable(null);
			setSelectedCustomer(null);
			onClose();
		} catch (e) {
			console.error("Failed to create order", e);
		}
	};

	const handlePayment = () => {
		onClose();
		navigation.navigate("ProceedPayment", {
			customer: selectedCustomer,
			table: selectedTable,
		});
	};

	const renderItem = useCallback(
		({ item }: { item: CartItem }) => (
			<CartModalItem
				item={item}
				onIncrease={increaseQty}
				onDecrease={decreaseQty}
			/>
		),
		[increaseQty, decreaseQty],
	);

	const renderHeader = useCallback(
		() => (
			<View style={styles.itemsHeader}>
				<Text style={styles.itemsHeaderText}>
					{cart.length} {cart.length === 1 ? "item" : "items"} in cart
				</Text>
				<TouchableOpacity onPress={handleClearAll}>
					<Text style={styles.clearText}>Clear all</Text>
				</TouchableOpacity>
			</View>
		),
		[cart.length, handleClearAll],
	);

	const renderFooter = useCallback(
		() => (
			<View style={styles.totals}>
				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>Subtotal</Text>
					<Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
				</View>
				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>Tax</Text>
					<Text style={styles.totalValue}>₹{taxTotal.toLocaleString()}</Text>
				</View>
				<View style={[styles.totalRow, styles.grandRow]}>
					<Text style={styles.grandLabel}>Total</Text>
					<Text style={styles.grandValue}>₹{grandTotal.toLocaleString()}</Text>
				</View>
			</View>
		),
		[subtotal, taxTotal, grandTotal],
	);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity style={styles.sheet} activeOpacity={1}>
					{/* Handle */}
					<View style={styles.handle} />

					{/* Header */}
					<View style={styles.header}>
						<View>
							<Text style={styles.title}>Your Cart</Text>
							<Text style={styles.subtitle}>
								{cart.length} {cart.length === 1 ? "item" : "items"} added
							</Text>
						</View>
						<TouchableOpacity style={styles.closeBtn} onPress={onClose}>
							<MaterialCommunityIcons
								name="close"
								size={18}
								color={theme.colors.textSecondary}
							/>
						</TouchableOpacity>
					</View>

					{/* Customer / Table selection */}
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
									selectedCustomer
										? theme.colors.primary
										: theme.colors.textMuted
								}
							/>
							<Text
								style={[
									styles.chipText,
									selectedCustomer && styles.chipTextActive,
								]}
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
								style={[
									styles.chipText,
									selectedTable && styles.chipTextActive,
								]}
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

					{/* Items */}
					{cart.length === 0 ? (
						<View style={styles.empty}>
							<MaterialCommunityIcons
								name="cart-outline"
								size={40}
								color={theme.colors.textMuted}
							/>
							<Text style={styles.emptyText}>Your cart is empty</Text>
						</View>
					) : (
						<>
							<FlatList
								data={cart}
								keyExtractor={(item) => item.id}
								renderItem={renderItem}
								ListHeaderComponent={renderHeader}
								ListFooterComponent={renderFooter}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								contentContainerStyle={styles.listContent}
								removeClippedSubviews={false}
								initialNumToRender={6}
								maxToRenderPerBatch={6}
								windowSize={7}
							/>

							{/* Fixed bottom actions */}
							<View style={styles.actions}>
								<TouchableOpacity
									style={[styles.actionBtn, styles.kitchenBtn]}
									onPress={handleSendToKitchen}
									disabled={createOrder.isPending}
									activeOpacity={0.85}
								>
									<MaterialCommunityIcons
										name="chef-hat"
										size={18}
										color={theme.colors.primary}
									/>
									<Text style={styles.kitchenBtnText}>
										{createOrder.isPending ? "Sending..." : "Send to Kitchen"}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.actionBtn, styles.payBtn]}
									onPress={handlePayment}
									activeOpacity={0.85}
								>
									<MaterialCommunityIcons
										name="cash-register"
										size={18}
										color="#fff"
									/>
									<Text style={styles.payBtnText}>Proceed to Pay</Text>
								</TouchableOpacity>
							</View>
						</>
					)}
				</TouchableOpacity>
			</TouchableOpacity>

			{/* Nested selection modals */}
			<CustomerModal
				visible={customerModal}
				customers={customers}
				onSelect={setSelectedCustomer}
				onClose={() => setCustomerModal(false)}
			/>
			<TableModal
				visible={tableModal}
				tables={tables}
				onSelect={setSelectedTable}
				onClose={() => setTableModal(false)}
			/>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 16,
		paddingBottom: 28,
		maxHeight: "85%",
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: theme.colors.border,
		alignSelf: "center",
		marginTop: 10,
		marginBottom: 6,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	title: { fontSize: 17, fontWeight: "800", color: theme.colors.textPrimary },
	subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
	closeBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: theme.colors.surfaceSecondary,
		justifyContent: "center",
		alignItems: "center",
	},
	empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
	emptyText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: "600" },
	selectionRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 8,
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
	listContent: {
		paddingHorizontal: 12,
		paddingBottom: 12,
	},
	itemsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 12,
		paddingBottom: 6,
	},
	itemsHeaderText: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.textSecondary,
	},
	clearText: {
		fontSize: 13,
		color: theme.colors.danger,
		fontWeight: "700",
	},
	totals: {
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
		paddingTop: 12,
		gap: 8,
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	totalLabel: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		fontWeight: "600",
	},
	totalValue: {
		fontSize: 13,
		color: theme.colors.textPrimary,
		fontWeight: "700",
	},
	grandRow: {
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},
	grandLabel: {
		fontSize: 16,
		fontWeight: "900",
		color: theme.colors.textPrimary,
	},
	grandValue: { fontSize: 18, fontWeight: "900", color: theme.colors.primary },
	actions: {
		marginTop: 10,
		flexDirection: "row",
		gap: 10,
	},
	actionBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 15,
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
	payBtnText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
});
