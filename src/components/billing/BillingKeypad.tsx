import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme";

interface Props {
	onKeyPress: (key: string) => void;
	onDelete: () => void;
	onClear: () => void;
}

// 3-column grid; last row = Clear + Backspace (null = spacer for symmetry).
const ROWS: (string | null)[][] = [
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
				{ROWS.map((row, ri) => (
					<View key={ri} style={styles.row}>
						{row.map((key, ki) =>
							key === null ? (
								<View key={ki} style={[styles.key, styles.spacer]} />
							) : (
								<TouchableOpacity
									key={ki}
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
											key === "C" && { color: theme.colors.danger },
											key === "⌫" && { color: theme.colors.warning },
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
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: 8,
		padding: 8,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	keys: {
		flex: 1,
		gap: 6,
	},
	row: {
		flex: 1,
		flexDirection: "row",
		gap: 6,
	},
	key: {
		flex: 1,
		backgroundColor: theme.colors.surfaceTertiary,
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	spacer: {
		backgroundColor: "transparent",
	},
	keyText: {
		color: theme.colors.textPrimary,
		fontSize: 20,
		fontWeight: "600",
	},
});