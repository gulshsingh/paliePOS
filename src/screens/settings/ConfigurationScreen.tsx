import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getCompany } from "../../api/services/companies";
import { styles } from "./ConfigurationScreen.styles";
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
