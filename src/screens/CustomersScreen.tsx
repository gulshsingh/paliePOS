import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCustomers } from '../hooks/useCustomers';
import { theme } from '../theme';
import SkeletonCard from '../components/SkeletonCard';
import type { Customer } from '../types/customer';

export default function CustomersScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState<string>('');
  const { data, isLoading, isError } = useCustomers(search);

  const customers: Customer[] =
    data?.pages.flatMap((p: any) => {
      const d = p.data as any;
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [];

  const renderCustomer = useCallback(({ item }: { item: Customer }): React.JSX.Element => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CustomerForm', { customer: item })}
      activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      </View>

      {/* Name */}
      <Text style={styles.cardName} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Phone */}
      {item.phone ? (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={11} color={theme.colors.textMuted} />
          <Text style={styles.cardPhone} numberOfLines={1}>
            {item.phone}
          </Text>
        </View>
      ) : (
        <Text style={styles.cardPhone}>No phone</Text>
      )}

      
    </TouchableOpacity>
  ), [navigation]);

  const renderEmpty = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No customers found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CustomerForm', {})}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search by name or phone..."
        placeholderTextColor={theme.colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* States */}
      {isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Error loading customers</Text>
        </View>
      ) : isLoading ? (
        <FlatList
          data={[1,2,3,4,5,6]}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={() => <SkeletonCard />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item: Customer): string => item.id}
          renderItem={renderCustomer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={
            customers.length === 0 ? styles.listEmpty : styles.listContent
          }
          ListEmptyComponent={renderEmpty}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  search: {
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Grid Row
  row: {
    paddingHorizontal: 12,
    gap: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  listEmpty: {
    flex: 1,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  cardName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardPhone: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  editText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '500',
  },
  // States
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});