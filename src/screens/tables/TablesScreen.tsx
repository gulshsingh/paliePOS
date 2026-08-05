import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import {
	Dimensions,
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SkeletonCard from "../../components/common/SkeletonCard";
import { useTables } from "../../hooks/useTables";
import { theme } from "../../theme";
import type { RestaurantTable } from "../../types/table";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const STATUS_MAP: Record<
	string,
	{ label: string; icon: string; color: string; bg: string; border: string }
> = {
	available: {
		label: "Available",
		icon: "check-circle-outline",
		color: theme.colors.success,
		bg: theme.colors.successLight,
		border: theme.colors.success,
	},
	occupied: {
		label: "Occupied",
		icon: "silverware-fork-knife",
		color: theme.colors.primary,
		bg: theme.colors.primaryLight,
		border: theme.colors.primary,
	},
};

export default function TablesScreen() {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<any>();
	const { data, isLoading } = useTables();
	const tables: RestaurantTable[] = (data as any)?.data?.data?.data ?? [];
	const total = tables.length;
	const available = tables.filter((t) => t.status === "available").length;
	const occupied = tables.filter((t) => t.status === "occupied").length;

	const renderCard = useCallback(
		({ item }: { item: RestaurantTable }) => {
			const st = STATUS_MAP[item.status] ?? STATUS_MAP.available;
			return (
				<TouchableOpacity
					activeOpacity={0.9}
					style={[styles.card, { borderTopColor: st.border }]}
					onPress={() => navigation.navigate("TableForm", { table: item })}
				>
					{/* Table icon */}
					<View style={[styles.tableIconWrap, { backgroundColor: st.bg }]}>
						<MaterialCommunityIcons
							name="table-furniture"
							size={26}
							color={st.color}
						/>
					</View>

					<Text style={styles.tableName} numberOfLines={1}>
						{item.name}
					</Text>

					<View style={styles.capacityRow}>
						<MaterialCommunityIcons
							name="account-multiple-outline"
							size={13}
							color={theme.colors.textMuted}
						/>
						<Text style={styles.capacityText}>{item.capacity} seats</Text>
					</View>

					<View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
						<MaterialCommunityIcons name={st.icon} size={11} color={st.color} />
						<Text style={[styles.statusText, { color: st.color }]}>
							{st.label}
						</Text>
					</View>
				</TouchableOpacity>
			);
		},
		[navigation],
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor={theme.colors.surface}
			/>

			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.headerSub}>Floor plan</Text>
					<Text style={styles.headerTitle}>Tables</Text>
				</View>
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("TableForm", {})}
					activeOpacity={0.88}
				>
					<MaterialCommunityIcons
						name="plus"
						size={16}
						color={theme.colors.textInverse}
					/>
					<Text style={styles.addBtnText}>Add table</Text>
				</TouchableOpacity>
			</View>

			{/* Stats row */}
			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<Text style={styles.statNum}>{total}</Text>
					<Text style={styles.statLbl}>Total</Text>
				</View>
				<View
					style={[
						styles.statCard,
						{
							backgroundColor: theme.colors.successLight,
							borderColor: theme.colors.successLight,
						},
					]}
				>
					<Text style={[styles.statNum, { color: theme.colors.success }]}>
						{available}
					</Text>
					<Text style={[styles.statLbl, { color: theme.colors.success }]}>
						Free
					</Text>
				</View>
				<View
					style={[
						styles.statCard,
						{
							backgroundColor: theme.colors.primaryLight,
							borderColor: theme.colors.primaryLight,
						},
					]}
				>
					<Text style={[styles.statNum, { color: theme.colors.primary }]}>
						{occupied}
					</Text>
					<Text style={[styles.statLbl, { color: theme.colors.primary }]}>
						Busy
					</Text>
				</View>
			</View>

			{/* Grid */}
			{isLoading ? (
				<FlatList
					data={[1, 2, 3, 4]}
					keyExtractor={(i) => String(i)}
					numColumns={2}
					contentContainerStyle={styles.list}
					columnWrapperStyle={styles.row}
					renderItem={() => <SkeletonCard />}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			) : (
				<FlatList
					data={tables}
					keyExtractor={(item) => item.id}
					numColumns={2}
					contentContainerStyle={styles.list}
					columnWrapperStyle={styles.row}
					renderItem={renderCard}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.empty}>
							<View style={styles.emptyIconWrap}>
								<MaterialCommunityIcons
									name="table-furniture"
									size={44}
									color={theme.colors.textMuted}
								/>
							</View>
							<Text style={styles.emptyTitle}>No tables yet</Text>
							<Text style={styles.emptySub}>
								Add your first table to get started
							</Text>
						</View>
					}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 18,
		paddingVertical: 14,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	headerSub: {
		fontSize: 11,
		fontWeight: "600",
		color: theme.colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: theme.colors.textPrimary,
		marginTop: 2,
	},
	addBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: theme.radius.full,
		...theme.shadow.sm,
	},
	addBtnText: {
		color: theme.colors.textInverse,
		fontSize: 13,
		fontWeight: "600",
	},
	statsRow: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	statCard: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		borderRadius: theme.radius.lg,
		backgroundColor: theme.colors.surfaceSecondary,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
	},
	statNum: {
		fontSize: 19,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	statLbl: {
		fontSize: 10,
		fontWeight: "600",
		color: theme.colors.textMuted,
		marginTop: 2,
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
	list: {
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 24,
	},
	row: {
		justifyContent: "space-between",
		marginBottom: 10,
	},
	card: {
		width: CARD_WIDTH,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.xl,
		padding: 16,
		borderTopWidth: 3,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	tableIconWrap: {
		width: 50,
		height: 50,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
	},
	tableName: {
		fontSize: 16,
		fontWeight: "600",
		color: theme.colors.textPrimary,
	},
	capacityRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
		marginBottom: 8,
	},
	capacityText: {
		fontSize: 12,
		color: theme.colors.textMuted,
		fontWeight: "500",
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		alignSelf: "flex-start",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: theme.radius.full,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "600",
	},
	empty: {
		alignItems: "center",
		paddingTop: 60,
		gap: 8,
	},
	emptyIconWrap: {
		width: 84,
		height: 84,
		borderRadius: 42,
		backgroundColor: theme.colors.surfaceTertiary,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	emptySub: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
	},
});
