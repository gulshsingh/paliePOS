import { useState } from "react";
import {
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Skeleton from "../../components/common/Skeleton";
import {
	useDashboard,
	useLowStock,
	useStockSummary,
} from "../../hooks/useInventory";
import { theme } from "../../theme";

type ReportTab = "dashboard" | "stock" | "lowstock";

const TABS: { key: ReportTab; label: string; icon: string }[] = [
	{ key: "dashboard", label: "Dashboard", icon: "view-dashboard-outline" },
	{ key: "stock", label: "Stock", icon: "package-variant-closed" },
	{ key: "lowstock", label: "Low Stock", icon: "alert-circle-outline" },
];

export default function ReportsScreen({
	embedded = false,
}: {
	embedded?: boolean;
}) {
	const insets = useSafeAreaInsets();
	const [tab, setTab] = useState<ReportTab>("dashboard");
	const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
	const { data: stockData, isLoading: stockLoading } = useStockSummary();
	const { data: lowStockData, isLoading: lowStockLoading } = useLowStock();

	const dashboard = (dashboardData as any)?.data?.data?.data;
	const stock = (stockData as any)?.data?.data?.data;
	const lowStock = (lowStockData as any)?.data?.data?.data ?? [];

	return (
		<View style={[styles.container, !embedded && { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={[styles.header, embedded && styles.embeddedHeader]}>
				<View>
					{!embedded && <Text style={styles.headerSub}>Analytics</Text>}
					<Text style={[styles.headerTitle, embedded && styles.embeddedTitle]}>
						Reports
					</Text>
				</View>
				{!embedded && (
					<View style={styles.headerBadge}>
						<MaterialCommunityIcons
							name="chart-line"
							size={18}
							color={theme.colors.primary}
						/>
					</View>
				)}
			</View>

			{/* Tab pills */}
			<View style={styles.tabRow}>
				{TABS.map((t) => (
					<TouchableOpacity
						key={t.key}
						style={[styles.tabPill, tab === t.key && styles.tabPillActive]}
						onPress={() => setTab(t.key)}
						activeOpacity={0.8}
					>
						<MaterialCommunityIcons
							name={t.icon}
							size={14}
							color={
								tab === t.key ? theme.colors.primary : theme.colors.textMuted
							}
						/>
						<Text
							style={[styles.tabText, tab === t.key && styles.tabTextActive]}
						>
							{t.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* ── Dashboard ── */}
				{tab === "dashboard" && dashboardLoading && (
					<View style={styles.section}>
						<Skeleton
							width="45%"
							height={15}
							borderRadius={7}
							style={styles.skeletonTitle}
						/>
						<View style={styles.kpiRow}>
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
						</View>
						<View style={styles.kpiRow}>
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
						</View>
					</View>
				)}
				{tab === "dashboard" && dashboard && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Today's Performance</Text>
						<View style={styles.kpiRow}>
							<KPICard
								icon="receipt"
								iconBg={theme.colors.primaryLight}
								iconColor={theme.colors.primary}
								value={String(dashboard.total_orders_today ?? 0)}
								label="Orders Today"
							/>
							<KPICard
								icon="cash-multiple"
								iconBg={theme.colors.successLight}
								iconColor={theme.colors.success}
								value={`₹${(dashboard.total_revenue_today ?? 0).toLocaleString("en-IN")}`}
								label="Revenue Today"
							/>
						</View>
						<View style={styles.kpiRow}>
							<KPICard
								icon="account-group-outline"
								iconBg={theme.colors.infoLight}
								iconColor={theme.colors.info}
								value={String(dashboard.total_customers ?? 0)}
								label="Total Customers"
							/>
							<KPICard
								icon="food-variant"
								iconBg={theme.colors.warningLight}
								iconColor={theme.colors.warning}
								value={String(dashboard.total_products ?? 0)}
								label="Menu Items"
							/>
						</View>
					</View>
				)}
				{tab === "dashboard" && !dashboard && (
					<EmptyState
						icon="chart-bar"
						title="No data yet"
						sub="Sales data will appear here once you start taking orders."
					/>
				)}

				{/* ── Stock ── */}
				{tab === "stock" && stockLoading && (
					<View style={styles.section}>
						<Skeleton
							width="50%"
							height={15}
							borderRadius={7}
							style={styles.skeletonTitle}
						/>
						<View style={styles.kpiRow}>
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
						</View>
						<View style={styles.kpiRow}>
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
							<Skeleton height={118} borderRadius={18} style={styles.skeletonKpi} />
						</View>
					</View>
				)}
				{tab === "stock" && stock && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Inventory Overview</Text>
						<View style={styles.kpiRow}>
							<KPICard
								icon="package-variant-closed"
								iconBg={theme.colors.primaryLight}
								iconColor={theme.colors.primary}
								value={String(stock.total_products ?? 0)}
								label="Total Products"
							/>
							<KPICard
								icon="currency-inr"
								iconBg={theme.colors.successLight}
								iconColor={theme.colors.success}
								value={`₹${(stock.total_stock_value ?? 0).toLocaleString("en-IN")}`}
								label="Stock Value"
							/>
						</View>
						<View style={styles.kpiRow}>
							<KPICard
								icon="alert-outline"
								iconBg={theme.colors.warningLight}
								iconColor={theme.colors.warning}
								value={String(stock.low_stock_count ?? 0)}
								label="Low Stock"
							/>
							<KPICard
								icon="close-circle-outline"
								iconBg={theme.colors.dangerLight}
								iconColor={theme.colors.danger}
								value={String(stock.out_of_stock_count ?? 0)}
								label="Out of Stock"
							/>
						</View>
					</View>
				)}
				{tab === "stock" && !stock && (
					<EmptyState
						icon="package-variant-closed"
						title="No stock data"
						sub="Stock summary will appear here."
					/>
				)}

				{/* ── Low Stock ── */}
				{tab === "lowstock" && lowStockLoading && (
					<View style={styles.section}>
						<Skeleton
							width="55%"
							height={15}
							borderRadius={7}
							style={styles.skeletonTitle}
						/>
						{[1, 2, 3, 4].map((i) => (
							<View key={i} style={styles.lowStockRow}>
								<View style={styles.lowStockLeft}>
									<Skeleton width={12} height={12} borderRadius={6} />
									<View style={styles.skeletonLowRight}>
										<Skeleton width="65%" height={14} borderRadius={7} />
										<Skeleton
											width="45%"
											height={11}
											borderRadius={6}
											style={styles.skeletonLowQty}
										/>
									</View>
								</View>
								<Skeleton width={46} height={24} borderRadius={12} />
							</View>
						))}
					</View>
				)}
				{tab === "lowstock" && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							{lowStock.length} item{lowStock.length !== 1 ? "s" : ""} need
							attention
						</Text>
						{lowStock.length === 0 ? (
							<EmptyState
								icon="check-circle-outline"
								title="All stocked up!"
								sub="No items are running low right now."
							/>
						) : (
							lowStock.map((item: any) => (
								<View key={item.id} style={styles.lowStockRow}>
									<View style={styles.lowStockLeft}>
										<View style={styles.lowStockDot} />
										<View>
											<Text style={styles.lowStockName}>
												{item.product_name}
											</Text>
											<Text style={styles.lowStockQty}>
												{item.quantity} {item.unit} remaining · Min:{" "}
												{item.min_stock_level}
											</Text>
										</View>
									</View>
									<View style={styles.lowStockBadge}>
										<Text style={styles.lowStockBadgeText}>Low</Text>
									</View>
								</View>
							))
						)}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

// ── Sub-components ────────────────────────────────────────
function KPICard({
	icon,
	iconBg,
	iconColor,
	value,
	label,
}: {
	icon: string;
	iconBg: string;
	iconColor: string;
	value: string;
	label: string;
}) {
	return (
		<View style={kpiStyles.card}>
			<View style={[kpiStyles.iconWrap, { backgroundColor: iconBg }]}>
				<MaterialCommunityIcons name={icon} size={22} color={iconColor} />
			</View>
			<Text style={kpiStyles.value}>{value}</Text>
			<Text style={kpiStyles.label}>{label}</Text>
		</View>
	);
}

function EmptyState({
	icon,
	title,
	sub,
}: {
	icon: string;
	title: string;
	sub: string;
}) {
	return (
		<View style={emptyStyles.wrap}>
			<MaterialCommunityIcons
				name={icon}
				size={52}
				color={theme.colors.textMuted}
			/>
			<Text style={emptyStyles.title}>{title}</Text>
			<Text style={emptyStyles.sub}>{sub}</Text>
		</View>
	);
}

const kpiStyles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: theme.radius.xl,
		padding: 16,
		alignItems: "flex-start",
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	value: {
		fontSize: 22,
		fontWeight: "900",
		color: theme.colors.textPrimary,
	},
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: theme.colors.textMuted,
		marginTop: 3,
	},
});

const emptyStyles = StyleSheet.create({
	wrap: {
		alignItems: "center",
		paddingTop: 0,
		paddingHorizontal: 32,
		gap: 8,
	},
	title: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 8,
	},
	sub: {
		fontSize: 13,
		color: theme.colors.textMuted,
		textAlign: "center",
		lineHeight: 20,
	},
});

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
	embeddedHeader: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#fff",
	},
	embeddedTitle: {
		fontSize: 17,
		marginTop: 0,
	},
	headerBadge: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	tabRow: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	tabPill: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 9,
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
	scroll: { flex: 1 },
	scrollContent: {
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 32,
	},
	section: { gap: 10 },
	skeletonTitle: {
		marginBottom: 4,
	},
	skeletonKpi: {
		flex: 1,
	},
	skeletonLowRight: {
		flex: 1,
	},
	skeletonLowQty: {
		marginTop: 6,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "800",
		color: theme.colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	kpiRow: {
		flexDirection: "row",
		gap: 10,
	},
	lowStockRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 14,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		borderLeftWidth: 3,
		borderLeftColor: theme.colors.warning,
		...theme.shadow.sm,
	},
	lowStockLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	lowStockDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.warning,
	},
	lowStockName: {
		fontSize: 14,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	lowStockQty: {
		fontSize: 12,
		color: theme.colors.textMuted,
		marginTop: 2,
	},
	lowStockBadge: {
		backgroundColor: theme.colors.warningLight,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: theme.radius.full,
	},
	lowStockBadgeText: {
		fontSize: 11,
		fontWeight: "800",
		color: theme.colors.warning,
	},
});
