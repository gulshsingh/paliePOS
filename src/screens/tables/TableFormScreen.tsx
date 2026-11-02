import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
	useCreateTable,
	useDeleteTable,
	useUpdateTable,
} from "../../hooks/useTables";
import {
	type TableFormData,
	tableSchema,
} from "../../schemas/tables/tableSchema";
import { theme } from "../../theme";
import { styles } from "./TableFormScreen.styles";

const STATUS_OPTIONS = [
	{
		key: "available",
		label: "Available",
		icon: "check-circle-outline",
		color: theme.colors.success,
		bg: theme.colors.successLight,
	},
	{
		key: "occupied",
		label: "Occupied",
		icon: "close-circle-outline",
		color: theme.colors.danger,
		bg: theme.colors.dangerLight,
	},
];

type FieldErrors = Partial<Record<keyof TableFormData, string>>;

export default function TableFormScreen() {
	const insets = useSafeAreaInsets();
	const route = useRoute<any>();
	const navigation = useNavigation<any>();
	const table = route.params?.table;
	const isEdit = !!table;

	const [name, setName] = useState(table?.name ?? "");
	const [capacity, setCapacity] = useState(String(table?.capacity ?? ""));
	const [status, setStatus] = useState<"available" | "occupied">(
		table?.status ?? "available",
	);
	const [focused, setFocused] = useState<string | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});

	const createTable = useCreateTable();
	const updateTable = useUpdateTable();
	const deleteTable = useDeleteTable();
	const isPending = createTable.isPending || updateTable.isPending;

	const validate = (): boolean => {
		const result = tableSchema.safeParse({
			name,
			capacity: Number(capacity),
			status,
		});
		if (!result.success) {
			const fe: FieldErrors = {};
			result.error.errors.forEach((e) => {
				const f = e.path[0] as keyof FieldErrors;
				if (!fe[f]) fe[f] = e.message;
			});
			setErrors(fe);
			return false;
		}
		setErrors({});
		return true;
	};

	const handleSave = async () => {
		if (!validate()) return;
		const data = { name, capacity: Number(capacity), status };
		try {
			if (isEdit) {
				await updateTable.mutateAsync({ id: table.id, data });
			} else {
				await createTable.mutateAsync(data);
			}
			navigation.goBack();
		} catch (e) {
			console.error("Failed to save table", e);
		}
	};

	const currentStatus =
		STATUS_OPTIONS.find((s) => s.key === status) ?? STATUS_OPTIONS[0];

	return (
		<KeyboardAvoidingView
			style={[styles.container, { paddingTop: insets.top }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
						{isEdit ? "Edit" : "New"} Table
					</Text>
					<Text style={styles.headerSub}>
						{isEdit ? "Update table settings" : "Add a new table"}
					</Text>
				</View>
				{isEdit ? (
					<TouchableOpacity
						style={styles.deleteIconBtn}
						onPress={() => {
							deleteTable.mutate(table.id);
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
				{/* Preview */}
				<View style={styles.previewWrap}>
					<View
						style={[styles.tableIcon, { borderColor: currentStatus.color }]}
					>
						<MaterialCommunityIcons
							name="table-furniture"
							size={40}
							color={currentStatus.color}
						/>
					</View>
					<Text style={styles.previewName}>{name || "New Table"}</Text>
					<View
						style={[
							styles.previewStatus,
							{ backgroundColor: currentStatus.bg },
						]}
					>
						<MaterialCommunityIcons
							name={currentStatus.icon}
							size={13}
							color={currentStatus.color}
						/>
						<Text
							style={[styles.previewStatusText, { color: currentStatus.color }]}
						>
							{currentStatus.label}
						</Text>
					</View>
				</View>

				{/* Details */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="table-furniture"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Table Details</Text>
					</View>

					<Text style={styles.label}>Table Name *</Text>
					<TextInput
						style={[
							styles.input,
							focused === "name" && styles.inputFocused,
							errors.name && styles.inputError,
						]}
						value={name}
						onChangeText={(v) => {
							setName(v);
							setErrors((p) => ({ ...p, name: undefined }));
						}}
						placeholder="e.g. Table 1"
						placeholderTextColor={theme.colors.textMuted}
						onFocus={() => setFocused("name")}
						onBlur={() => setFocused(null)}
					/>
					{errors.name ? (
						<Text style={styles.fieldError}>{errors.name}</Text>
					) : null}

					<Text style={[styles.label, styles.labelSpacing]}>
						Seating Capacity *
					</Text>
					<TextInput
						style={[
							styles.input,
							focused === "cap" && styles.inputFocused,
							errors.capacity && styles.inputError,
						]}
						value={capacity}
						onChangeText={(v) => {
							setCapacity(v);
							setErrors((p) => ({ ...p, capacity: undefined }));
						}}
						placeholder="e.g. 4"
						placeholderTextColor={theme.colors.textMuted}
						keyboardType="numeric"
						onFocus={() => setFocused("cap")}
						onBlur={() => setFocused(null)}
					/>
					{errors.capacity ? (
						<Text style={styles.fieldError}>{errors.capacity}</Text>
					) : null}
				</View>

				{/* Status */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="information-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Table Status</Text>
					</View>
					<View style={styles.statusRow}>
						{STATUS_OPTIONS.map((s) => (
							<TouchableOpacity
								key={s.key}
								activeOpacity={0.8}
								style={[
									styles.statusOption,
									status === s.key && {
										borderColor: s.color,
										backgroundColor: s.bg,
									},
								]}
								onPress={() => setStatus(s.key as "available" | "occupied")}
							>
								<MaterialCommunityIcons
									name={s.icon}
									size={24}
									color={status === s.key ? s.color : theme.colors.textMuted}
								/>
								<Text
									style={[
										styles.statusLabel,
										status === s.key && { color: s.color },
									]}
								>
									{s.label}
								</Text>
								{status === s.key && (
									<View
										style={[styles.selectedDot, { backgroundColor: s.color }]}
									/>
								)}
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>

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
								{isEdit ? "Save Changes" : "Create Table"}
							</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}
