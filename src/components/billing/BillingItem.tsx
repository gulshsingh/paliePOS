import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCartStore } from "../../store/cartStore";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";

interface Props {
	item: CartItem;
	locked?: boolean;
}

function BillingItem({ item, locked }: Props) {
	const increaseQty = useCartStore((s) => s.increaseQty);
	const decreaseQty = useCartStore((s) => s.decreaseQty);

	const lineTotal = item.price_per_unit * item.qty;

	return (
		<View style={[styles.container, locked && styles.containerLocked]}>
			{/* Left: name + price */}
			<View style={styles.left}>
				{locked ? (
					<View style={styles.lockIndicator}>
						<MaterialCommunityIcons
							name="check-bold"
							size={10}
							color={theme.colors.success}
						/>
					</View>
				) : (
					<View style={styles.vegIndicator} />
				)}
				<View style={styles.textBlock}>
					<View style={styles.nameRow}>
						<Text style={styles.name} numberOfLines={1}>
							{item.name}
						</Text>
						{locked && (
							<MaterialCommunityIcons
								name="lock-outline"
								size={12}
								color={theme.colors.textMuted}
							/>
						)}
					</View>
					<Text style={styles.unitPrice}>
						₹{item.price_per_unit.toLocaleString()} each
					</Text>
				</View>
			</View>

			{/* Right: qty stepper + total */}
			<View style={styles.right}>
				{locked ? (
					<View style={styles.lockedQty}>
						<Text style={styles.lockedQtyText}>×{item.qty}</Text>
					</View>
				) : (
					<View style={styles.stepper}>
						<TouchableOpacity
							style={styles.stepBtn}
							onPress={() => decreaseQty(item.id)}
							activeOpacity={0.7}
						>
							<MaterialCommunityIcons
								name={item.qty === 1 ? "trash-can-outline" : "minus"}
								size={14}
								color={
									item.qty === 1
										? theme.colors.danger
										: theme.colors.primary
								}
							/>
						</TouchableOpacity>
						<Text style={styles.qty}>{item.qty}</Text>
						<TouchableOpacity
							style={styles.stepBtn}
							onPress={() => increaseQty(item.id)}
							activeOpacity={0.7}
						>
							<MaterialCommunityIcons
								name="plus"
								size={14}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					</View>
				)}
				<Text style={styles.lineTotal}>₹{lineTotal.toLocaleString()}</Text>
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
	containerLocked: {
		backgroundColor: theme.colors.surfaceTertiary,
		borderColor: theme.colors.border,
		shadowColor: "transparent",
		elevation: 0,
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
		borderColor: theme.colors.success,
		justifyContent: "center",
		alignItems: "center",
		flexShrink: 0,
	},
	lockIndicator: {
		width: 14,
		height: 14,
		borderRadius: 2,
		backgroundColor: theme.colors.successLight,
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
	lockedQty: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	lockedQtyText: {
		color: theme.colors.textSecondary,
		fontSize: 13,
		fontWeight: "800",
	},
	lineTotal: {
		color: theme.colors.textPrimary,
		fontSize: 14,
		fontWeight: "800",
	},
});
