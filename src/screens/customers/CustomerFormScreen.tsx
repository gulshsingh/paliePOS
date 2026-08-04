import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../../hooks/useCustomers';
import { customerSchema, CustomerFormData } from '../../schemas/customers/customerSchema';
import { theme } from '../../theme';

type FieldErrors = Partial<Record<keyof CustomerFormData, string>>;

export default function CustomerFormScreen(): React.JSX.Element {
  const insets     = useSafeAreaInsets();
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const customer   = route.params?.customer;
  const isEdit     = !!customer;

  const [name,    setName]    = useState<string>(customer?.name    ?? '');
  const [email,   setEmail]   = useState<string>(customer?.email   ?? '');
  const [phone,   setPhone]   = useState<string>(customer?.phone   ?? '');
  const [address, setAddress] = useState<string>(customer?.address ?? '');
  const [focused, setFocused] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<FieldErrors>({});

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const isPending = createCustomer.isPending || updateCustomer.isPending;

  const clearError = (field: keyof FieldErrors) =>
    setErrors((p) => ({ ...p, [field]: undefined }));

  const validate = (): boolean => {
    const result = customerSchema.safeParse({ name, email: email || undefined, phone: phone || undefined, address });
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
    const data = { name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() };
    try {
      if (isEdit) {
        await updateCustomer.mutateAsync({ id: customer.id, data });
      } else {
        await createCustomer.mutateAsync(data);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save customer', e);
    }
  };

  const handleDelete = (): void => {
    Alert.alert('Delete Customer', `Remove "${customer.name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCustomer.mutate(customer.id); navigation.goBack(); } },
    ]);
  };

  const inputRow = (
    id: string, icon: string, label: string,
    value: string, onChange: (v: string) => void,
    fieldKey: keyof FieldErrors,
    props: any = {},
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputRow,
        focused === id   && styles.inputFocused,
        errors[fieldKey] && styles.inputError,
      ]}>
        <MaterialCommunityIcons
          name={icon} size={18}
          color={errors[fieldKey] ? theme.colors.danger : focused === id ? theme.colors.primary : theme.colors.textMuted}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(v) => { onChange(v); clearError(fieldKey); }}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          {...props}
        />
      </View>
      {errors[fieldKey] ? <Text style={styles.fieldError}>{errors[fieldKey]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit' : 'New'} Customer</Text>
          <Text style={styles.headerSub}>{isEdit ? 'Update customer info' : 'Add a new customer'}</Text>
        </View>
        {isEdit ? (
          <TouchableOpacity style={styles.deleteIconBtn} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        ) : <View style={styles.headerSpacer} />}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={36} color={theme.colors.primary} />
          </View>
          {isEdit && <Text style={styles.avatarName}>{customer.name}</Text>}
        </View>

        {/* Basic details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Basic Details</Text>
          </View>
          {inputRow('name', 'account-outline', 'Full Name *', name, setName, 'name', { placeholder: 'e.g. Rahul Sharma' })}
          {inputRow('phone', 'phone-outline', 'Phone Number', phone, setPhone, 'phone', { placeholder: '9876543210', keyboardType: 'phone-pad' })}
        </View>

        {/* Additional info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Additional Info</Text>
          </View>
          {inputRow('email', 'email-outline', 'Email Address', email, setEmail, 'email', { placeholder: 'rahul@example.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Address</Text>
            <View style={[styles.inputRow, styles.inputMulti, focused === 'address' && styles.inputFocused]}>
              <MaterialCommunityIcons
                name="map-marker-outline" size={18}
                color={focused === 'address' ? theme.colors.primary : theme.colors.textMuted}
                style={styles.iconTop}
              />
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Street, City, State..."
                placeholderTextColor={theme.colors.textMuted}
                multiline numberOfLines={3}
                onFocus={() => setFocused('address')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isPending && styles.buttonDisabled]}
          onPress={handleSave} disabled={isPending} activeOpacity={0.85}>
          {isPending ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <MaterialCommunityIcons name={isEdit ? 'content-save-outline' : 'account-plus-outline'} size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create Customer'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.colors.surfaceSecondary, paddingTop: 0 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  headerCenter:   { flex: 1, alignItems: 'center' },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary, textAlign: 'center' },
  headerSub:      { fontSize: 12, color: theme.colors.textMuted, textAlign: 'center', marginTop: 1 },
  headerSpacer:   { width: 36 },
  deleteIconBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.dangerLight, justifyContent: 'center', alignItems: 'center' },
  scroll:         { flex: 1 },
  scrollContent:  { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },
  avatarWrap:     { alignItems: 'center', paddingVertical: 8, gap: 8 },
  avatar:         { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.primary + '40' },
  avatarName:     { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  card:           { backgroundColor: '#fff', borderRadius: theme.radius.xl, padding: 18, borderWidth: 1, borderColor: theme.colors.borderLight, ...theme.shadow.sm },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle:      { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary },
  fieldWrap:      { marginBottom: 12 },
  label:          { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 6, letterSpacing: 0.3 },
  inputRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 2 },
  inputMulti:     { alignItems: 'flex-start', paddingVertical: 10 },
  inputFocused:   { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  inputError:     { borderColor: theme.colors.danger, backgroundColor: theme.colors.dangerLight },
  input:          { flex: 1, color: theme.colors.textPrimary, fontSize: 14, paddingVertical: 12 },
  addressInput:   { height: 72, textAlignVertical: 'top' as const },
  iconTop:        { marginTop: 2 },
  fieldError:     { color: theme.colors.danger, fontSize: 11, fontWeight: '600', marginTop: 4 },
  footer:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  cancelBtn:      { flex: 1, paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center', backgroundColor: theme.colors.surfaceTertiary, borderWidth: 1, borderColor: theme.colors.border },
  cancelBtnText:  { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  saveBtn:        { flex: 2, flexDirection: 'row', paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, ...theme.shadow.lg },
  saveBtnText:    { color: '#fff', fontSize: 14, fontWeight: '800' },
  buttonDisabled: { opacity: 0.7 },
});
