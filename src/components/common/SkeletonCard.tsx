import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

export default function SkeletonCard() {
	return (
		<View style={styles.card}>
			<Skeleton
				width={40}
				height={40}
				borderRadius={20}
				style={styles.skeletonTop}
			/>
			<Skeleton
				width="70%"
				height={14}
				borderRadius={6}
				style={styles.skeletonMid}
			/>
			<Skeleton width="40%" height={14} borderRadius={6} />
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		margin: 6,
		width: "46%",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	skeletonTop: {
		marginBottom: 8,
	},
	skeletonMid: {
		marginBottom: 4,
	},
});
