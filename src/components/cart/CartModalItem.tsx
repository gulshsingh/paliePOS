import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";

interface Props {
	item: CartItem;
	onIncrease: (id: string) => void;
	onDecrease: (id: string) => void;
}

function CartModalItem({ item, onIncrease, onDecrease }: Props) {
	const lineTotal = item.price_per_unit * item.qty;

	return (
		<View style={styles.item}>
			<View style={styles.topRow}>
				<Text style={styles.itemName} numberOfLines={1}>
					{item.name}
				</Text>

				<Text style={styles.lineTotal}>₹{lineTotal.toLocaleString()}</Text>
			</View>

			<View style={styles.bottomRow}>
				<Text style={styles.itemPrice}>
					₹{Number(item.price_per_unit).toLocaleString()}
				</Text>

				<View style={styles.stepper}>
					<TouchableOpacity
						style={styles.stepperBtn}
						onPress={() => onDecrease(item.id)}
					>
						<MaterialCommunityIcons name="minus" size={15} color="#fff" />
					</TouchableOpacity>

					<Text style={styles.qtyText}>{item.qty}</Text>

					<TouchableOpacity
						style={styles.stepperBtn}
						onPress={() => onIncrease(item.id)}
					>
						<MaterialCommunityIcons name="plus" size={15} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

export default memo(CartModalItem);

const styles = StyleSheet.create({
	item: {
		height: 70,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	topRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	bottomRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 6,
	},
	itemName: {
		flex: 1,
		fontSize: 14,
		lineHeight: 18,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	itemPrice: {
		fontSize: 12,
		lineHeight: 16,
		color: theme.colors.primary,
		fontWeight: "700",
	},
	stepper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 4,
	},
	stepperBtn: {
		width: 26,
		height: 26,
		borderRadius: 13,
		justifyContent: "center",
		alignItems: "center",
	},
	qtyText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
		minWidth: 22,
		textAlign: "center",
	},
	lineTotal: {
		fontSize: 13,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
});
