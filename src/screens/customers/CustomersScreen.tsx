import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SkeletonCard from "../../components/common/SkeletonCard";
import { useCustomers } from "../../hooks/useCustomers";
import { theme } from "../../theme";
import type { Customer } from "../../types/customer";

// Generate consistent color per initial letter
const AVATAR_COLORS = [
	"#FFDDD2",
	"#D2F4FF",
	"#D2FFE8",
	"#F4D2FF",
	"#FFECD2",
	"#D2E4FF",
	"#FFD2D2",
	"#D2FFD8",
];
function avatarColor(name: string) {
	return AVATAR_COLORS[(name?.charCodeAt(0) ?? 65) % AVATAR_COLORS.length];
}
function avatarText(name: string) {
	return (name ?? "?").charAt(0).toUpperCase();
}

export default function CustomersScreen(): React.JSX.Element {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<any>();
	const [search, setSearch] = useState<string>("");
	const { data, isLoading, isError } = useCustomers(search);

	const customers: Customer[] =
		data?.pages.flatMap((p: any) => {
			const d = p.data as any;
			return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
		}) ?? [];

	const renderCustomer = useCallback(
		({ item }: { item: Customer }): React.JSX.Element => (
			<TouchableOpacity
				style={styles.card}
				onPress={() => navigation.navigate("CustomerForm", { customer: item })}
				activeOpacity={0.88}
			>
				<View
					style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}
				>
					<Text style={styles.avatarText}>{avatarText(item.name)}</Text>
				</View>

				<Text style={styles.cardName} numberOfLines={1}>
					{item.name}
				</Text>

				{item.phone ? (
					<View style={styles.metaRow}>
						<MaterialCommunityIcons
							name="phone-outline"
							size={11}
							color={theme.colors.textMuted}
						/>
						<Text style={styles.metaText} numberOfLines={1}>
							{item.phone}
						</Text>
					</View>
				) : (
					<Text style={styles.metaText}>No phone</Text>
				)}

				<View style={styles.editBadge}>
					<MaterialCommunityIcons
						name="pencil-outline"
						size={12}
						color={theme.colors.primary}
					/>
					<Text style={styles.editBadgeText}>Edit</Text>
				</View>
			</TouchableOpacity>
		),
		[navigation],
	);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.headerSub}>Manage</Text>
					<Text style={styles.headerTitle}>Customers</Text>
				</View>
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("CustomerForm", {})}
					activeOpacity={0.85}
				>
					<MaterialCommunityIcons name="plus" size={16} color="#fff" />
					<Text style={styles.addBtnText}>Add</Text>
				</TouchableOpacity>
			</View>

			{/* Search */}
			<View style={styles.searchRow}>
				<MaterialCommunityIcons
					name="magnify"
					size={18}
					color={theme.colors.textMuted}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Search by name or phone..."
					placeholderTextColor={theme.colors.textMuted}
					value={search}
					onChangeText={setSearch}
				/>
				{search.length > 0 && (
					<TouchableOpacity onPress={() => setSearch("")}>
						<MaterialCommunityIcons
							name="close-circle"
							size={16}
							color={theme.colors.textMuted}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* List */}
			{isError ? (
				<View style={styles.center}>
					<MaterialCommunityIcons
						name="wifi-off"
						size={40}
						color={theme.colors.textMuted}
					/>
					<Text style={styles.emptyTitle}>Failed to load</Text>
					<Text style={styles.emptySubtitle}>
						Check your connection and retry
					</Text>
				</View>
			) : isLoading ? (
				<FlatList
					data={[1, 2, 3, 4, 5, 6]}
					keyExtractor={(i) => String(i)}
					numColumns={2}
					columnWrapperStyle={styles.row}
					contentContainerStyle={styles.listContent}
					renderItem={() => <SkeletonCard />}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			) : (
				<FlatList
					data={customers}
					keyExtractor={(item: Customer): string => item.id}
					renderItem={renderCustomer}
					numColumns={2}
					columnWrapperStyle={styles.row}
					contentContainerStyle={
						customers.length === 0 ? styles.listEmpty : styles.listContent
					}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.center}>
							<MaterialCommunityIcons
								name="account-group-outline"
								size={52}
								color={theme.colors.textMuted}
							/>
							<Text style={styles.emptyTitle}>No customers yet</Text>
							<Text style={styles.emptySubtitle}>
								Tap Add to create your first customer
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
		paddingTop: 0,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 18,
		paddingVertical: 12,
		backgroundColor: "#fff",
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
		fontWeight: "900",
		color: theme.colors.textPrimary,
		marginTop: 1,
	},
	addBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: theme.colors.primary,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: theme.radius.full,
		...theme.shadow.lg,
	},
	addBtnText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
	statsBar: {
		flexDirection: "row",
		backgroundColor: "#fff",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
	},
	statValue: {
		fontSize: 20,
		fontWeight: "900",
		color: theme.colors.textPrimary,
	},
	statLabel: {
		fontSize: 10,
		fontWeight: "600",
		color: theme.colors.textMuted,
		marginTop: 2,
		textTransform: "uppercase",
		letterSpacing: 0.4,
	},
	statDivider: {
		width: 1,
		backgroundColor: theme.colors.borderLight,
		marginVertical: 4,
	},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#fff",
		marginHorizontal: 14,
		marginTop: 12,
		marginBottom: 4,
		borderRadius: theme.radius.md,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		paddingHorizontal: 12,
	},
	searchInput: {
		flex: 1,
		color: theme.colors.textPrimary,
		fontSize: 14,
		paddingVertical: 10,
	},
	row: {
		paddingHorizontal: 14,
		gap: 10,
	},
	listContent: {
		paddingTop: 10,
		paddingBottom: 24,
	},
	listEmpty: { flex: 1 },
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: theme.radius.xl,
		padding: 16,
		alignItems: "center",
		marginVertical: 5,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
	},
	avatarText: {
		fontSize: 22,
		fontWeight: "900",
		color: theme.colors.textPrimary,
	},
	cardName: {
		color: theme.colors.textPrimary,
		fontSize: 14,
		fontWeight: "700",
		textAlign: "center",
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
	},
	metaText: {
		color: theme.colors.textMuted,
		fontSize: 11,
		marginTop: 4,
	},
	editBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 10,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
		alignSelf: "stretch",
		justifyContent: "center",
	},
	editBadgeText: {
		color: theme.colors.primary,
		fontSize: 11,
		fontWeight: "700",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 60,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		paddingHorizontal: 32,
	},
});
