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
