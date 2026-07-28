import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from '../api/services/companies';
import { useAuth } from '../navigation/AppNavigator';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { theme } from '../theme';

type Section = 'company' | 'categories' | 'profile';

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'company',    label: 'Restaurant', icon: 'store-outline' },
  { key: 'categories', label: 'Categories', icon: 'shape-outline' },
  { key: 'profile',    label: 'Account',    icon: 'account-circle-outline' },
];

export default function ConfigurationScreen() {
  // ── All useState first — never interleave with other hooks ──
  const [activeSection, setActiveSection] = useState<Section>('company');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [address, setAddress] = useState('');
  const [newCat, setNewCat]   = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  // ── Other hooks after all state ──
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  const { data: companyData } = useQuery({
    queryKey: ['company'],
    queryFn: () => getCompany(),
  });
  const company = companyData?.data?.data;

  const { data: categoriesData } = useCategories();
  const categories = (categoriesData as any)?.data ?? [];
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    if (company) {
      setName(company.name ?? '');
      setEmail(company.email ?? '');
      setPhone(company.phone ?? '');
      setAddress(company.address ?? '');
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company'] }),
  });

  const handleAddCategory = () => {
    if (newCat.trim()) {
      createCategory.mutate({ name: newCat.trim() });
      setNewCat('');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  const field = (id: string, icon: string, label: string, value: string, onChange: (v: string) => void, props: any = {}) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused === id && styles.inputFocused]}>
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color={focused === id ? theme.colors.primary : theme.colors.textMuted}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          {...props}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Configuration</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="cog" size={20} color={theme.colors.primary} />
        </View>
      </View>

      {/* Section tabs */}
      <View style={styles.tabRow}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.tabPill, activeSection === s.key && styles.tabPillActive]}
            onPress={() => setActiveSection(s.key)}
            activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={s.icon}
              size={14}
              color={activeSection === s.key ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text style={[styles.tabText, activeSection === s.key && styles.tabTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Company ── */}
        {activeSection === 'company' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="store-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Restaurant Details</Text>
            </View>

            {field('name',    'store-outline',    'Restaurant Name', name,    setName,    { placeholder: 'Your Restaurant' })}
            {field('email',   'email-outline',    'Email Address',   email,   setEmail,   { placeholder: 'contact@restaurant.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
            {field('phone',   'phone-outline',    'Phone Number',    phone,   setPhone,   { placeholder: '9876543210', keyboardType: 'phone-pad' })}
            {field('address', 'map-marker-outline','Address',        address, setAddress, { placeholder: 'Full address...', multiline: true })}

            <TouchableOpacity
              style={[styles.saveBtn, updateMutation.isPending && { opacity: 0.7 }]}
              onPress={() => updateMutation.mutate({ name, email, phone, address })}
              disabled={updateMutation.isPending}
              activeOpacity={0.85}>
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Categories ── */}
        {activeSection === 'categories' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="shape-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Menu Categories</Text>
            </View>

            {/* Add row */}
            <View style={styles.addRow}>
              <View style={[styles.inputRow, styles.addInput, focused === 'cat' && styles.inputFocused]}>
                <MaterialCommunityIcons name="tag-outline" size={16} color={focused === 'cat' ? theme.colors.primary : theme.colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={newCat}
                  onChangeText={setNewCat}
                  placeholder="New category name"
                  placeholderTextColor={theme.colors.textMuted}
                  onFocus={() => setFocused('cat')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={handleAddCategory}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddCategory}
                activeOpacity={0.85}>
                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Category list */}
            {categories.length === 0 ? (
              <View style={styles.emptyCategories}>
                <MaterialCommunityIcons name="shape-plus" size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No categories yet</Text>
              </View>
            ) : (
              categories.map((c: any, idx: number) => (
                <View
                  key={c.id}
                  style={[styles.categoryRow, idx === categories.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.categoryLeft}>
                    <View style={styles.catDot} />
                    <Text style={styles.categoryName}>{c.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteCategory.mutate(c.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Profile ── */}
        {activeSection === 'profile' && (
          <>
            {/* Profile card */}
            <View style={styles.card}>
              <View style={styles.profileAvatar}>
                <MaterialCommunityIcons name="store" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.profileName}>{name || 'Your Restaurant'}</Text>
              <Text style={styles.profileEmail}>{company?.email ?? 'Not set'}</Text>
            </View>

            {/* Info rows */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>App Info</Text>
              </View>
              {[
                { label: 'App Version', value: '1.0.0' },
                { label: 'Platform',    value: 'PALIE POS' },
              ].map((row) => (
                <View key={row.label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
              <MaterialCommunityIcons name="logout" size={18} color={theme.colors.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  tabPillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  fieldWrap: { marginBottom: 10 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 11,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    marginTop: 8,
    ...theme.shadow.lg,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  addInput: { flex: 1 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...theme.shadow.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  categoryName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCategories: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.dangerLight,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.danger + '40',
  },
  logoutText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
});
