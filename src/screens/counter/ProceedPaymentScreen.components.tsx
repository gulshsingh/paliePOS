import {
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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
}: {
	customerName?: string;
	hasCustomer: boolean;
	tableName?: string;
	hasTable: boolean;
}) {
	return (
		<View style={styles.contextRow}>
			<View
				style={[styles.contextChip, hasCustomer && styles.contextChipActive]}
			>
				<View style={styles.contextChipLeft}>
					<MaterialCommunityIcons
						name="account-outline"
						size={15}
						color={hasCustomer ? theme.colors.primary : theme.colors.textMuted}
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
						size={14}
						color={theme.colors.primary}
					/>
				)}
			</View>

			<View style={[styles.contextChip, hasTable && styles.contextChipActive]}>
				<View style={styles.contextChipLeft}>
					<MaterialCommunityIcons
						name="table-furniture"
						size={15}
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
						size={14}
						color={theme.colors.primary}
					/>
				)}
			</View>
		</View>
	);
}
