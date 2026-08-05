import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SkeletonCard from "../../components/common/SkeletonCard";
import ProductCard from "../../components/product/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { useCartStore } from "../../store/cartStore";
import { theme } from "../../theme";
import type { Product } from "../../types/product";

export default function ProductsPanel() {
	const [search, setSearch] = useState("");
	const { data, isLoading } = useProducts();
	const addToCart = useCartStore((s) => s.addToCart);
	const cart = useCartStore((s) => s.cart);

	const cartTotal = useMemo(
		() => cart.reduce((sum, i) => sum + i.price_per_unit * i.qty, 0),
		[cart],
	);
	const cartCount = useMemo(
		() => cart.reduce((sum, i) => sum + i.qty, 0),
		[cart],
	);

	const allProducts = useMemo(
		() =>
			data?.pages.flatMap((p) => {
				const d = p.data as any;
				return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
			}) ?? [],
		[data],
	);

	const filtered = useMemo(() => {
		if (search) {
			return allProducts.filter((p: Product) =>
				p.name.toLowerCase().includes(search.toLowerCase()),
			);
		}
		return allProducts;
	}, [allProducts, search]);

	const handleAdd = useCallback(
		(product: Product) => {
			addToCart(product);
		},
		[addToCart],
	);

	const renderItem = useCallback(
		({ item }: { item: Product }) => (
			<ProductCard product={item} onPress={handleAdd} />
		),
		[handleAdd],
	);

	return (
		<View style={styles.container}>
			{/* Search bar */}
			<View style={styles.searchWrap}>
				<View style={styles.searchBar}>
					<MaterialCommunityIcons
						name="magnify"
						size={20}
						color={theme.colors.textMuted}
						style={styles.searchIcon}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search dishes..."
						placeholderTextColor={theme.colors.textMuted}
						value={search}
						onChangeText={setSearch}
					/>
					{search.length > 0 && (
						<TouchableOpacity
							onPress={() => setSearch("")}
							style={styles.clearBtn}
						>
							<MaterialCommunityIcons
								name="close-circle"
								size={16}
								color={theme.colors.textMuted}
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Results count */}
			{!isLoading && (
				<View style={styles.resultsRow}>
					<Text style={styles.resultsText}>
						{filtered.length} {filtered.length === 1 ? "item" : "items"}
						{search ? ` for "${search}"` : " on menu"}
					</Text>
				</View>
			)}

			{/* Product grid */}
			{isLoading ? (
				<FlatList
					data={[1, 2, 3, 4, 5, 6]}
					keyExtractor={(i) => String(i)}
					numColumns={2}
					columnWrapperStyle={styles.row}
					renderItem={() => <SkeletonCard />}
					contentContainerStyle={styles.list}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			) : (
				<FlatList
					data={filtered}
					keyExtractor={(item) => item.id}
					numColumns={2}
					columnWrapperStyle={styles.row}
					renderItem={renderItem}
					contentContainerStyle={[
						styles.list,
						cartCount > 0 && styles.listWithCartPadding,
					]}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					ListEmptyComponent={
						<View style={styles.empty}>
							<Text style={styles.emptyIcon}>🔍</Text>
							<Text style={styles.emptyTitle}>No dishes found</Text>
							<Text style={styles.emptySubtitle}>
								Try a different search term
							</Text>
						</View>
					}
					removeClippedSubviews={true}
					maxToRenderPerBatch={10}
					windowSize={5}
					initialNumToRender={6}
				/>
			)}

			{/* Floating cart summary bar */}
			{cartCount > 0 && (
				<View style={styles.cartBar}>
					<View style={styles.cartBarLeft}>
						<View style={styles.cartBadge}>
							<Text style={styles.cartBadgeText}>{cartCount}</Text>
						</View>
						<Text style={styles.cartBarLabel}>items added</Text>
					</View>
					<Text style={styles.cartBarTotal}>₹{cartTotal.toLocaleString()}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	searchWrap: {
		backgroundColor: "#fff",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		paddingHorizontal: 10,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		color: theme.colors.textPrimary,
		fontSize: 14,
		paddingVertical: 10,
	},
	clearBtn: {
		padding: 4,
	},
	resultsRow: {
		paddingHorizontal: 14,
		paddingTop: 10,
		paddingBottom: 2,
	},
	resultsText: {
		fontSize: 12,
		color: theme.colors.textMuted,
		fontWeight: "600",
	},
	list: {
		paddingHorizontal: 8,
		paddingTop: 8,
		paddingBottom: 20,
	},
	listWithCartPadding: {
		paddingBottom: 80,
	},
	row: {
		justifyContent: "space-between",
	},
	empty: {
		alignItems: "center",
		paddingTop: 60,
	},
	emptyIcon: {
		fontSize: 40,
		marginBottom: 12,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: theme.colors.textPrimary,
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textMuted,
		marginTop: 4,
	},
	cartBar: {
		position: "absolute",
		bottom: 12,
		left: 12,
		right: 12,
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.lg,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 16,
		...theme.shadow.lg,
	},
	cartBarLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	cartBadge: {
		backgroundColor: "rgba(255,255,255,0.25)",
		borderRadius: theme.radius.full,
		minWidth: 24,
		height: 24,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
	},
	cartBadgeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "800",
	},
	cartBarLabel: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	cartBarTotal: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "900",
	},
});
