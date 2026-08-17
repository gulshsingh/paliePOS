import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";

interface Props {
	orderNumber: string;
	invoiceNumber?: string;
	items: CartItem[];
	subtotal: number;
	taxTotal: number;
	discount: number;
	grandTotal: number;
	amountPaid: number;
	change: number;
}

// Merge duplicate lines (e.g. Roti x2 + Roti x1 from different KOTs) into a
// single clean bill line keyed by product_id.
function mergeLines(items: CartItem[]): CartItem[] {
	const map = new Map<string, CartItem>();
	for (const item of items) {
		const key = item.product_id ?? item.id;
		const existing = map.get(key);
		if (existing) {
			map.set(key, {
				...existing,
				qty: existing.qty + item.qty,
				price: existing.price_per_unit * (existing.qty + item.qty),
			});
		} else {
			map.set(key, { ...item });
		}
	}
	return [...map.values()];
}

export default function Receipt({
	orderNumber,
	invoiceNumber,
	items,
	subtotal,
	taxTotal,
	discount,
	grandTotal,
	amountPaid,
	change,
}: Props) {
	const merged = mergeLines(items);

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>PALIE POS</Text>
				<Text style={styles.subtitle}>Receipt</Text>
				<Text style={styles.orderNumber}>Order #{orderNumber}</Text>
				{invoiceNumber && (
					<Text style={styles.invoiceNumber}>Invoice #{invoiceNumber}</Text>
				)}
			</View>

			<View style={styles.divider} />

			{merged.map((item) => (
				<View key={item.id} style={styles.itemRow}>
					<Text style={styles.itemName}>
						{item.name} × {item.qty}
					</Text>
					<Text style={styles.itemPrice}>
						₹ {(item.price_per_unit * item.qty).toLocaleString("en-IN")}
					</Text>
				</View>
			))}

			<View style={styles.divider} />

			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Subtotal</Text>
				<Text style={styles.totalValue}>₹ {subtotal.toLocaleString("en-IN")}</Text>
			</View>
			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Tax</Text>
				<Text style={styles.totalValue}>₹ {taxTotal.toLocaleString("en-IN")}</Text>
			</View>
			{discount > 0 && (
				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>Discount</Text>
					<Text style={[styles.totalValue, { color: theme.colors.success }]}>
						-₹ {discount.toLocaleString("en-IN")}
					</Text>
				</View>
			)}
			<View style={styles.grandTotalRow}>
				<Text style={styles.grandTotalLabel}>Grand Total</Text>
				<Text style={styles.grandTotalValue}>
					₹ {grandTotal.toLocaleString("en-IN")}
				</Text>
			</View>

			<View style={styles.divider} />

			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Amount Paid</Text>
				<Text style={styles.totalValue}>₹ {amountPaid.toLocaleString("en-IN")}</Text>
			</View>
			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Change</Text>
				<Text style={[styles.totalValue, { color: theme.colors.success }]}>
					₹ {change.toLocaleString("en-IN")}
				</Text>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Thank you for your patronage!</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		margin: 12,
	},
	header: {
		alignItems: "center",
		marginBottom: 8,
	},
	title: {
		color: "#1A2733",
		fontSize: 20,
		fontWeight: "800",
		letterSpacing: 2,
	},
	subtitle: {
		color: "#64748B",
		fontSize: 14,
		marginTop: 2,
	},
	orderNumber: {
		color: "#1A2733",
		fontSize: 16,
		fontWeight: "600",
		marginTop: 4,
	},
	invoiceNumber: {
		color: "#64748B",
		fontSize: 13,
		fontWeight: "500",
		marginTop: 2,
	},
	divider: {
		height: 1,
		backgroundColor: "#E2E8F0",
		marginVertical: 8,
	},
	itemRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	itemName: {
		color: "#1A2733",
		fontSize: 13,
		flex: 1,
	},
	itemPrice: {
		color: "#1A2733",
		fontSize: 13,
		fontWeight: "600",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	totalLabel: {
		color: "#64748B",
		fontSize: 13,
	},
	totalValue: {
		color: "#1A2733",
		fontSize: 13,
		fontWeight: "600",
	},
	grandTotalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 6,
		marginTop: 4,
	},
	grandTotalLabel: {
		color: "#1A2733",
		fontSize: 16,
		fontWeight: "700",
	},
	grandTotalValue: {
		color: "#E04556",
		fontSize: 16,
		fontWeight: "700",
	},
	footer: {
		alignItems: "center",
		marginTop: 16,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E2E8F0",
	},
	footerText: {
		color: "#64748B",
		fontSize: 12,
		fontStyle: "italic",
	},
});
