import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme";

interface Props {
	onKeyPress: (key: string) => void;
	onDelete: () => void;
	onClear: () => void;
}

const ROWS = [
	["1", "2", "3"],
	["4", "5", "6"],
	["7", "8", "9"],
	[".", "0", "00"],
	["C", "⌫", null],
];

export default function BillingKeypad({ onKeyPress, onDelete, onClear }: Props) {
	return (
		<View style={styles.container}>
			<View style={styles.keys}>
				{ROWS.map((row) => (
					<View key={`row-${row.filter(Boolean).join('-')}`} style={styles.row}>
						{row.map((key) =>
							key === null ? (
								<View key="spacer" style={[styles.key, styles.spacer]} />
							) : (
								<TouchableOpacity
									key={`btn-${key}`}
									style={styles.key}
									onPress={
										key === "C"
											? onClear
											: key === "⌫"
												? onDelete
												: () => onKeyPress(key)
									}
								>
									<Text
										style={[
											styles.keyText,
											(key === "C" || key === "⌫") && styles.actionKeyText,
										]}
									>
										{key}
									</Text>
								</TouchableOpacity>
							),
						)}
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.lg,
		padding: 8,
		...theme.shadow.sm,
	},
	keys: {
		gap: 6,
	},
	row: {
		flexDirection: "row",
		gap: 6,
	},
	key: {
		flex: 1,
		height: 52,
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	spacer: {
		backgroundColor: "transparent",
	},
	keyText: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.textPrimary,
	},
	actionKeyText: {
		color: theme.colors.primary,
		fontWeight: "700",
	},
});
