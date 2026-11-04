import type { CartItem } from "../types/cart";
import type { ApiOrderItem } from "../types/order";

/**
 * Maps server API order items (ApiOrderItem) to local CartItem lines using the
 * SERVER item id as `id`. Locally-created orders must NOT use the cart's
 * product id as the item id, otherwise status updates PATCH the wrong id
 * (product id instead of order-item UUID) and the backend rejects with 400.
 */
export function mapApiItemsToCart(
	apiItems: ApiOrderItem[],
	opts: {
		status?: string;
		sentToKitchen?: boolean;
		kotNo?: number;
	} = {},
): CartItem[] {
	return (apiItems ?? []).map((i: ApiOrderItem) => ({
		id: i.id,
		name: i.product?.name ?? i.product_name ?? "",
		price: Number(i.total),
		price_per_unit: Number(i.price),
		qty: Number(i.quantity),
		tax: 0,
		status: (opts.sentToKitchen && opts.status
			? opts.status
			: i.status ?? opts.status ?? "pending") as CartItem["status"],
		product_id: i.product_id,
		sentToKitchen: opts.sentToKitchen ?? true,
		kotNo: opts.kotNo ?? (Number(i.kot_no) || 1),
	}));
}
