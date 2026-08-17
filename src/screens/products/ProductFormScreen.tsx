import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCategories } from "../../hooks/useCategories";
import {
	useCreateProduct,
	useDeleteProduct,
	useUpdateProduct,
} from "../../hooks/useProducts";
import { useUnits } from "../../hooks/useUnits";
import {
	type ProductFormData,
	productSchema,
} from "../../schemas/products/productSchema";
import { theme } from "../../theme";

type FieldErrors = Partial<Record<keyof ProductFormData, string>>;

const EMOJIS = [
	"🍕",
	"🍔",
	"🥤",
	"🥗",
	"🍜",
	"🍣",
	"🥩",
	"🍰",
	"🥐",
	"🧁",
	"☕",
	"🍦",
	"🍩",
	"🌮",
	"🥪",
	"🍝",
	"🍛",
	"🥟",
];
const TILE_COLORS = [
	"#FFF3E8",
	"#FFF0F1",
	"#F0FFF4",
	"#F0F4FF",
	"#FFFBF0",
	"#F5F0FF",
];

export default function ProductFormScreen() {
	const insets = useSafeAreaInsets();
	const route = useRoute<any>();
	const navigation = useNavigation<any>();
	const product = route.params?.product;
	const isEdit = !!product;

	const [name, setName] = useState(product?.name ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [price, setPrice] = useState(String(product?.price_per_unit ?? ""));
	const [costPrice, setCostPrice] = useState(String(product?.cost_price ?? ""));
	const [tax, setTax] = useState(String(product?.tax_percentage ?? "0"));
	const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
	const [unitId, setUnitId] = useState(product?.unit_id ?? "");
	const [openStock, setOpenStock] = useState(
		String(product?.open_stock ?? product?.packet_quantity ?? ""),
	);
	const [isRawMaterial, setIsRawMaterial] = useState(
		product?.is_raw_material ?? false,
	);
	const [focused, setFocused] = useState<string | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});

	const { data: categoriesData } = useCategories();
	const categories = (categoriesData as any)?.data ?? [];
	const { data: unitsData } = useUnits();
	const units = (unitsData as any)?.data ?? [];
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();
	const deleteProduct = useDeleteProduct();
	const isPending = createProduct.isPending || updateProduct.isPending;

	const emoji = name ? EMOJIS[name.length % EMOJIS.length] : "🍽️";
	const tileBg = name
		? TILE_COLORS[name.length % TILE_COLORS.length]
		: theme.colors.surfaceSecondary;

	const handleSave = async () => {
		// Validate before saving
		const result = productSchema.safeParse({
			name,
			description,
			price_per_unit: Number(price),
			cost_price: Number(costPrice || 0),
			tax_percentage: Number(tax),
			open_stock: Number(openStock || 0),
			is_raw_material: isRawMaterial,
		});

		if (!result.success) {
			const fe: FieldErrors = {};
			result.error.errors.forEach((e) => {
				const f = e.path[0] as keyof FieldErrors;
				if (!fe[f]) fe[f] = e.message;
			});
			setErrors(fe);
			return;
		}
		setErrors({});
		const data = {
			name,
			description,
			price_per_unit: Number(price),
			cost_price: Number(costPrice || 0),
			packet_quantity: Number(openStock || 0),
			tax_percentage: Number(tax),
			category_id: categoryId ? categoryId.trim() : null,
			unit_id: unitId ? unitId.trim() : null,
			image_url: product?.image_url ?? "",
			is_raw_material: isRawMaterial,
			is_track_inventory: true,
		};
		try {
			if (isEdit) {
				await updateProduct.mutateAsync({ id: product.id, data });
			} else {
				await createProduct.mutateAsync(data);
			}
			navigation.goBack();
		} catch (e) {
			console.error("Failed to save product", e);
		}
	};

	const field = (
		id: string,
		label: string,
		value: string,
		onChange: (v: string) => void,
		props: any = {},
	) => (
		<View style={styles.fieldWrap}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				style={[
					styles.input,
					focused === id && styles.inputFocused,
					props.multiline && styles.inputMulti,
				]}
				value={value}
				onChangeText={onChange}
				placeholderTextColor={theme.colors.textMuted}
				onFocus={() => setFocused(id)}
				onBlur={() => setFocused(null)}
				{...props}
			/>
		</View>
	);

	return (
		<KeyboardAvoidingView
			style={[styles.container, { paddingTop: insets.top }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<MaterialCommunityIcons
						name="arrow-left"
						size={20}
						color={theme.colors.textSecondary}
					/>
				</TouchableOpacity>
				<View>
					<Text style={styles.headerTitle}>
						{isEdit ? "Edit" : "New"} Product
					</Text>
					<Text style={styles.headerSub}>
						{isEdit ? "Update product details" : "Add to your menu"}
					</Text>
				</View>
				{isEdit ? (
					<TouchableOpacity
						style={styles.deleteIconBtn}
						onPress={() => {
							deleteProduct.mutate(product.id);
							navigation.goBack();
						}}
					>
						<MaterialCommunityIcons
							name="trash-can-outline"
							size={20}
							color={theme.colors.danger}
						/>
					</TouchableOpacity>
				) : (
					<View style={styles.headerSpacer} />
				)}
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
			>
				{/* Emoji preview */}
				<View style={[styles.emojiPreview, { backgroundColor: tileBg }]}>
					<Text style={styles.emojiLarge}>{emoji}</Text>
					{name ? (
						<Text style={styles.emojiName}>{name}</Text>
					) : (
						<Text style={styles.emojiPlaceholder}>Product preview</Text>
					)}
					{price ? (
						<Text style={styles.emojiPrice}>
							₹{Number(price).toLocaleString("en-IN")}
						</Text>
					) : null}
				</View>

				{/* Card 1 — details */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="food-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Product Details</Text>
					</View>
					{field(
						"name",
						"Product Name *",
						name,
						(v) => {
							setName(v);
							setErrors((p) => ({ ...p, name: undefined }));
						},
						{ placeholder: "e.g. Veg Pizza" },
					)}
					{errors.name ? (
						<Text style={styles.fieldError}>{errors.name}</Text>
					) : null}
					{field("desc", "Description", description, setDescription, {
						placeholder: "Short description...",
						multiline: true,
						numberOfLines: 3,
						textAlignVertical: "top",
					})}
				</View>

				{/* Card 2 — pricing */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="tag-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Pricing</Text>
					</View>
					<View style={styles.priceRow}>
						<View style={styles.priceCol}>
							{field("price", "Price (₹)", price, setPrice, {
								placeholder: "0",
								keyboardType: "numeric",
							})}
						</View>
						<View style={styles.priceCol}>
							{field("tax", "Tax %", tax, setTax, {
								placeholder: "0",
								keyboardType: "numeric",
							})}
						</View>
					</View>
					{isRawMaterial && (
						<View style={styles.costPriceWrap}>
							{field("cost", "Cost Price (₹)", costPrice, setCostPrice, {
								placeholder: "0",
								keyboardType: "numeric",
							})}
						</View>
					)}
				</View>

				{/* Card 3 — inventory type */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="database-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Inventory</Text>
					</View>

					<Text style={styles.label}>Type</Text>
					<View style={styles.chipRow}>
						<TouchableOpacity
							style={[styles.chip, !isRawMaterial && styles.chipActive]}
							onPress={() => setIsRawMaterial(false)}
						>
							<Text
								style={[
									styles.chipText,
									!isRawMaterial && styles.chipTextActive,
								]}
							>
								Finished Good
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.chip, isRawMaterial && styles.chipActive]}
							onPress={() => setIsRawMaterial(true)}
						>
							<Text
								style={[
									styles.chipText,
									isRawMaterial && styles.chipTextActive,
								]}
							>
								Raw Material
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.stockWrap}>
						{field("stock", "Opening Stock", openStock, setOpenStock, {
							placeholder: "0",
							keyboardType: "numeric",
						})}
					</View>
				</View>

				{/* Card 4 — category & unit */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="shape-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Category & Unit</Text>
					</View>

					<Text style={styles.label}>Category</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						nestedScrollEnabled
						style={styles.chipScroll}
					>
						<View style={styles.chipRow}>
							<TouchableOpacity
								style={[styles.chip, !categoryId && styles.chipActive]}
								onPress={() => setCategoryId("")}
							>
								<Text
									style={[
										styles.chipText,
										!categoryId && styles.chipTextActive,
									]}
								>
									None
								</Text>
							</TouchableOpacity>
							{categories.map((c: any) => (
								<TouchableOpacity
									key={c.id}
									style={[
										styles.chip,
										categoryId === c.id && styles.chipActive,
									]}
									onPress={() => setCategoryId(c.id)}
								>
									<Text
										style={[
											styles.chipText,
											categoryId === c.id && styles.chipTextActive,
										]}
									>
										{c.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>

					<Text style={[styles.label, styles.unitLabel]}>Unit</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						nestedScrollEnabled
						style={styles.chipScroll}
					>
						<View style={styles.chipRow}>
							<TouchableOpacity
								style={[styles.chip, !unitId && styles.chipActive]}
								onPress={() => setUnitId("")}
							>
								<Text
									style={[styles.chipText, !unitId && styles.chipTextActive]}
								>
									None
								</Text>
							</TouchableOpacity>
							{units.map((u: any) => (
								<TouchableOpacity
									key={u.id}
									style={[styles.chip, unitId === u.id && styles.chipActive]}
									onPress={() => setUnitId(unitId === u.id ? "" : u.id)}
								>
									<Text
										style={[
											styles.chipText,
											unitId === u.id && styles.chipTextActive,
										]}
									>
										{u.name}
										{u.symbol ? ` (${u.symbol})` : ""}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				</View>
			</ScrollView>

			{/* Footer */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.cancelBtn}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.cancelBtnText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.saveBtn, isPending && styles.buttonDisabled]}
					onPress={handleSave}
					disabled={isPending}
					activeOpacity={0.85}
				>
					{isPending ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<>
							<MaterialCommunityIcons
								name={isEdit ? "content-save-outline" : "plus-circle-outline"}
								size={18}
								color="#fff"
							/>
							<Text style={styles.saveBtnText}>
								{isEdit ? "Save Changes" : "Add to Menu"}
							</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.surfaceSecondary,
		paddingTop: 0,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderLight,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: theme.colors.surfaceSecondary,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		textAlign: "center",
	},
	headerSub: {
		fontSize: 12,
		color: theme.colors.textMuted,
		textAlign: "center",
		marginTop: 1,
	},
	deleteIconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: theme.colors.dangerLight,
		justifyContent: "center",
		alignItems: "center",
	},
	scroll: { flex: 1 },
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
		gap: 12,
	},
	emojiPreview: {
		borderRadius: theme.radius.xl,
		paddingVertical: 20,
		alignItems: "center",
		gap: 4,
	},
	emojiLarge: { fontSize: 52 },
	emojiName: {
		fontSize: 16,
		fontWeight: "800",
		color: theme.colors.textPrimary,
		marginTop: 4,
	},
	emojiPlaceholder: {
		fontSize: 14,
		color: theme.colors.textMuted,
		marginTop: 4,
	},
	emojiPrice: {
		fontSize: 15,
		fontWeight: "700",
		color: theme.colors.primary,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: theme.radius.xl,
		padding: 18,
		borderWidth: 1,
		borderColor: theme.colors.borderLight,
		...theme.shadow.sm,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 14,
	},
	cardTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: theme.colors.textPrimary,
	},
	priceRow: {
		flexDirection: "row",
		gap: 12,
	},
	fieldWrap: { marginBottom: 4 },
	label: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textSecondary,
		marginBottom: 6,
		letterSpacing: 0.3,
	},
	input: {
		backgroundColor: theme.colors.surfaceSecondary,
		color: theme.colors.textPrimary,
		borderRadius: theme.radius.md,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 14,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		marginBottom: 8,
	},
	inputFocused: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	inputMulti: {
		height: 80,
		textAlignVertical: "top",
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 4,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: theme.radius.full,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surfaceSecondary,
	},
	chipActive: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	chipText: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.colors.textMuted,
	},
	chipTextActive: {
		color: theme.colors.primary,
	},
	footer: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: theme.colors.borderLight,
	},
	cancelBtn: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: theme.radius.md,
		alignItems: "center",
		backgroundColor: theme.colors.surfaceTertiary,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	cancelBtnText: {
		color: theme.colors.textSecondary,
		fontSize: 14,
		fontWeight: "700",
	},
	saveBtn: {
		flex: 2,
		flexDirection: "row",
		paddingVertical: 14,
		borderRadius: theme.radius.md,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: theme.colors.primary,
		...theme.shadow.lg,
	},
	saveBtnText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "800",
	},
	headerSpacer: {
		width: 36,
	},
	priceCol: {
		flex: 1,
	},
	costPriceWrap: {
		marginTop: 4,
	},
	stockWrap: {
		marginTop: 12,
	},
	chipScroll: {
		marginBottom: 4,
	},
	unitLabel: {
		marginTop: 12,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
});
