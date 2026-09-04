import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	SectionList,
	View,
} from "react-native";
import BillingItem from "../../components/billing/BillingItem";
import CustomerModal from "../../components/customer/CustomerModal";
import TableModal from "../../components/table/TableModal";
import { useCustomers } from "../../hooks/useCustomers";
import { useAddOrderItems, useCreateOrder, useUpdateItemStatus } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";
import { useCartStore } from "../../store/cartStore";
import { useCustomerStore } from "../../store/customerStore";
import { useFlowStore } from "../../store/flowStore";
import { useOrderStore } from "../../store/orderStore";
import { useTableStore } from "../../store/tableStore";
import type { CartItem } from "../../types/cart";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
import { extractList } from "../../utils/apiHelpers";
import { mapApiItemsToCart } from "../../utils/orderMappers";
import {
	BillingActions,
	BillingEmptyState,
	BillingListHeader,
	BillingOrderInfo,
	BillingSectionHeader,
	BillingSelectionRow,
	BillingSummary,
} from "./BillingPanel.components";
import { styles } from "./BillingPanel.styles";

interface Props {
	onRequestClose?: () => void;
}

export default function BillingPanel({ onRequestClose }: Props) {
	const navigation = useNavigation<any>();
	const cart = useCartStore((s) => s.cart);
	const clearCart = useCartStore((s) => s.clearCart);
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
	const updateItemStatusRemote = useUpdateItemStatus();

	const customers = useMemo(
		() =>
			customersData?.pages?.flatMap((p) => extractList(p.data)) ?? [],
		[customersData],
	);

	const tables: RestaurantTable[] = useMemo(
		() => extractList(tablesData?.data),
		[tablesData],
	);

	const existingOrder = useMemo(
		() => orders.find((o) => o.id === activeOrderId) ?? null,
		[orders, activeOrderId],
	);

	const setCart = useCartStore((s) => s.setCart);

	const [loadedForOrder, setLoadedForOrder] = useState<string | null>(null);
	const isLoadingCart = existingOrder && loadedForOrder !== existingOrder.id && cart.length === 0;
	useEffect(() => {
		if (!existingOrder) return;
		if (loadedForOrder === existingOrder.id) return;
		if (cart.length > 0) return;
		setCart(
			existingOrder.items.map((i) => ({
				...i,
				sentToKitchen: true,
			})),
		);
		setLoadedForOrder(existingOrder.id);
	}, [existingOrder, loadedForOrder, cart.length, setCart]);

	useEffect(() => {
		return () => {
			setLoadedForOrder(null);
		};
	}, []);

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

		
		const customersLoaded = customers.length > 0;
		const tablesLoaded = tables.length > 0;
		if (existingOrder.account_id && !customerFound && !customersLoaded) return;
		if (existingOrder.table_id && !tableFound && !tablesLoaded) return;

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
		clearCart();
		setActiveOrder(null);
		setActiveDraftId(null);
		setSelectedCustomer(null);
		setSelectedTable(null);
		setAutofilledFor(null);
		setLoadedForOrder(null);
	}, [
		clearCart,
		setActiveOrder,
		setActiveDraftId,
		setSelectedCustomer,
		setSelectedTable,
		setAutofilledFor,
		setLoadedForOrder,
	]);

	const handleSendToKitchen = async () => {
		if (cart.length === 0 || submittingRef.current) return;
		if (!selectedTable) {
			setTableModal(true);
			return;
		}
		submittingRef.current = true;
		if (existingOrder) {
			if (existingOrder.paymentStatus === "PAID") {
				submittingRef.current = false;
				return;
			}
			await handleEditSend(existingOrder);
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
					product_id: i.product_id ?? i.id,
					quantity: i.qty,
					price: i.price_per_unit,
					total: i.price_per_unit * i.qty,
				})),
			});

			const created = (res.data as any)?.data;
			const o = created?.data ?? created;

			// Use server-returned item IDs (real order-item UUIDs). If the
			// response includes items, map them directly so we never store
			// a product_id where an order-item UUID is required.
const newOrder: Order = {
			id: o?.id,
			order_number: o?.order_number,
			items:
				(o?.items ?? []).length > 0
					? mapApiItemsToCart(o.items, { status: "preparing", sentToKitchen: true, kotNo: 1 })
					: cart.map((i) => ({
							...i,
							status: "preparing" as const,
							sentToKitchen: true,
							kotNo: 1,
						})),
				total: grandTotal,
				tax_amount: taxTotal,
				status: "PREPARING",
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

			const serverItems: any[] = o?.items ?? [];
			if (serverItems.length > 0) {
				const store = useOrderStore.getState();
				for (const item of serverItems) {
					store.setItemStatusOverride(item.id, "preparing");
					updateItemStatusRemote.mutate(
						{ item_id: item.id, status: "preparing" },
						{ onError: () => {} },
					);
				}
			}

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
	const handleEditSend = async (order: Order) => {
		const additionsCount = additions.length;
		if (additions.length === 0) return;
		const kotNo = Math.max(
			order.nextKotNo ?? 1,
			order.items.reduce((m, i) => Math.max(m, i.kotNo ?? 0), 0) + 1,
			(order.kots?.length ?? 0) + 1,
		);

		// Optimistic: add additions with a temporary id so the UI shows them
		// immediately. We replace every item in the order with the server's
		// canonical list once the POST resolves, before closing the panel.
		// This means the user can NEVER see or tap a fake id — the real UUIDs
		// are in place before OrderCard becomes interactive.
		const sentAdditions = additions.map((i, idx) => ({
			...i,
			id: `__tmp_${i.product_id ?? i.id}_${idx}`,
			status: "preparing" as const,
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

		// Optimistic local update
		updateOrder(order.id, {
			items: [...order.items, ...sentAdditions],
			total: order.total + deltaTotal,
			tax_amount: (order.tax_amount ?? 0) + deltaTax,
			nextKotNo: kotNo + 1,
			kots: [
				...(order.kots ?? []),
				{
					kotNo,
					items: sentAdditions.map(({ name, qty, price_per_unit, product_id, id }) => ({
						id: product_id ?? id,
						name,
						qty,
						price_per_unit,
					})),
					createdAt: new Date().toISOString(),
				},
			],
		});

		try {
			// mutateAsync — wait for server response so real item UUIDs are
			// stored before the panel closes and OrderCard becomes interactive.
			const res = await addOrderItems.mutateAsync({
				orderId: order.id,
				items: sentAdditions.map((i) => ({
					product_id: i.product_id ?? i.id,
					quantity: i.qty,
					price: i.price_per_unit,
					total: i.price_per_unit * i.qty,
				})),
			});

			// Replace the entire order's item list with the server's canonical
			// items (real order-item UUIDs). This is the single source of truth —
			// no fragile local ID-swap logic needed.
			const d = (res.data as any)?.data;
			const updatedOrder = d?.data ?? d;
			const serverItems: any[] = updatedOrder?.items ?? [];

			if (serverItems.length > 0) {
				const mapped = mapApiItemsToCart(serverItems, {
					status: "preparing",
					sentToKitchen: true,
				});
				useOrderStore.getState().updateOrder(order.id, {
					items: mapped,
				});

				// Set preparing status overrides + call API for new items
				const additionProductIds = new Set(
					sentAdditions.map((i) => i.product_id ?? i.id),
				);
				const newItems = serverItems.filter((si: any) =>
					additionProductIds.has(si.product_id),
				);
				for (const item of newItems) {
					useOrderStore.getState().setItemStatusOverride(item.id, "preparing");
					updateItemStatusRemote.mutate(
						{ item_id: item.id, status: "preparing" },
						{ onError: () => {} },
					);
				}
			}
		} catch (e) {
			// Roll back the optimistic local update
			updateOrder(order.id, {
				items: order.items,
				total: order.total,
				tax_amount: order.tax_amount,
				nextKotNo: order.nextKotNo,
				kots: order.kots,
			});
			const msg =
				(e as any)?.response?.data?.message ??
				(e as any)?.message ??
				"Could not add items to order. Please try again.";
			Alert.alert("Failed to send KOT", msg);
			return;
		}

		// Close panel only after real IDs are in place
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
			<BillingSectionHeader section={section} />,
		[],
	);

	const renderFooter = useCallback(
		() => (
			<BillingSummary
				cartLength={cart.length}
				subtotal={subtotal}
				taxTotal={taxTotal}
				grandTotal={grandTotal}
			/>
		),
		[subtotal, taxTotal, grandTotal, cart.length],
	);

	const renderHeader = useCallback(
		() => (
			<BillingListHeader cartLength={cart.length} onClearAll={handleClearAll} />
		),
		[cart.length, handleClearAll],
	);

	const isPaid = existingOrder?.paymentStatus === "PAID";

	return (
		<View style={styles.container}>
			<BillingSelectionRow
				selectedCustomer={selectedCustomer}
				selectedTable={selectedTable}
				onCustomerPress={() => setCustomerModal(true)}
				onTablePress={() => setTableModal(true)}
			/>

			{existingOrder && (
				<BillingOrderInfo
					order={existingOrder}
					selectedCustomer={selectedCustomer}
					selectedTable={selectedTable}
					isPaid={isPaid}
				/>
			)}

			{cart.length === 0 ? (
				<BillingEmptyState />
			) : (
				<>
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

					<BillingActions
						isPaid={isPaid}
						isBillingExisting={isBillingExisting}
						additionsCount={additions.length}
						isCreatingOrder={createOrder.isPending}
						onSendToKitchen={handleSendToKitchen}
						onPayment={handlePayment}
					/>
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

