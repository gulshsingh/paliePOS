import { useState } from "react";
import {
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FlowPanel from "../../components/flow/FlowPanel";
import { theme } from "../../theme";
import ProductsPanel from "../products/ProductsPanel";
import OrdersPanel from "./OrdersPanel";

type Tab = "orders" | "products" | "flow";

const TABS: { key: Tab; label: string; icon: string }[] = [
	{ key: "orders", label: "Orders", icon: "clipboard-list-outline" },
	{ key: "products", label: "Menu", icon: "food-outline" },
	{ key: "flow", label: "Flor", icon: "format-list-bulleted" },
];

export default function CounterScreen() {
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<Tab>("products");

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View style={styles.logoMark}>
						<MaterialCommunityIcons
							name="silverware-fork-knife"
							size={18}
							color="#fff"
						/>
					</View>
					<View>
						<Text style={styles.title}>PALIE</Text>
						<Text style={styles.subtitle}>Point of Sale</Text>
					</View>
				</View>
				<View style={styles.headerRight}>
					<View style={styles.liveBadge}>
						<View style={styles.liveDot} />
						<Text style={styles.liveText}>LIVE</Text>
					</View>
				</View>
			</View>

			{/* Tab Bar */}
			<View style={styles.tabBar}>
				{TABS.map((t) => {
					const isActive = activeTab === t.key;
					return (
						<TouchableOpacity
							key={t.key}
							style={[styles.tab, isActive && styles.activeTab]}
							onPress={() => setActiveTab(t.key)}
							activeOpacity={0.8}
						>
							<View style={styles.tabInner}>
								<MaterialCommunityIcons
									name={t.icon}
									size={18}
									color={
										isActive ? theme.colors.primary : theme.colors.textMuted
									}
								/>
								<Text
									style={[styles.tabText, isActive && styles.activeTabText]}
								>
									{t.label}
								</Text>
							</View>
							{isActive && <View style={styles.activeIndicator} />}
						</TouchableOpacity>
					);
				})}
			</View>

			<View style={styles.content}>
				{activeTab === "orders" && (
					<OrdersPanel onBillToCart={() => setActiveTab("products")} />
				)}
				{activeTab === "products" && <ProductsPanel />}
				{activeTab === "flow" && (
					<FlowPanel onResume={() => setActiveTab("products")} />
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		paddingTop: 0,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 10,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	logoMark: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 16,
		fontWeight: "900",
		color: theme.colors.textPrimary,
		letterSpacing: 1,
	},
	subtitle: {
		fontSize: 11,
		color: theme.colors.textMuted,
		fontWeight: "500",
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	liveBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		backgroundColor: theme.colors.successLight,
		borderRadius: theme.radius.full,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	liveDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: theme.colors.success,
	},
	liveText: {
		fontSize: 11,
		fontWeight: "800",
		color: theme.colors.success,
		letterSpacing: 0.5,
	},
	tabBar: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	tab: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 10,
		position: "relative",
	},
	activeTab: {},
	tabInner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	tabText: {
		color: theme.colors.textMuted,
		fontSize: 13,
		fontWeight: "600",
	},
	activeTabText: {
		color: theme.colors.primary,
		fontWeight: "800",
	},
	activeIndicator: {
		position: "absolute",
		bottom: 0,
		left: "15%",
		right: "15%",
		height: 3,
		borderTopLeftRadius: 3,
		borderTopRightRadius: 3,
		backgroundColor: theme.colors.primary,
	},
	content: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},
});
