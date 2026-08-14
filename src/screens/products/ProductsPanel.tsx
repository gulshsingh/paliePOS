import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	Modal,
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
import { useCustomerStore } from "../../store/customerStore";
import { useFlowStore } from "../../store/flowStore";
import { useTableStore } from "../../store/tableStore";
import { theme } from "../../theme";
import type { Product } from "../../types/product";
import BillingPanel from "../counter/BillingPanel";

export default function ProductsPanel() {
	const [search, setSearch] = useState("");
	const [cartOpen, setCartOpen] = useState(false);
	const { data, isLoading } = useProducts();
	const addToCart = useCartStore((s) => s.addToCart);
	const cart = useCartStore((s) => s.cart);
	const clearCart = useCartStore((s) => s.clearCart);
	const saveDraft = useFlowStore((s) => s.saveDraft);
	const setActiveDraftId = useFlowStore((s) => s.setActiveDraftId);
	const setSelectedCustomer = useCustomerStore((s) => s.setSelectedCustomer);
	const selectedCustomer = useCustomerStore((s) => s.selectedCustomer);
	const setSelectedTable = useTableStore((s) => s.setSelectedTable);
	const selectedTable = useTableStore((s) => s.selectedTable);

	const decreaseQty = useCartStore((s) => s.decreaseQty);

	const cartMap = useMemo(
		() => new Map(cart.map((i) => [i.id, i.qty])),
		[cart],
	);

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

	const handleDecrease = useCallback(
		(product: Product) => {
			decreaseQty(product.id);
		},
		[decreaseQty],
	);

	// Saves the current unfinished cart to Flow (localStorage), then starts fresh.
	const handleNewOrder = useCallback(() => {
		if (cart.length > 0) {
			saveDraft({
				items: cart,
				table_id: selectedTable?.id ?? null,
				table_name: selectedTable?.name ?? null,
				customer_id: selectedCustomer?.id ?? null,
				customer_name: selectedCustomer?.name ?? null,
			});
		}
		clearCart();
		setSelectedCustomer(null);
		setSelectedTable(null);
		setActiveDraftId(null);
		setCartOpen(false);
	}, [
		cart,
		selectedTable,
		selectedCustomer,
		saveDraft,
		clearCart,
		setSelectedCustomer,
		setSelectedTable,
		setActiveDraftId,
	]);

	const renderItem = useCallback(
		({ item }: { item: Product }) => (
			<ProductCard
				product={item}
				qty={cartMap.get(item.id) ?? 0}
				onPress={handleAdd}
				onIncrease={handleAdd}
				onDecrease={handleDecrease}
			/>
		),
		[cartMap, handleAdd, handleDecrease],
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
					<TouchableOpacity
						style={styles.newOrderBtn}
						onPress={handleNewOrder}
						activeOpacity={0.8}
					>
						<MaterialCommunityIcons
							name="plus"
							size={14}
							color={theme.colors.primary}
						/>
						<Text style={styles.newOrderText}>New Order</Text>
					</TouchableOpacity>
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
				<TouchableOpacity
					style={styles.cartBar}
					activeOpacity={0.9}
					onPress={() => setCartOpen(true)}
				>
					<View style={styles.cartBarLeft}>
						<View style={styles.cartBadge}>
							<Text style={styles.cartBadgeText}>{cartCount}</Text>
						</View>
						<Text style={styles.cartBarLabel}>items added</Text>
					</View>
					<View style={styles.cartBarRight}>
						<Text style={styles.cartBarTotal}>
							₹{cartTotal.toLocaleString()}
						</Text>
						<MaterialCommunityIcons name="chevron-up" size={20} color="#fff" />
					</View>
				</TouchableOpacity>
			)}

			{/* Cart bottom sheet — BillingPanel directly inside Modal */}
			<Modal
				visible={cartOpen}
				animationType="slide"
				transparent
				onRequestClose={() => setCartOpen(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalSheet}>
						{/* Handle + close */}
						<View style={styles.sheetHandle} />
						<TouchableOpacity
							style={styles.sheetClose}
							onPress={() => setCartOpen(false)}
						>
							<MaterialCommunityIcons
								name="close"
								size={18}
								color={theme.colors.textSecondary}
							/>
						</TouchableOpacity>
						{/* BillingPanel — exact same component, exact same smooth scroll */}
						<BillingPanel onRequestClose={() => setCartOpen(false)} />
					</View>
				</View>
			</Modal>
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 14,
		paddingTop: 10,
		paddingBottom: 2,
	},
	newOrderBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: theme.colors.primaryLight,
		borderWidth: 1.5,
		borderColor: theme.colors.primary,
		borderRadius: theme.radius.full,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	newOrderText: {
		fontSize: 12,
		fontWeight: "800",
		color: theme.colors.primary,
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
	cartBarRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
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
	// ── Cart bottom sheet modal ───────────────────────────
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: theme.colors.surfaceSecondary,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		height: "85%",
		overflow: "hidden",
	},
	sheetHandle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: theme.colors.border,
		alignSelf: "center",
		marginTop: 10,
		marginBottom: 4,
	},
	sheetClose: {
		position: "absolute",
		top: 10,
		right: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: theme.colors.surfaceSecondary,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
});
