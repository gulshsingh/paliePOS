import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from '../api/services/companies';
import { useAuth } from '../navigation/AppNavigator';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { theme } from '../theme';

export default function ConfigurationScreen() {
  const [activeSection, setActiveSection] = useState<'company' | 'categories' | 'profile'>('company');
  const queryClient = useQueryClient();

  const { data: companyData } = useQuery({
    queryKey: ['company'],
    queryFn: () => getCompany(),
  });
  const company = companyData?.data?.data;

  const { data: categoriesData } = useCategories();
  const categories = (categoriesData as any)?.data ?? [];
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const { signOut } = useAuth();
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name ?? '');
      setEmail(company.email ?? '');
      setPhone(company.phone ?? '');
      setAddress(company.address ?? '');
    }
  }, [company]);

  const updateCompanyMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company'] }),
  });

  const handleLogout = () => {
    signOut();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      createCategory.mutate({ name: newCategory.trim() });
      setNewCategory('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.sectionTabs}>
        {(['company', 'categories', 'profile'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sectionTab, activeSection === s && styles.activeSectionTab]}
            onPress={() => setActiveSection(s)}>
            <Text
              style={[
                styles.sectionTabText,
                activeSection === s && styles.activeSectionTabText,
              ]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeSection === 'company' && (
          <View>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
            />
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() =>
                updateCompanyMutation.mutate({ name, email, phone, address })
              }>
              <Text style={styles.saveBtnText}>Save Company</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeSection === 'categories' && (
          <View>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="New category name"
                placeholderTextColor={theme.colors.textMuted}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {categories.map((c: any) => (
              <View key={c.id} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{c.name}</Text>
                <TouchableOpacity onPress={() => deleteCategory.mutate(c.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeSection === 'profile' && (
          <View>
            <Text style={styles.infoText}>
              Logged in as {company?.email ?? 'N/A'}
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
  },
  activeSectionTab: {
    backgroundColor: theme.colors.accent,
  },
  sectionTabText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeSectionTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
