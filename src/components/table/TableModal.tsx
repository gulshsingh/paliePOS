import {
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../theme";
import type { RestaurantTable } from "../../types/table";

interface Props {
	visible: boolean;
	tables: RestaurantTable[];
	onSelect: (table: RestaurantTable) => void;
	onClose: () => void;
}

export default function TableModal({
	visible,
	tables,
	onSelect,
	onClose,
}: Props) {
	const available = tables.filter((t) => t.status === "available");
	const occupied = tables.filter((t) => t.status === "occupied");

	const renderTable = ({ item }: { item: RestaurantTable }) => {
		const isOccupied = item.status === "occupied";
		return (
			<TouchableOpacity
				style={[styles.card, isOccupied && styles.cardOccupied]}
				onPress={() => {
					if (!isOccupied) {
						onSelect(item);
						onClose();
					}
				}}
				disabled={isOccupied}
				activeOpacity={0.8}
			>
				<View
					style={[
						styles.iconWrap,
						{
							backgroundColor: isOccupied
								? theme.colors.dangerLight
								: theme.colors.successLight,
						},
					]}
				>
					<MaterialCommunityIcons
						name="table-furniture"
						size={22}
						color={isOccupied ? theme.colors.danger : theme.colors.success}
					/>
				</View>
				<Text
					style={[styles.tableName, isOccupied && styles.tableNameOccupied]}
					numberOfLines={1}
				>
					{item.name}
				</Text>
				<View style={styles.capacityRow}>
					<MaterialCommunityIcons
						name="account-outline"
						size={11}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.capacityText}>{item.capacity}</Text>
				</View>
				<View
					style={[
						styles.statusBadge,
						{
							backgroundColor: isOccupied
								? theme.colors.dangerLight
								: theme.colors.successLight,
						},
					]}
				>
					<Text
						style={[
							styles.statusText,
							{
								color: isOccupied ? theme.colors.danger : theme.colors.success,
							},
						]}
					>
						{isOccupied ? "Busy" : "Free"}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity style={styles.sheet} activeOpacity={1}>
					{/* Handle */}
					<View style={styles.handle} />

					{/* Header */}
					<View style={styles.header}>
						<View>
							<Text style={styles.title}>Select Table</Text>
							<Text style={styles.subtitle}>
								{available.length} free · {occupied.length} occupied
							</Text>
						</View>
						<TouchableOpacity style={styles.closeBtn} onPress={onClose}>
							<MaterialCommunityIcons
								name="close"
								size={18}
								color={theme.colors.textSecondary}
							/>
						</TouchableOpacity>
					</View>

					{/* Tables grid */}
					{tables.length === 0 ? (
						<View style={styles.empty}>
							<MaterialCommunityIcons
								name="table-furniture"
								size={40}
								color={theme.colors.textMuted}
							/>
							<Text style={styles.emptyText}>No tables found</Text>
						</View>
					) : (
						<FlatList
							data={tables}
							keyExtractor={(item) => item.id}
							numColumns={3}
							columnWrapperStyle={styles.grid}
							showsVerticalScrollIndicator={false}
							renderItem={renderTable}
						/>
					)}
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 14,
		paddingBottom: 32,
		maxHeight: "75%",
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: theme.colors.border,
		alignSelf: "center",
		marginTop: 10,
		marginBottom: 6,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	title: { fontSize: 17, fontWeight: "800", color: theme.colors.textPrimary },
	subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
	closeBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: theme.colors.surfaceSecondary,
		justifyContent: "center",
		alignItems: "center",
	},
	empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
	emptyText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: "600" },
	grid: { justifyContent: "space-between", marginBottom: 10 },
	card: {
		width: "31%",
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 12,
		alignItems: "center",
		gap: 6,
		borderWidth: 1.5,
		borderColor: `${theme.colors.successLight}AA`,
		...theme.shadow.sm,
	},
	cardOccupied: { borderColor: theme.colors.dangerLight, opacity: 0.6 },
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	tableName: {
		fontSize: 13,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		textAlign: "center",
	},
	tableNameOccupied: { color: theme.colors.textMuted },
	capacityRow: { flexDirection: "row", alignItems: "center", gap: 3 },
	capacityText: {
		fontSize: 11,
		color: theme.colors.textMuted,
		fontWeight: "600",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: theme.radius.full,
	},
	statusText: { fontSize: 10, fontWeight: "800" },
});
