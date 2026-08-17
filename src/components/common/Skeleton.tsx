import { useEffect } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// ── Shared shimmer driver ────────────────────────────────────
// One Animated.Value drives every Skeleton on screen, so all
// placeholders sweep in sync (looks intentional, runs cheap).
const shimmerProgress = new Animated.Value(0);
let shimmerStarted = false;

function startShimmer() {
	if (shimmerStarted) return;
	shimmerStarted = true;
	Animated.loop(
		Animated.timing(shimmerProgress, {
			toValue: 1,
			duration: 1500,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		}),
	).start();
}

interface Props {
	width?: number | string;
	height?: number;
	borderRadius?: number;
	style?: any;
}

export default function Skeleton({
	width = "100%",
	height = 20,
	borderRadius = 8,
	style,
}: Props) {
	useEffect(startShimmer, []);

	const translateX = shimmerProgress.interpolate({
		inputRange: [0, 1],
		outputRange: [-320, 480],
	});

	return (
		<View
			style={[
				skeletonStyles.base,
				{ width, height, borderRadius },
				style,
			]}
		>
			<Animated.View
				style={[
					skeletonStyles.sweep,
					{ transform: [{ translateX }] },
				]}
			>
				<View style={skeletonStyles.bandStrong} />
				<View style={skeletonStyles.bandMid} />
				<View style={skeletonStyles.bandSoft} />
			</Animated.View>
		</View>
	);
}

const skeletonStyles = StyleSheet.create({
	base: {
		backgroundColor: "#ECEDF1",
		overflow: "hidden",
	},
	sweep: {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: 150,
		flexDirection: "row",
		transform: [{ skewX: "-18deg" }],
	},
	band: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		marginRight: 5,
	},
	bandStrong: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		marginRight: 5,
		opacity: 0.85,
	},
	bandMid: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		marginRight: 5,
		opacity: 0.45,
	},
	bandSoft: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		opacity: 0.22,
	},
});