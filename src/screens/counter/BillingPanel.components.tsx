import { Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
import { styles } from "./BillingPanel.styles";

type NamedValue = { name?: string } | null | undefined;

export function BillingSelectionRow({
	selectedCustomer,
	selectedTable,
	onCustomerPress,
	onTablePress,
}: {
	selectedCustomer: NamedValue;
	selectedTable: RestaurantTable | null | undefined;
	onCustomerPress: () => void;
	onTablePress: () => void;
}) {
	return (
		<View style={styles.selectionRow}>
			<TouchableOpacity
				style={[styles.chip, selectedCustomer && styles.chipActive]}
				onPress={onCustomerPress}
				activeOpacity={0.8}
			>
				<MaterialCommunityIcons
					name="account-outline"
					size={15}
					color={selectedCustomer ? theme.colors.primary : theme.colors.textMuted}
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
				onPress={onTablePress}
				activeOpacity={0.8}
			>
				<MaterialCommunityIcons
					name="table-furniture"
					size={15}
					color={selectedTable ? theme.colors.primary : theme.colors.textMuted}
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
	);
}

export function BillingOrderInfo({
	order,
	selectedCustomer,
	selectedTable,
	isPaid,
}: {
	order: Order;
	selectedCustomer: NamedValue;
	selectedTable: RestaurantTable | null | undefined;
	isPaid: boolean;
}) {
	return (
		<View style={styles.orderInfoRow}>
			<View style={styles.orderInfoLeft}>
				<View style={styles.orderInfoIcon}>
					<MaterialCommunityIcons name="receipt" size={14} color="#fff" />
				</View>
				<View>
					<Text style={styles.orderInfoText}>ORDER #{order.order_number}</Text>
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
					{isPaid ? "PAID" : (order.paymentStatus ?? "UNPAID")}
				</Text>
			</View>
		</View>
	);
}

export function BillingEmptyState() {
	return (
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
	);
}

export function BillingSectionHeader({ section }: { section: any }) {
	if (!section.title) return null;

	return (
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
					<Text style={[styles.sectionTagText, { color: theme.colors.success }]}>Editable</Text>
				</View>
			)}
		</View>
	);
}

export function BillingListHeader({
	cartLength,
	onClearAll,
}: {
	cartLength: number;
	onClearAll: () => void;
}) {
	return (
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
					{cartLength} {cartLength === 1 ? "item" : "items"} in cart
				</Text>
			</View>
			<TouchableOpacity onPress={onClearAll}>
				<Text style={styles.clearText}>Clear all</Text>
			</TouchableOpacity>
		</View>
	);
}

export function BillingSummary({
	cartLength,
	subtotal,
	taxTotal,
	grandTotal,
}: {
	cartLength: number;
	subtotal: number;
	taxTotal: number;
	grandTotal: number;
}) {
	return (
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
					Item Total ({cartLength} {cartLength === 1 ? "item" : "items"})
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
	);
}

export function BillingActions({
	isPaid,
	isBillingExisting,
	additionsCount,
	isCreatingOrder,
	onSendToKitchen,
	onPayment,
}: {
	isPaid: boolean;
	isBillingExisting: boolean;
	additionsCount: number;
	isCreatingOrder: boolean;
	onSendToKitchen: () => void;
	onPayment: () => void;
}) {
	const sendDisabled = isPaid || (isBillingExisting ? additionsCount === 0 : isCreatingOrder);
	const kitchenColor = sendDisabled ? theme.colors.textMuted : theme.colors.primary;
	const kitchenLabel = isPaid
		? "Order Paid"
		: isBillingExisting
			? additionsCount > 0
				? `Send to Kitchen (${additionsCount})`
				: "No New Items"
			: isCreatingOrder
				? "Sending..."
				: "Send to Kitchen";

	return (
		<View style={styles.actions}>
			<TouchableOpacity
				style={[styles.actionBtn, styles.kitchenBtn]}
				onPress={onSendToKitchen}
				disabled={sendDisabled}
				activeOpacity={0.85}
			>
				<MaterialCommunityIcons name="chef-hat" size={18} color={kitchenColor} />
				<Text style={styles.kitchenBtnText}>{kitchenLabel}</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.actionBtn, styles.payBtn, isPaid && styles.payBtnDisabled]}
				onPress={onPayment}
				disabled={isPaid}
				activeOpacity={0.85}
			>
				<MaterialCommunityIcons
					name={isPaid ? "check-circle-outline" : "cash-register"}
					size={18}
					color="#fff"
				/>
				<Text style={styles.payBtnText}>{isPaid ? "Invoice Paid" : "Proceed to Pay"}</Text>
			</TouchableOpacity>
		</View>
	);
}
