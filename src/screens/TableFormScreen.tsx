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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCreateTable, useUpdateTable, useDeleteTable } from '../hooks/useTables';
import { theme } from '../theme';

export default function TableFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const table = route.params?.table;
  const isEdit = !!table;

  const [name, setName] = useState(table?.name ?? '');
  const [capacity, setCapacity] = useState(String(table?.capacity ?? ''));
  const [status, setStatus] = useState(table?.status ?? 'available');

  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();

  const handleSave = async () => {
    const data = { name, capacity: Number(capacity), status };
    try {
      if (isEdit) {
        await updateTable.mutateAsync({ id: table.id, data });
      } else {
        await createTable.mutateAsync(data);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save table', e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
       
        <Text style={styles.title}>{isEdit ? 'Edit' : 'New'} Table</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Table Details</Text>

          <Text style={styles.label}>Table Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Table 1"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Capacity</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="4"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {[
              { key: 'available', icon: '🟢', label: 'Available' },
              { key: 'occupied', icon: '🔴', label: 'Occupied' },
            ].map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.statusChip,
                  status === s.key && styles.activeChip,
                ]}
                onPress={() => setStatus(s.key)}>
                <Text style={styles.chipIcon}>{s.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    status === s.key && styles.activeChipText,
                  ]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isEdit && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              deleteTable.mutate(table.id);
              navigation.goBack();
            }}>
            <Text style={styles.deleteBtnText}>Delete Table</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {isEdit ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  activeChip: {
    backgroundColor: '#fff',
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
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
