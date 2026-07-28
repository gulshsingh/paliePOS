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
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types/product';
import { theme } from '../theme';
import Skeleton from '../components/Skeleton';

const EMOJIS = ['🍕', '🍔', '🥤', '🥗', '🍜', '🍣', '🥩', '🍰', '🥐', '🧁', '☕', '🍦', '🍩', '🌮', '🥪', '🍝'];

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts();
 

  const allProducts =
    data?.pages.flatMap((p) => {
      const d = (p.data as any);
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [];

  const filtered = search
    ? allProducts.filter((p: Product) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : allProducts;

  const renderItem = useCallback(({ item }: { item: Product }) => {
    const emoji = EMOJIS[item.name.length % EMOJIS.length];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('ProductForm', { product: item })
        }>
        
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>
          ₹ {Number(item.price_per_unit).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>🍽️ Products</Text>
          <Text style={styles.count}>{allProducts.length} Products</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ProductForm', {})}>
          <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <FlatList
          data={[1,2,3,4,5,6]}
          keyExtractor={(i) => String(i)}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={() => (
            <View style={[styles.card, { paddingVertical: 20 }]}>
              <Skeleton width={32} height={32} borderRadius={16} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
              <Skeleton width="40%" height={12} borderRadius={6} />
            </View>
          )}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
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
    backgroundColor: '#F8FAFC',
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  count: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#E04556',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  search: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteBadgeText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  name: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  price: {
    color: '#E04556',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
