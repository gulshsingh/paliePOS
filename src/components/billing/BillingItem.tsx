import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCartStore } from "../../store/cartStore";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";

interface Props {
	item: CartItem;
	locked?: boolean;
	/** 'veg' | 'non-veg' — when omitted the dot is shown in neutral grey */
	itemType?: "veg" | "non-veg";
}

function BillingItem({ item, locked, itemType }: Props) {
	const increaseQty = useCartStore((s) => s.increaseQty);
	const decreaseQty = useCartStore((s) => s.decreaseQty);

	const lineTotal = item.price_per_unit * item.qty;

	return (
		<View style={styles.container}>
			{/* Left: name + price */}
			<View style={styles.left}>
				<View
				style={[
					styles.vegIndicator,
					{
						borderColor:
							itemType === "veg"
								? theme.colors.success
								: itemType === "non-veg"
									? theme.colors.danger
									: theme.colors.border,
					},
				]}
			/>
				<View style={styles.textBlock}>
					<View style={styles.nameRow}>
						<Text style={styles.name} numberOfLines={1}>
							{item.name}
						</Text>
					</View>
					<Text style={styles.unitPrice}>
						₹{item.price_per_unit.toLocaleString("en-IN")} each
					</Text>
				</View>
			</View>

			{/* Right: qty stepper + total (same layout for locked items,
			    just non-editable so a kitchen-confirmed quantity stays put) */}
			<View style={styles.right}>
				<View style={styles.stepper}>
					<TouchableOpacity
						style={styles.stepBtn}
						onPress={() => {
							if (!locked) decreaseQty(item.id);
						}}
						disabled={locked}
						activeOpacity={0.7}
					>
						<MaterialCommunityIcons
							name={item.qty === 1 ? "trash-can-outline" : "minus"}
							size={14}
							color={
								locked
									? theme.colors.textMuted
									: item.qty === 1
										? theme.colors.danger
										: theme.colors.primary
							}
						/>
					</TouchableOpacity>
					<Text style={[styles.qty, locked && styles.qtyLocked]}>
						{item.qty}
					</Text>
					<TouchableOpacity
						style={styles.stepBtn}
						onPress={() => {
							if (!locked) increaseQty(item.id);
						}}
						disabled={locked}
						activeOpacity={0.7}
					>
						<MaterialCommunityIcons
							name="plus"
							size={14}
							color={
								locked ? theme.colors.textMuted : theme.colors.primary
							}
						/>
					</TouchableOpacity>
				</View>
				<Text style={styles.lineTotal}>₹{lineTotal.toLocaleString("en-IN")}</Text>
			</View>
		</View>
	);
}

export default memo(BillingItem);

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: theme.radius.md,
		paddingVertical: 12,
		paddingHorizontal: 14,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	left: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		gap: 10,
		marginRight: 12,
	},
	vegIndicator: {
		width: 14,
		height: 14,
		borderRadius: 2,
		borderWidth: 1.5,
		justifyContent: "center",
		alignItems: "center",
		flexShrink: 0,
	},
	textBlock: {
		flex: 1,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	name: {
		color: theme.colors.textPrimary,
		fontSize: 14,
		fontWeight: "700",
	},
	unitPrice: {
		color: theme.colors.textMuted,
		fontSize: 12,
		marginTop: 2,
	},
	right: {
		alignItems: "flex-end",
		gap: 6,
	},
	stepper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
		borderRadius: theme.radius.sm,
		overflow: "hidden",
	},
	stepBtn: {
		width: 30,
		height: 30,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.primaryLight,
	},
	qty: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "800",
		paddingHorizontal: 12,
	},
	qtyLocked: {
		color: theme.colors.textSecondary,
	},
	lineTotal: {
		color: theme.colors.textPrimary,
		fontSize: 14,
		fontWeight: "800",
	},
});