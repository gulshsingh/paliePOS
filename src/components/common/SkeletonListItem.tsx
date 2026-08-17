import { StyleSheet, View } from "react-native";
import { theme } from "../../theme";
import Skeleton from "./Skeleton";

export default function SkeletonListItem() {
	return (
		<View style={styles.item}>
			<View style={styles.content}>
				<Skeleton
					width="60%"
					height={16}
					borderRadius={8}
					style={styles.skeletonTop}
				/>
				<Skeleton width="32%" height={13} borderRadius={7} />
			</View>
			<Skeleton width={56} height={32} borderRadius={12} />
		</View>
	);
}

const styles = StyleSheet.create({
	item: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
		backgroundColor: theme.colors.surface,
	},
	content: {
		flex: 1,
	},
	skeletonTop: {
		marginBottom: 8,
	},
});