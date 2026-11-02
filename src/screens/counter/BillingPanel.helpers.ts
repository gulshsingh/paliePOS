import type { CartItem } from "../../types/cart";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
import { mapApiItemsToCart } from "../../utils/orderMappers";

export interface CartSection {
	key: string;
	title?: string;
	locked?: boolean;
	data: CartItem[];
}

export function buildCartSections(
	cart: CartItem[],
	isBillingExisting: boolean,
): CartSection[] {
	if (!isBillingExisting) return [{ key: "all", data: cart }];
	const existingItems = cart.filter((i) => i.sentToKitchen);
	const newItems = cart.filter((i) => !i.sentToKitchen);
	const sections: CartSection[] = [];
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
}

export function calculateBillingTotals(
	cart: CartItem[],
	additions: CartItem[],
	isBillingExisting: boolean,
	existingOrder: Order | null,
) {
	const sub = cart.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
	const existingTax = isBillingExisting
		? Number(existingOrder?.tax_amount) || 0
		: 0;
	const additionsTax = additions.reduce(
		(s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100,
		0,
	);
	const tax = existingTax + additionsTax;
	return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
}

export function buildNewOrderObject({
	serverOrder,
	cart,
	grandTotal,
	taxTotal,
	selectedTable,
	selectedCustomer,
}: {
	serverOrder: any;
	cart: CartItem[];
	grandTotal: number;
	taxTotal: number;
	selectedTable: RestaurantTable | null;
	selectedCustomer: any;
}): Order {
	return {
		id: serverOrder?.id,
		order_number: serverOrder?.order_number,
		items:
			(serverOrder?.items ?? []).length > 0
				? mapApiItemsToCart(serverOrder.items, {
						status: "preparing",
						sentToKitchen: true,
						kotNo: 1,
					})
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
}
