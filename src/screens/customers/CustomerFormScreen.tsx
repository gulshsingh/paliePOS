import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	type TextInputProps,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
	useCreateCustomer,
	useDeleteCustomer,
	useUpdateCustomer,
} from "../../hooks/useCustomers";
import {
	type CustomerFormData,
	customerSchema,
} from "../../schemas/customers/customerSchema";
import { theme } from "../../theme";
import { styles } from "./CustomerFormScreen.styles";
import type { RootNavigationProp, RootRouteProp } from "../../types/navigation";
import { getErrorMessage } from "../../utils/apiHelpers";

type FieldErrors = Partial<Record<keyof CustomerFormData, string>>;

export default function CustomerFormScreen(): React.JSX.Element {
	const insets = useSafeAreaInsets();
	const route = useRoute<RootRouteProp<"CustomerForm">>();
	const navigation = useNavigation<RootNavigationProp>();
	const customer = route.params?.customer;
	const isEdit = !!customer;

	const [name, setName] = useState<string>(customer?.name ?? "");
	const [email, setEmail] = useState<string>(customer?.email ?? "");
	const [phone, setPhone] = useState<string>(customer?.phone ?? "");
	const [address, setAddress] = useState<string>(customer?.address ?? "");
	const [focused, setFocused] = useState<string | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});

	const createCustomer = useCreateCustomer();
	const updateCustomer = useUpdateCustomer();
	const deleteCustomer = useDeleteCustomer();
	const isPending = createCustomer.isPending || updateCustomer.isPending;

	const clearError = (field: keyof FieldErrors) =>
		setErrors((p) => ({ ...p, [field]: undefined }));

	const validate = (): boolean => {
		const result = customerSchema.safeParse({
			name: name.trim(),
			email: email.trim() || undefined,
			phone: phone.trim() || undefined,
			address: address.trim() || undefined,
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

	const handleSave = async (): Promise<void> => {
		if (!validate()) return;
		const payload: Record<string, any> = {
			name: name.trim(),
			account_type: "customer",
		};
		if (email.trim()) payload.email = email.trim();
		else if (isEdit) payload.email = null;

		if (phone.trim()) payload.phone = phone.trim();
		else if (isEdit) payload.phone = null;

		if (address.trim()) payload.address = address.trim();
		else if (isEdit) payload.address = null;

		try {
			if (isEdit) {
				await updateCustomer.mutateAsync({ id: customer.id, data: payload });
			} else {
				await createCustomer.mutateAsync(payload);
			}
			navigation.goBack();
		} catch (e) {
			console.error("Failed to save customer", e);
			const errorMsg = getErrorMessage(e, "Failed to save customer");
			Alert.alert("Customer Save Failed", errorMsg);
		}
	};

	const handleDelete = (): void => {
		if (!customer) return;
		Alert.alert("Delete Customer", `Remove "${customer.name}" permanently?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteCustomer.mutateAsync(customer.id);
						navigation.goBack();
					} catch (e) {
						const errorMsg = getErrorMessage(e, "Failed to delete customer");
						Alert.alert("Delete Failed", errorMsg);
					}
				},
			},
		]);
	};

	const inputRow = (
		id: string,
		icon: string,
		label: string,
		value: string,
		onChange: (v: string) => void,
		fieldKey: keyof FieldErrors,
		props: TextInputProps = {},
	) => (
		<View style={styles.fieldWrap}>
			<Text style={styles.label}>{label}</Text>
			<View
				style={[
					styles.inputRow,
					focused === id && styles.inputFocused,
					errors[fieldKey] && styles.inputError,
				]}
			>
				<MaterialCommunityIcons
					name={icon}
					size={18}
					color={
						errors[fieldKey]
							? theme.colors.danger
							: focused === id
								? theme.colors.primary
								: theme.colors.textMuted
					}
				/>
				<TextInput
					style={styles.input}
					value={value}
					onChangeText={(v) => {
						onChange(v);
						clearError(fieldKey);
					}}
					placeholderTextColor={theme.colors.textMuted}
					onFocus={() => setFocused(id)}
					onBlur={() => setFocused(null)}
					{...props}
				/>
			</View>
			{errors[fieldKey] ? (
				<Text style={styles.fieldError}>{errors[fieldKey]}</Text>
			) : null}
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
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>
						{isEdit ? "Edit" : "New"} Customer
					</Text>
					<Text style={styles.headerSub}>
						{isEdit ? "Update customer info" : "Add a new customer"}
					</Text>
				</View>
				{isEdit ? (
					<TouchableOpacity style={styles.deleteIconBtn} onPress={handleDelete}>
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
				{/* Avatar */}
				<View style={styles.avatarWrap}>
					<View style={styles.avatar}>
						<MaterialCommunityIcons
							name="account"
							size={36}
							color={theme.colors.primary}
						/>
					</View>
					{isEdit && <Text style={styles.avatarName}>{customer.name}</Text>}
				</View>

				{/* Basic details */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="account-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Basic Details</Text>
					</View>
					{inputRow(
						"name",
						"account-outline",
						"Full Name *",
						name,
						setName,
						"name",
						{ placeholder: "e.g. Rahul Sharma" },
					)}
					{inputRow(
						"phone",
						"phone-outline",
						"Phone Number ",
						phone,
						setPhone,
						"phone",
						{ placeholder: "9876543210", keyboardType: "phone-pad" },
					)}
				</View>

				{/* Additional info */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<MaterialCommunityIcons
							name="information-outline"
							size={16}
							color={theme.colors.primary}
						/>
						<Text style={styles.cardTitle}>Additional Info</Text>
					</View>
					{inputRow(
						"email",
						"email-outline",
						"Email Address ",
						email,
						setEmail,
						"email",
						{
							placeholder: "rahul@example.com",
							keyboardType: "email-address",
							autoCapitalize: "none",
						},
					)}
					<View style={styles.fieldWrap}>
						<Text style={styles.label}>Address </Text>
						<View
							style={[
								styles.inputRow,
								styles.inputMulti,
								focused === "address" && styles.inputFocused,
							]}
						>
							<MaterialCommunityIcons
								name="map-marker-outline"
								size={18}
								color={
									focused === "address"
										? theme.colors.primary
										: theme.colors.textMuted
								}
								style={styles.iconTop}
							/>
							<TextInput
								style={[styles.input, styles.addressInput]}
								value={address}
								onChangeText={setAddress}
								placeholder="Street, City, State..."
								placeholderTextColor={theme.colors.textMuted}
								multiline
								numberOfLines={3}
								onFocus={() => setFocused("address")}
								onBlur={() => setFocused(null)}
							/>
						</View>
					</View>
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
								name={isEdit ? "content-save-outline" : "account-plus-outline"}
								size={18}
								color="#fff"
							/>
							<Text style={styles.saveBtnText}>
								{isEdit ? "Save Changes" : "Create Customer"}
							</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}
