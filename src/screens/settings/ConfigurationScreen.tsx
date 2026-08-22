import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getCompany } from "../../api/services/companies";
import {
	useCategories,
	useCreateCategory,
	useDeleteCategory,
} from "../../hooks/useCategories";
import { useAuth } from "../../navigation/AppNavigator";
import { theme } from "../../theme";
import CustomersScreen from "../customers/CustomersScreen";
import ReportsScreen from "../reports/ReportsScreen";
import AllOrdersScreen from "./AllOrdersScreen";

type Section =
	| "categories"
	| "profile"
	| "customers"
	| "reports"
	| "orders";

const SECTIONS: Record<
	Section,
	{ label: string; icon: string; color: string; bg: string }
> = {
	categories: {
		label: "Categories",
		icon: "shape-outline",
		color: theme.colors.warning,
		bg: theme.colors.warningLight,
	},
	customers: {
		label: "Customers",
		icon: "account-group-outline",
		color: theme.colors.info,
		bg: theme.colors.infoLight,
	},
	reports: {
		label: "Reports",
		icon: "chart-bar-stacked",
		color: theme.colors.success,
		bg: theme.colors.successLight,
	},
	orders: {
		label: "All Orders",
		icon: "receipt-text-outline",
		color: theme.colors.info,
		bg: theme.colors.infoLight,
	},
	profile: {
		label: "Account",
		icon: "account-circle-outline",
		color: theme.colors.textMuted,
		bg: theme.colors.surfaceTertiary,
	},
};

const MENU_GROUPS: Section[][] = [
	["categories", "orders", "customers", "reports"],
	["profile"],
];

export default function ConfigurationScreen() {
	const insets = useSafeAreaInsets();
	// ── All useState first — never interleave with other hooks ──
	const [screen, setScreen] = useState<Section | "menu">("menu");
	const [newCat, setNewCat] = useState("");
	const [focused, setFocused] = useState<string | null>(null);

	// ── Other hooks after all state ──
	const { signOut } = useAuth();

	const { data: company } = useQuery({
		queryKey: ["company"],
		queryFn: () => getCompany(),
	});

	const { data: categoriesData } = useCategories();
	const categories = (categoriesData as any)?.data ?? [];
	const createCategory = useCreateCategory();
	const deleteCategory = useDeleteCategory();

	const handleAddCategory = () => {
		if (newCat.trim()) {
			createCategory.mutate({ name: newCat.trim() });
			setNewCat("");
		}
	};

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Logout", style: "destructive", onPress: signOut },
		]);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{screen === "menu" ? (
				<>
					{/* Header */}
					<View style={styles.header}>
						<View>
							<Text style={styles.headerSub}>Configuration</Text>
							<Text style={styles.headerTitle}>Settings</Text>
						</View>
						<View style={styles.headerIcon}>
							<MaterialCommunityIcons
								name="cog"
								size={20}
								color={theme.colors.primary}
							/>
						</View>
					</View>

					{/* Menu groups */}
					<ScrollView
						style={styles.scroll}
						contentContainerStyle={styles.menuContent}
						showsVerticalScrollIndicator={false}
					>
						{MENU_GROUPS.map((group) => (
							<View key={group.join("-")} style={styles.menuGroup}>
								{group.map((key) => {
									const s = SECTIONS[key];
									return (
										<TouchableOpacity
											key={key}
											style={[
												styles.menuRow,
												key !== group[group.length - 1] &&
													styles.menuRowDivider,
											]}
											onPress={() => setScreen(key)}
											activeOpacity={0.7}
										>
											<View
												style={[
													styles.menuIcon,
													{ backgroundColor: s.bg },
												]}
											>
												<MaterialCommunityIcons
													name={s.icon}
													size={18}
													color={s.color}
												/>
											</View>
											<Text style={styles.menuLabel}>{s.label}</Text>
											<MaterialCommunityIcons
												name="chevron-right"
												size={20}
												color={theme.colors.textMuted}
											/>
										</TouchableOpacity>
									);
								})}
							</View>
						))}

						{/* Logout */}
						<View style={styles.menuGroup}>
							<TouchableOpacity
								style={styles.menuRow}
								onPress={handleLogout}
								activeOpacity={0.7}
							>
								<View
									style={[
										styles.menuIcon,
										{ backgroundColor: theme.colors.dangerLight },
									]}
								>
									<MaterialCommunityIcons
										name="logout"
										size={18}
										color={theme.colors.danger}
									/>
								</View>
								<Text
									style={[
										styles.menuLabel,
										{ color: theme.colors.danger },
									]}
								>
									Logout
								</Text>
								<MaterialCommunityIcons
									name="chevron-right"
									size={20}
									color={theme.colors.textMuted}
								/>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</>
			) : (
				<>
					{/* Sub-header */}
					<View style={styles.subHeader}>
						<TouchableOpacity
							style={styles.backBtn}
							onPress={() => setScreen("menu")}
							activeOpacity={0.7}
						>
							<MaterialCommunityIcons
								name="arrow-left"
								size={22}
								color={theme.colors.textPrimary}
							/>
						</TouchableOpacity>
						<Text style={styles.subHeaderTitle}>
							{SECTIONS[screen].label}
						</Text>
						<View style={styles.backBtn} />
					</View>

					{screen === "customers" ? (
						<CustomersScreen embedded />
					) : screen === "reports" ? (
						<ReportsScreen embedded />
					) : screen === "orders" ? (
						<AllOrdersScreen embedded />
					) : (
						<ScrollView
							style={styles.scroll}
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
						>
				{/* ── Categories ── */}
				{screen === "categories" && (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<MaterialCommunityIcons
								name="shape-outline"
								size={16}
								color={theme.colors.primary}
							/>
							<Text style={styles.cardTitle}>Menu Categories</Text>
						</View>

						{/* Add row */}
						<View style={styles.addRow}>
							<View
								style={[
									styles.inputRow,
									styles.addInput,
									focused === "cat" && styles.inputFocused,
								]}
							>
								<MaterialCommunityIcons
									name="tag-outline"
									size={16}
									color={
										focused === "cat"
											? theme.colors.primary
											: theme.colors.textMuted
									}
								/>
								<TextInput
									style={styles.input}
									value={newCat}
									onChangeText={setNewCat}
									placeholder="New category name"
									placeholderTextColor={theme.colors.textMuted}
									onFocus={() => setFocused("cat")}
									onBlur={() => setFocused(null)}
									onSubmitEditing={handleAddCategory}
									returnKeyType="done"
								/>
							</View>
							<TouchableOpacity
								style={styles.addBtn}
								onPress={handleAddCategory}
								activeOpacity={0.85}
							>
								<MaterialCommunityIcons name="plus" size={18} color="#fff" />
							</TouchableOpacity>
						</View>

						{/* Category list */}
						{categories.length === 0 ? (
							<View style={styles.emptyCategories}>
								<MaterialCommunityIcons
									name="shape-plus"
									size={32}
									color={theme.colors.textMuted}
								/>
								<Text style={styles.emptyText}>No categories yet</Text>
							</View>
						) : (
							categories.map((c: any, idx: number) => (
								<View
									key={c.id}
									style={[
										styles.categoryRow,
										idx === categories.length - 1 && styles.categoryRowLast,
									]}
								>
									<View style={styles.categoryLeft}>
										<View style={styles.catDot} />
										<Text style={styles.categoryName}>{c.name}</Text>
									</View>
									<TouchableOpacity
										style={styles.deleteBtn}
										onPress={() => deleteCategory.mutate(c.id)}
									>
										<MaterialCommunityIcons
											name="trash-can-outline"
											size={16}
											color={theme.colors.danger}
										/>
									</TouchableOpacity>
								</View>
							))
						)}
					</View>
				)}

				{/* ── Profile ── */}
				{screen === "profile" && (
					<>
						{/* Profile card */}
						<View style={styles.card}>
							<View style={styles.profileAvatar}>
								<MaterialCommunityIcons
									name="store"
									size={32}
									color={theme.colors.primary}
								/>
							</View>
							<Text style={styles.profileName}>
								{company?.name ?? "Your Restaurant"}
							</Text>
							<Text style={styles.profileEmail}>
								{company?.email ?? "Not set"}
							</Text>
						</View>

						{/* Info rows */}
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<MaterialCommunityIcons
									name="information-outline"
									size={16}
									color={theme.colors.primary}
								/>
								<Text style={styles.cardTitle}>App Info</Text>
							</View>
							{[
								{ label: "App Version", value: "1.0.0" },
								{ label: "Platform", value: "PALIE POS" },
							].map((row) => (
								<View key={row.label} style={styles.infoRow}>
									<Text style={styles.infoLabel}>{row.label}</Text>
									<Text style={styles.infoValue}>{row.value}</Text>
								</View>
							))}
						</View>
					</>
				)}
			</ScrollView>
			)}
			</>
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
	headerIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	tabRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	tabPill: {
		flexShrink: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 9,
		paddingHorizontal: 14,
		borderRadius: theme.radius.full,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	tabPillActive: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	tabText: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textMuted,
	},
	tabTextActive: {
		color: theme.colors.primary,
	},
	subHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	subHeaderTitle: {
		flex: 1,
		textAlign: "center",
		fontSize: 18,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	menuContent: {
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 40,
		gap: 12,
	},
	menuGroup: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.xl,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		overflow: "hidden",
		...theme.shadow.sm,
	},
	menuRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 13,
		backgroundColor: "#fff",
	},
	menuRowDivider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: theme.colors.borderLight,
	},
	menuIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	menuLabel: {
		flex: 1,
		fontSize: 15,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	scroll: { flex: 1 },
	scrollContent: {
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 40,
		gap: 12,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.xl,
		padding: 18,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
	},
	cardTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	label: {		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textSecondary,
		marginBottom: 6,
		letterSpacing: 0.3,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.md,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		paddingHorizontal: 12,
		paddingVertical: 2,
	},
	inputFocused: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	input: {
		flex: 1,
		color: theme.colors.textPrimary,
		fontSize: 14,
		paddingVertical: 11,
	},
	addRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 14,
	},
	addInput: { flex: 1 },
	addBtn: {
		width: 48,
		height: 48,
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
		...theme.shadow.lg,
	},
	categoryRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	categoryLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	catDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary,
	},
	categoryName: {
		color: theme.colors.textPrimary,
		fontSize: 14,
		fontWeight: "600",
	},
	deleteBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: theme.colors.dangerLight,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyCategories: {
		alignItems: "center",
		paddingVertical: 24,
		gap: 6,
	},
	emptyText: {
		fontSize: 13,
		color: theme.colors.textMuted,
		fontWeight: "600",
	},
	profileAvatar: {
		width: 80,
		height: 80,
		borderRadius: 24,
		backgroundColor: theme.colors.primaryLight,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
		marginBottom: 12,
		borderWidth: 2,
		borderColor: `${theme.colors.primary}30`,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "900",
		color: theme.colors.textPrimary,
		textAlign: "center",
	},
	profileEmail: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		marginTop: 4,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	infoLabel: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		fontWeight: "600",
	},
	infoValue: {
		fontSize: 13,
		color: theme.colors.textPrimary,
		fontWeight: "700",
	},
	logoutBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		backgroundColor: theme.colors.dangerLight,
		paddingVertical: 15,
		borderRadius: theme.radius.md,
		borderWidth: 1.5,
		borderColor: `${theme.colors.danger}40`,
	},
	logoutText: {
		color: theme.colors.danger,
		fontSize: 15,
		fontWeight: "800",
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	categoryRowLast: {
		borderBottomWidth: 0,
	},
});
