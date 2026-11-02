import { StyleSheet } from "react-native";
import { theme } from "../../theme";

export const kpiStyles = StyleSheet.create({
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

export const emptyStyles = StyleSheet.create({
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

export const styles = StyleSheet.create({
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
