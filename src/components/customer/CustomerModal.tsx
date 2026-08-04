import { useState } from 'react';
import {
  Modal, View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Customer } from '../../types/customer';
import { theme } from '../../theme';

interface Props {
  visible: boolean;
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

const AVATAR_COLORS = ['#FFDDD2','#D2F4FF','#D2FFE8','#F4D2FF','#FFECD2','#D2E4FF','#FFD2D2','#D2FFD8'];

export default function CustomerModal({ visible, customers, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? customers.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search),
      )
    : customers;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>

          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Customer</Text>
              <Text style={styles.subtitle}>{customers.length} customers available</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or phone..."
              placeholderTextColor={theme.colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-search-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const bg = AVATAR_COLORS[(item.name?.charCodeAt(0) ?? 65) % AVATAR_COLORS.length];
                return (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => { onSelect(item); onClose(); }}
                    activeOpacity={0.8}>
                    <View style={[styles.avatar, { backgroundColor: bg }]}>
                      <Text style={styles.avatarText}>
                        {(item.name ?? '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.phone ? (
                        <Text style={styles.itemSub}>{item.phone}</Text>
                      ) : (
                        <Text style={styles.itemSubMuted}>No phone</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingBottom: 32, maxHeight: '80%' },
  handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  title:       { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  subtitle:    { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: 12, marginBottom: 8 },
  searchInput: { flex: 1, color: theme.colors.textPrimary, fontSize: 14, paddingVertical: 10 },
  empty:       { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText:   { fontSize: 14, color: theme.colors.textMuted, fontWeight: '600' },
  item:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  avatar:      { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 17, fontWeight: '800', color: theme.colors.textPrimary },
  itemInfo:    { flex: 1 },
  itemName:    { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  itemSub:     { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  itemSubMuted:{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
