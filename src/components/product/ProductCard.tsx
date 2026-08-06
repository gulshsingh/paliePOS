import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { Product } from "../../types/product";

interface Props {
	product: Product;
	qty: number;
	onPress: (product: Product) => void;
	onIncrease: (product: Product) => void;
	onDecrease: (product: Product) => void;
}

const EMOJIS = [
	"🍕",
	"🍔",
	"🥤",
	"🥗",
	"🍜",
	"🍣",
	"🥩",
	"🍰",
	"🥐",
	"🧁",
	"☕",
	"🍦",
	"🍩",
	"🌮",
	"🥪",
	"🍝",
	"🍛",
	"🥟",
	"🧆",
	"🥨",
];

// Soft background colors for the emoji tile
const TILE_COLORS = [
	"#FFF3E8",
	"#FFF0F0",
	"#F0FFF4",
	"#F0F4FF",
	"#FFFBF0",
	"#F5F0FF",
	"#F0FAFF",
	"#FFF0F8",
];

function ProductCard({ product, qty, onPress, onIncrease, onDecrease }: Props) {
	const emoji = EMOJIS[product.name.length % EMOJIS.length];
	const tileBg = TILE_COLORS[product.name.length % TILE_COLORS.length];

	return (
		<TouchableOpacity
			activeOpacity={0.88}
			style={styles.card}
			onPress={() => onPress(product)}
		>
			{/* Emoji tile */}
			<View style={[styles.emojiTile, { backgroundColor: tileBg }]}>
				<Text style={styles.emoji}>{emoji}</Text>
			</View>

			{/* Info */}
			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={2}>
					{product.name}
				</Text>
				<Text style={styles.price}>
					₹{Number(product.price_per_unit).toLocaleString()}
				</Text>
			</View>

			{/* Add / qty stepper */}
			{qty > 0 ? (
				<View style={styles.stepper}>
					<TouchableOpacity
						style={styles.stepperBtn}
						onPress={() => onDecrease(product)}
					>
						<MaterialCommunityIcons name="minus" size={16} color="#fff" />
					</TouchableOpacity>
					<Text style={styles.qtyText}>{qty}</Text>
					<TouchableOpacity
						style={styles.stepperBtn}
						onPress={() => onIncrease(product)}
					>
						<MaterialCommunityIcons name="plus" size={16} color="#fff" />
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.addBtn}>
					<MaterialCommunityIcons name="plus" size={18} color="#fff" />
				</View>
			)}
		</TouchableOpacity>
	);
}

export default memo(ProductCard);

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		margin: 5,
		width: "46.5%",
		overflow: "hidden",
		...theme.shadow.sm,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
	},
	emojiTile: {
		height: 90,
		justifyContent: "center",
		alignItems: "center",
	},
	emoji: {
		fontSize: 44,
	},
	info: {
		paddingHorizontal: 10,
		paddingTop: 8,
		paddingBottom: 10,
	},
	name: {
		color: theme.colors.textPrimary,
		fontSize: 13,
		fontWeight: "700",
		lineHeight: 18,
		marginBottom: 4,
	},
	price: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: "800",
	},
	addBtn: {
		position: "absolute",
		bottom: 10,
		right: 10,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
		...theme.shadow.sm,
	},
	stepper: {
		position: "absolute",
		bottom: 8,
		right: 8,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 4,
		...theme.shadow.sm,
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
		minWidth: 24,
		textAlign: "center",
	},
});
