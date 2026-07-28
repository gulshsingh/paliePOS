import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types/product';
import { theme } from '../theme';

export default function ProductsPanel() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts();
  const addToCart = useCartStore((s) => s.addToCart);
  const cartCount = useCartStore((s) => s.cart.length);

  const allProducts =
    data?.pages.flatMap((p) => {
      const d = (p.data as any);
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [];

  const filtered = useMemo(() => {
    if (search) {
      return allProducts.filter((p: Product) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return allProducts;
  }, [allProducts, search]);

  const handleAdd = (product: Product) => {
    addToCart(product);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleAdd}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <FlatList
          data={[1,2,3,4]}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          columnWrapperStyle={styles.grid}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.list}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.grid}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  search: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 10,
  },
  cartBadge: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  list: {
    paddingBottom: 16,
    paddingTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
