import { StyleSheet, View } from "react-native";
import { theme } from "../../theme";
import Skeleton from "./Skeleton";

export default function SkeletonCard() {
	return (
		<View style={styles.card}>
			<Skeleton
				width={44}
				height={44}
				borderRadius={22}
				style={styles.skeletonTop}
			/>
			<Skeleton
				width="72%"
				height={14}
				borderRadius={7}
				style={styles.skeletonMid}
			/>
			<Skeleton width="45%" height={13} borderRadius={7} />
			<Skeleton
				width="30%"
				height={22}
				borderRadius={11}
				style={styles.skeletonChip}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.surface,
		borderRadius: 16,
		padding: 16,
		margin: 6,
		width: "46%",
		alignItems: "center",
		borderWidth: 1,
		borderColor: theme.colors.border,
		...theme.shadow.sm,
	},
	skeletonTop: {
		marginBottom: 10,
	},
	skeletonMid: {
		marginBottom: 8,
	},
	skeletonChip: {
		marginTop: 10,
	},
});