import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
	Alert,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
	generateInvoice,
	getInvoices,
	type Invoice,
} from "../../api/services/invoices";
import type { PaymentMode } from "../../api/services/paymentModes";
import { createPayment } from "../../api/services/payments";
import { updateTable } from "../../api/services/tables";
import BillingKeypad from "../../components/billing/BillingKeypad";
import { useCreateOrder } from "../../hooks/useOrders";
import { usePaymentModes } from "../../hooks/usePaymentModes";
import { useCartStore } from "../../store/cartStore";
import { useOrderStore } from "../../store/orderStore";
import { theme } from "../../theme";
import type { RootNavigationProp, RootRouteProp } from "../../types/navigation";
import type { ApiOrder, ApiOrderItem, PaymentStatus } from "../../types/order";
import {
	extractList,
	getErrorMessage,
	unwrapApiData,
} from "../../utils/apiHelpers";
import { mapApiItemsToCart } from "../../utils/orderMappers";
import {
	type PaymentReceiptData,
	ProceedContextChips,
	ProceedReceiptView,
} from "./ProceedPaymentScreen.components";
import { styles } from "./ProceedPaymentScreen.styles";

export default function ProceedPaymentScreen() {
	const insets = useSafeAreaInsets();
	const route = useRoute<RootRouteProp<"ProceedPayment">>();
	const navigation = useNavigation<RootNavigationProp>();
	const cart = useCartStore((s) => s.cart);
	const clearCart = useCartStore((s) => s.clearCart);
	const getTotals = useCartStore((s) => s.getTotals);
	const activeOrderId = useOrderStore((s) => s.activeOrderId);
	const orders = useOrderStore((s) => s.orders);
	const addOrder = useOrderStore((s) => s.addOrder);
	const updateOrder = useOrderStore((s) => s.updateOrder);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
	const createOrder = useCreateOrder();

	const customer = route.params?.customer;
	const table = route.params?.table;
	const existingOrder = orders.find((o) => o.id === activeOrderId);
	const resolvedCustomerName = customer?.name || existingOrder?.customer_name;
	const resolvedTableName = table?.name || existingOrder?.table_name;
	const hasCustomer = Boolean(customer || existingOrder?.customer_name);
	const hasTable = Boolean(table || existingOrder?.table_name);
	const { subtotal, taxTotal, grandTotal } = getTotals(
		existingOrder?.tax_amount ?? 0,
	);

	const [paidAmount, setPaidAmount] = useState("");
	const discount = "0";
	const alreadyPaid = "0";
	const [showReceipt, setShowReceipt] = useState(false);
	const [result, setResult] = useState<PaymentReceiptData | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { paymentModes, isLoading: isLoadingModes } = usePaymentModes();
	const [selectedPaymentMode, setSelectedPaymentMode] =
		useState<PaymentMode | null>(null);
	const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);

	useEffect(() => {
		if (paymentModes.length > 0 && !selectedPaymentMode) {
			const cash = paymentModes.find((m) => m.name.toLowerCase() === "cash");
			setSelectedPaymentMode(cash ?? paymentModes[0]);
		}
	}, [paymentModes, selectedPaymentMode]);

	useEffect(() => {
		if (!activeOrderId) return;
		let mounted = true;
		getInvoices({ order_id: activeOrderId })
			.then((res) => {
				if (!mounted) return;
				const list = extractList<Invoice>(res.data);
				if (list.length > 0) setExistingInvoice(list[0]);
			})
			.catch((e) => console.warn("Invoice fetch on mount failed", e));
		return () => {
			mounted = false;
		};
	}, [activeOrderId]);

	const totalPayable =
		grandTotal - Number(discount || 0) - Number(alreadyPaid || 0);
	const amountPaid = Number(paidAmount || 0);
	const change = amountPaid - totalPayable;
	const canPay = amountPaid >= totalPayable && paidAmount.length > 0;

	const handleKeyPress = (key: string) =>
		setPaidAmount((prev) => {
			if (key === "." && (prev.includes(".") || prev.length === 0)) return prev;
			return prev + key;
		});
	const handleDelete = () => setPaidAmount((prev) => prev.slice(0, -1));
	const handleClear = () => setPaidAmount("");

	const handleCompleteOrder = async () => {
		if (!canPay || isSubmitting) return;
		setIsSubmitting(true);
		try {
			let orderId: string | null = activeOrderId;
			let orderNumber = activeOrderId ? "N/A" : "NEW";
			let createdItems: ApiOrderItem[] = [];

			// ② Create order first if this is a brand-new order (no Bill This Order)
			if (!orderId) {
				const res = await createOrder.mutateAsync({
					table_id: table?.id ?? null,
					account_id: customer?.id ?? null,
					total_amount: subtotal,
					tax_amount: taxTotal,
					discount_amount: Number(discount || 0),
					grand_total: grandTotal,
					items: cart.map((i) => ({
						product_id: i.id,
						quantity: i.qty,
						price: i.price_per_unit,
						total: i.price_per_unit * i.qty,
					})),
				});
				const o = unwrapApiData<ApiOrder>(res.data);

				orderId = o?.id ?? null;
				orderNumber = o?.order_number ?? "N/A";
				// Capture the server-created item ids (UUIDs) so the local copy
				// carries real item ids — not the cart's product ids — and status
				// updates PATCH the correct /orders/items/:id endpoint.
				createdItems = o?.items ?? [];
				// Persist the created order id immediately so a mid-flow retry
				// (e.g. invoice/payment network error) reuses this order instead
				// of creating a duplicate order + invoice.
				if (orderId) setActiveOrder(orderId);
			} else {
				const existing = orders.find((o) => o.id === orderId);
				if (existing?.order_number) orderNumber = existing.order_number;
			}

			if (!orderId) {
				Alert.alert(
					"Payment failed",
					"Order could not be created. Check the console error.",
				);
				return;
			}

			// ④ Use fetched invoice or create invoice for the order
			let invoiceId = existingInvoice?.id;
			let invoiceNumber = existingInvoice?.invoice_number ?? orderNumber;

			if (!invoiceId) {
				const invoiceRes = await generateInvoice(orderId);
				const invoice = unwrapApiData<Invoice>(invoiceRes.data);
				invoiceId = invoice?.id;
				invoiceNumber = invoice?.invoice_number ?? orderNumber;
			}

			if (!invoiceId) {
				Alert.alert(
					"Payment failed",
					"Invoice was not created. Check the console error.",
				);
				return;
			}

			// ⑤ Create payment linked to the invoice with selected payment mode
			const totalPaid = amountPaid + Number(alreadyPaid || 0);
			const payable = grandTotal - Number(discount || 0);
			const balance = Math.max(payable - totalPaid, 0);
			const paymentRes = await createPayment({
				invoice_id: invoiceId,
				paid_amount: totalPaid,
				change_amount: Math.max(change, 0),
				payment_method: selectedPaymentMode?.name.toLowerCase() ?? "cash",
				payment_mode_id: selectedPaymentMode?.id,
			});

			if (paymentRes.data && !paymentRes.data.success) {
				throw new Error(paymentRes.data.message || "Payment creation failed");
			}

			// ③ Update local Zustand state immediately after payment succeeds —
			// BEFORE updateTable so the UI reflects PAID even if table free fails.
			const paidStatus: PaymentStatus =
				totalPaid >= payable ? "PAID" : "PARTIALLY_PAID";
			if (activeOrderId) {
				updateOrder(activeOrderId, {
					paymentStatus: paidStatus,
					invoice: true,
					invoice_number: invoiceNumber,
					amountPaid: totalPaid,
					balance,
				});
			} else {
				addOrder({
					id: orderId,
					order_number: orderNumber,
					items:
						createdItems.length > 0
							? mapApiItemsToCart(createdItems, { kotNo: 1 }).map((i) => ({
									...i,
									status: "served" as const,
								}))
							: cart.map((i) => ({
									...i,
									status: "served" as const,
									sentToKitchen: true,
									kotNo: 1,
								})),
					total: grandTotal,
					tax_amount: taxTotal,
					status: "COMPLETED",
					paymentStatus: paidStatus,
					invoice: true,
					invoice_number: invoiceNumber,
					amountPaid: totalPaid,
					balance,
					table_id: table?.id ?? null,
					account_id: customer?.id ?? null,
					table_name: table?.name,
					customer_name: customer?.name,
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
				});
			}

			// ⑥ Free the table — best-effort, failure doesn't affect payment
			if (table?.id) {
				try {
					await updateTable(table.id, { status: "available" });
				} catch (e) {
					console.warn("Failed to free table", e);
				}
			}

			// change can't be negative on a completed payment (canPay guards it)
			const safeChange = Math.max(change, 0);

			setResult({
				orderNumber,
				invoiceNumber,
				items: cart,
				subtotal,
				taxTotal,
				discount: Number(discount || 0),
				grandTotal,
				amountPaid: totalPaid,
				change: safeChange,
			});
			setShowReceipt(true);
			clearCart();
			setActiveOrder(null);
		} catch (e) {
			console.error("Payment failed", e);
			const msg = getErrorMessage(e, "Payment failed. Try again.");

			Alert.alert("Payment failed", msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ── Receipt view ──────────────────────────────────────────
	if (showReceipt && result) {
		return (
			<ProceedReceiptView
				topInset={insets.top}
				result={result}
				onDone={() =>
					navigation.reset({
						index: 0,
						routes: [{ name: "Main", params: { screen: "Counter" } }],
					})
				}
			/>
		);
	}

	// ── Payment view ──────────────────────────────────────────
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
				<Text style={styles.headerTitle}>Payment</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				style={styles.scrollArea}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + 16 },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				bounces={true}
			>
				{/* Top bar: Left: Customer & Table stacked; Right: Payment Mode */}
				<ProceedContextChips
					customerName={resolvedCustomerName}
					hasCustomer={hasCustomer}
					tableName={resolvedTableName}
					hasTable={hasTable}
					paymentModes={paymentModes}
					selectedPaymentMode={selectedPaymentMode}
					onSelectPaymentMode={setSelectedPaymentMode}
					isLoadingModes={isLoadingModes}
				/>

				{/* Bill summary card */}
				<View style={styles.summaryCard}>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Subtotal</Text>
						<Text style={styles.summaryValue}>
							₹{subtotal.toLocaleString("en-IN")}
						</Text>
					</View>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Taxes & Charges</Text>
						<Text style={styles.summaryValue}>
							₹{taxTotal.toLocaleString("en-IN")}
						</Text>
					</View>
					{Number(discount) > 0 && (
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Discount</Text>
							<Text
								style={[styles.summaryValue, { color: theme.colors.success }]}
							>
								− ₹{Number(discount).toLocaleString("en-IN")}
							</Text>
						</View>
					)}
					<View style={styles.totalDivider} />
					<View style={styles.summaryRow}>
						<Text style={styles.totalLabel}>Total Payable</Text>
						<Text style={styles.totalValue}>
							₹{totalPayable.toLocaleString("en-IN")}
						</Text>
					</View>
				</View>

				{/* Entered amount display */}
				<View style={styles.amountDisplay}>
					<Text style={styles.amountLabel}>
						{selectedPaymentMode?.name ?? "Cash"} Received
					</Text>
					<Text
						style={[
							styles.amountValue,
							!paidAmount && styles.amountPlaceholder,
						]}
					>
						₹ {paidAmount || "0"}
					</Text>
					{paidAmount.length > 0 && (
						<View
							style={[
								styles.changeBadge,
								{
									backgroundColor:
										change >= 0
											? theme.colors.successLight
											: theme.colors.dangerLight,
								},
							]}
						>
							<Text
								style={[
									styles.changeText,
									{
										color:
											change >= 0 ? theme.colors.success : theme.colors.danger,
									},
								]}
							>
								{change >= 0
									? `Change: ₹${change.toLocaleString("en-IN")}`
									: `Short by ₹${Math.abs(change).toLocaleString("en-IN")}`}
							</Text>
						</View>
					)}
				</View>

				{/* Keypad */}
				<View style={styles.keypadWrapper}>
					<BillingKeypad
						onKeyPress={handleKeyPress}
						onDelete={handleDelete}
						onClear={handleClear}
					/>
				</View>

				{/* CTA */}
				<TouchableOpacity
					style={[styles.completeBtn, !canPay && styles.completeBtnDisabled]}
					onPress={handleCompleteOrder}
					disabled={!canPay || isSubmitting}
					activeOpacity={0.85}
				>
					<MaterialCommunityIcons
						name={canPay ? "check-circle-outline" : "cash"}
						size={20}
						color="#fff"
					/>
					<Text style={styles.completeBtnText}>
						{isSubmitting
							? "Processing..."
							: !paidAmount
								? "Enter amount to pay"
								: !canPay
									? `Need ₹${(totalPayable - amountPaid).toLocaleString("en-IN")} more`
									: "Complete Payment"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}
