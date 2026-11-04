import { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	type StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { PaymentMode } from "../../api/services/paymentModes";
import { theme } from "../../theme";

interface Props {
	modes: PaymentMode[];
	selectedMode: PaymentMode | null;
	onSelectMode: (mode: PaymentMode) => void;
	isLoading?: boolean;
	compact?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
}

function getModeIcon(name: string): string {
	const lower = name.toLowerCase();
	if (lower.includes("cash")) return "cash";
	if (
		lower.includes("card") ||
		lower.includes("credit") ||
		lower.includes("debit")
	)
		return "credit-card-outline";
	if (
		lower.includes("upi") ||
		lower.includes("qr") ||
		lower.includes("paytm") ||
		lower.includes("gpay")
	)
		return "qrcode-scan";
	return "wallet-outline";
}

export default function PaymentModeDropdown({
	modes,
	selectedMode,
	onSelectMode,
	isLoading = false,
	compact = false,
	containerStyle,
}: Props) {
	const [modalVisible, setModalVisible] = useState(false);

	const currentName = selectedMode?.name ?? "Cash";
	const currentIcon = getModeIcon(currentName);

	return (
		<View
			style={[
				styles.container,
				compact && styles.compactContainer,
				containerStyle,
			]}
		>
			{!compact && <Text style={styles.label}>Payment Mode</Text>}
			<TouchableOpacity
				style={[styles.dropdownBtn, compact && styles.compactBtn]}
				onPress={() => setModalVisible(true)}
				activeOpacity={0.8}
				disabled={isLoading && modes.length === 0}
			>
				{compact ? (
					<>
						<View style={styles.compactBtnLeft}>
							<View style={styles.compactIconCircle}>
								<MaterialCommunityIcons
									name={currentIcon}
									size={13}
									color={theme.colors.primary}
								/>
							</View>
							<View style={styles.compactTextWrap}>
								<Text style={styles.compactLabel}>Payment Mode</Text>
								<Text style={styles.compactSelectedText} numberOfLines={1}>
									{currentName}
								</Text>
							</View>
						</View>
						{isLoading ? (
							<ActivityIndicator size="small" color={theme.colors.primary} />
						) : (
							<MaterialCommunityIcons
								name="chevron-down"
								size={15}
								color={theme.colors.primary}
							/>
						)}
					</>
				) : (
					<>
						<View style={styles.btnLeft}>
							<View style={styles.iconCircle}>
								<MaterialCommunityIcons
									name={currentIcon}
									size={16}
									color={theme.colors.primary}
								/>
							</View>
							<Text style={styles.selectedText}>{currentName}</Text>
						</View>
						{isLoading ? (
							<ActivityIndicator size="small" color={theme.colors.primary} />
						) : (
							<MaterialCommunityIcons
								name="chevron-down"
								size={18}
								color={theme.colors.textMuted}
							/>
						)}
					</>
				)}
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setModalVisible(false)}
				>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Payment Mode</Text>
							<TouchableOpacity
								onPress={() => setModalVisible(false)}
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							>
								<MaterialCommunityIcons
									name="close"
									size={20}
									color={theme.colors.textSecondary}
								/>
							</TouchableOpacity>
						</View>

						<View style={styles.modesList}>
							{modes.map((mode) => {
								const isSelected = selectedMode?.id === mode.id;
								const icon = getModeIcon(mode.name);
								return (
									<TouchableOpacity
										key={mode.id}
										style={[
											styles.modeOption,
											isSelected && styles.modeOptionActive,
										]}
										onPress={() => {
											onSelectMode(mode);
											setModalVisible(false);
										}}
										activeOpacity={0.7}
									>
										<View style={styles.optionLeft}>
											<View
												style={[
													styles.optionIconWrap,
													isSelected && styles.optionIconWrapActive,
												]}
											>
												<MaterialCommunityIcons
													name={icon}
													size={18}
													color={
														isSelected
															? theme.colors.primary
															: theme.colors.textSecondary
													}
												/>
											</View>
											<View>
												<Text
													style={[
														styles.modeName,
														isSelected && styles.modeNameActive,
													]}
												>
													{mode.name}
												</Text>
												{mode.notes ? (
													<Text style={styles.modeNotes}>{mode.notes}</Text>
												) : null}
											</View>
										</View>
										{isSelected && (
											<MaterialCommunityIcons
												name="check-circle"
												size={20}
												color={theme.colors.primary}
											/>
										)}
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 16,
		marginBottom: 10,
	},
	label: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textSecondary,
		marginBottom: 6,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	dropdownBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: theme.radius.md,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderWidth: 1.5,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	btnLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	iconCircle: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: theme.colors.primaryLight,
		alignItems: "center",
		justifyContent: "center",
	},
	selectedText: {
		fontSize: 15,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	modalCard: {
		width: "100%",
		maxWidth: 380,
		backgroundColor: "#fff",
		borderRadius: theme.radius.lg,
		padding: 18,
		...theme.shadow.lg,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
		marginBottom: 10,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	modesList: {
		gap: 8,
	},
	modeOption: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	modeOptionActive: {
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1,
		borderColor: theme.colors.primary,
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	optionIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	optionIconWrapActive: {
		backgroundColor: "#fff",
	},
	modeName: {
		fontSize: 14,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	modeNameActive: {
		color: theme.colors.primary,
		fontWeight: "800",
	},
	modeNotes: {
		fontSize: 11,
		color: theme.colors.textMuted,
		marginTop: 2,
	},
	compactContainer: {
		flex: 1,
		marginHorizontal: 0,
		marginBottom: 0,
		justifyContent: "center",
	},
	compactBtn: {
		flex: 1,
		backgroundColor: theme.colors.primaryLight,
		borderColor: theme.colors.primary,
		borderWidth: 1,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 8,
		paddingVertical: 4,
		minHeight: 56,
	},
	compactBtnLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		flex: 1,
	},
	compactIconCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	compactTextWrap: {
		flex: 1,
		justifyContent: "center",
	},
	compactLabel: {
		fontSize: 8,
		fontWeight: "800",
		color: theme.colors.primary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 1,
	},
	compactSelectedText: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
});
