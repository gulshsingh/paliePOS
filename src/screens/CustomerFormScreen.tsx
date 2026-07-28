import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers'; // Assuming you have delete hook
import { theme } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CustomerFormScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const customer = route.params?.customer;
  const isEdit = !!customer;

  const [name, setName] = useState<string>(customer?.name ?? '');
  const [email, setEmail] = useState<string>(customer?.email ?? '');
  const [phone, setPhone] = useState<string>(customer?.phone ?? '');
  const [address, setAddress] = useState<string>(customer?.address ?? '');

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer(); // Add this in your hooks if not present

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  const handleSave = async (): Promise<void> => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Customer name is required.');
      return;
    }

    const data = { 
      name: name.trim(), 
      email: email.trim(), 
      phone: phone.trim(), 
      address: address.trim() 
    };

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
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomer.mutate(customer.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* Header - Exact Copy */}
      <View style={styles.header}>
       
        <Text style={styles.title}>{isEdit ? 'Edit' : 'New'} Customer</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Card 1 - Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. GULSHAN BAGHEL"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Card 2 - Extra Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Extra Information</Text>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. gulshan@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={[styles.inputContainer, styles.addressContainer]}>
            <Ionicons name="location-outline" size={18} color="#94A3B8" style={styles.addressIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="House/Flat No, Street, City..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

      </ScrollView>

      {/* Footer - Exact Copy */}
      <View style={styles.footer}>
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Update' : 'Create'}</Text>
          )}
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Copied from Table
    paddingTop: 54,             // Copied from Table
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    backgroundColor: '#F1F5F9', // Copied from Table
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#475569',           // Copied from Table
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#0F172A',           // Copied from Table
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',    // Copied from Table
    borderRadius: 20,           // Copied from Table
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    color: '#0F172A',           // Copied from Table
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#475569',           // Copied from Table
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // Copied from Table Input BG
    borderRadius: 14,           // Copied from Table Input
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',     // Copied from Table Input
    height: 50,
  },
  input: {
    flex: 1,
    color: '#0F172A',           // Copied from Table Input Text
    fontSize: 15,
    marginLeft: 10,
    padding: 0,
  },
  addressContainer: {
    height: 'auto',
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginTop: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  deleteBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,           // Copied from Table
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // Copied from Table
  },
  deleteBtnText: {
    color: theme.colors.danger, // Using theme for danger
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,                   // Copied from Table
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // Copied from Table
    backgroundColor: '#fff',   // Copied from Table
  },
  cancelBtn: {
    flex: 1,                   // Copied from Table
    paddingVertical: 14,
    borderRadius: 14,           // Copied from Table
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Copied from Table
  },
  cancelBtnText: {
    color: '#475569',           // Copied from Table
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,                   // Copied from Table
    paddingVertical: 14,
    borderRadius: 14,           // Copied from Table
    alignItems: 'center',
    backgroundColor: theme.colors.accent, // Using theme for accent
    elevation: 2,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});