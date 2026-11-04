import {
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { PaymentMode } from "../../api/services/paymentModes";
import PaymentModeDropdown from "../../components/billing/PaymentModeDropdown";
import Receipt from "../../components/billing/Receipt";
import { theme } from "../../theme";
import type { CartItem } from "../../types/cart";
import { styles } from "./ProceedPaymentScreen.styles";

export interface PaymentReceiptData {
	orderNumber: string;
	invoiceNumber?: string;
	items: CartItem[];
	subtotal: number;
	taxTotal: number;
	discount: number;
	grandTotal: number;
	amountPaid: number;
	change: number;
}

export function ProceedReceiptView({
	topInset,
	result,
	onDone,
}: {
	topInset: number;
	result: PaymentReceiptData;
	onDone: () => void;
}) {
	return (
		<View style={[styles.container, { paddingTop: topInset }]}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />
			<View style={styles.successHeader}>
				<TouchableOpacity style={styles.backBtn} onPress={onDone}>
					<MaterialCommunityIcons
						name="close"
						size={20}
						color={theme.colors.textSecondary}
					/>
				</TouchableOpacity>
				<View style={styles.successBadge}>
					<MaterialCommunityIcons
						name="check-circle"
						size={22}
						color={theme.colors.success}
					/>
					<Text style={styles.successText}>Payment Successful</Text>
				</View>
				<View style={styles.headerSpacer} />
			</View>
			<ScrollView contentContainerStyle={styles.receiptScroll}>
				<Receipt {...result} orderNumber={result.orderNumber} />
			</ScrollView>
			<TouchableOpacity
				style={styles.doneBtn}
				onPress={onDone}
				activeOpacity={0.85}
			>
				<MaterialCommunityIcons name="home-outline" size={18} color="#fff" />
				<Text style={styles.doneBtnText}>Back to POS</Text>
			</TouchableOpacity>
		</View>
	);
}

export function ProceedContextChips({
	customerName,
	hasCustomer,
	tableName,
	hasTable,
	paymentModes,
	selectedPaymentMode,
	onSelectPaymentMode,
	isLoadingModes,
}: {
	customerName?: string;
	hasCustomer: boolean;
	tableName?: string;
	hasTable: boolean;
	paymentModes: PaymentMode[];
	selectedPaymentMode: PaymentMode | null;
	onSelectPaymentMode: (mode: PaymentMode) => void;
	isLoadingModes?: boolean;
}) {
	return (
		<View style={styles.contextRow}>
			{/* Left Column: Customer & Table stacked vertically (ek ke niche ek) */}
			<View style={styles.stackedChipsCol}>
				<View
					style={[styles.contextChip, hasCustomer && styles.contextChipActive]}
				>
					<View style={styles.contextChipLeft}>
						<MaterialCommunityIcons
							name="account-outline"
							size={12}
							color={
								hasCustomer ? theme.colors.primary : theme.colors.textMuted
							}
						/>
						<Text
							style={[
								styles.contextChipText,
								hasCustomer && styles.contextChipTextActive,
							]}
							numberOfLines={1}
						>
							{customerName ?? "Walk-in Customer"}
						</Text>
					</View>
					{hasCustomer && (
						<MaterialCommunityIcons
							name="check-circle"
							size={11}
							color={theme.colors.primary}
						/>
					)}
				</View>

				<View
					style={[styles.contextChip, hasTable && styles.contextChipActive]}
				>
					<View style={styles.contextChipLeft}>
						<MaterialCommunityIcons
							name="table-furniture"
							size={12}
							color={hasTable ? theme.colors.primary : theme.colors.textMuted}
						/>
						<Text
							style={[
								styles.contextChipText,
								hasTable && styles.contextChipTextActive,
							]}
							numberOfLines={1}
						>
							{tableName ?? "No Table"}
						</Text>
					</View>
					{hasTable && (
						<MaterialCommunityIcons
							name="check-circle"
							size={11}
							color={theme.colors.primary}
						/>
					)}
				</View>
			</View>

			{/* Right Column: Payment Mode (where table used to be) */}
			<View style={styles.paymentModeCol}>
				<PaymentModeDropdown
					modes={paymentModes}
					selectedMode={selectedPaymentMode}
					onSelectMode={onSelectPaymentMode}
					isLoading={isLoadingModes}
					compact
				/>
			</View>
		</View>
	);
}
