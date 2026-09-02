import { StyleSheet } from "react-native";
import { theme } from "../../theme";

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},

	// Fixed top chips
	selectionRow: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	chip: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.full,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	chipActive: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	chipText: {
		flex: 1,
		color: theme.colors.textMuted,
		fontSize: 12,
		fontWeight: "600",
	},
	chipTextActive: {
		color: theme.colors.primary,
	},

	// Billing existing order info
	orderInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: theme.colors.primaryLight,
		borderBottomWidth: 1,
		borderBottomColor: `${theme.colors.primary}22`,
	},
	orderInfoLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	orderInfoIcon: {
		width: 28,
		height: 28,
		borderRadius: 9,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	orderInfoText: {
		color: theme.colors.textPrimary,
		fontSize: 13,
		fontWeight: "800",
		letterSpacing: 0.3,
	},
	orderInfoSub: {
		color: theme.colors.textSecondary,
		fontSize: 11,
		fontWeight: "600",
		marginTop: 1,
		maxWidth: 220,
	},
	payStatusChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: theme.radius.full,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	payStatusText: {
		fontSize: 11,
		fontWeight: "800",
	},

	// Empty state
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 60,
	},
	emptyIconWrap: {
		width: 90,
		height: 90,
		borderRadius: 45,
		backgroundColor: theme.colors.surfaceTertiary,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	emptyTitle: {
		color: theme.colors.textPrimary,
		fontSize: 18,
		fontWeight: "700",
	},
	emptySubtitle: {
		color: theme.colors.textMuted,
		fontSize: 13,
		marginTop: 6,
	},

	// FlatList
	listContent: {
		paddingHorizontal: 12,
		paddingBottom: 12,
	},

	// ListHeader
	itemsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 12,
		paddingBottom: 6,
	},
	itemsHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	itemsHeaderIcon: {
		width: 22,
		height: 22,
		borderRadius: 7,
		backgroundColor: theme.colors.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	itemsHeaderText: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.textSecondary,
	},
	clearText: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.danger,
	},

	// Section headers (Existing / New)
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 10,
		marginBottom: 6,
	},
	sectionHeaderText: {
		fontSize: 12,
		fontWeight: "800",
		color: theme.colors.textMuted,
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	sectionTag: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		backgroundColor: theme.colors.surfaceTertiary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	sectionTagNew: {
		backgroundColor: theme.colors.successLight,
	},
	sectionTagText: {
		fontSize: 10,
		fontWeight: "700",
		color: theme.colors.textMuted,
	},

	// Bill Summary (ListFooter)
	summary: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 16,
		marginTop: 10,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	summaryHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	summaryTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	summaryLabel: {
		fontSize: 13,
		color: theme.colors.textSecondary,
	},
	summaryValue: {
		fontSize: 13,
		color: theme.colors.textPrimary,
		fontWeight: "600",
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.borderLight,
		marginVertical: 10,
	},
	grandRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: theme.colors.primaryLight,
		borderRadius: theme.radius.md,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	grandLabel: {
		fontSize: 15,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	grandValue: {
		fontSize: 18,
		fontWeight: "900",
		color: theme.colors.primary,
	},

	// Fixed bottom buttons
	actions: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: theme.colors.surfaceSecondary,
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},
	actionBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: theme.radius.md,
	},
	kitchenBtn: {
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
	},
	kitchenBtnText: {
		color: theme.colors.primary,
		fontSize: 13,
		fontWeight: "800",
	},
	payBtn: {
		backgroundColor: theme.colors.primary,
		...theme.shadow.lg,
	},
	payBtnDisabled: {
		backgroundColor: theme.colors.success,
		shadowColor: "transparent",
		elevation: 0,
	},
	payBtnText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "800",
	},
});
