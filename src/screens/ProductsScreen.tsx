import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types/product';
import { theme } from '../theme';
import Skeleton from '../components/Skeleton';

const EMOJIS = ['🍕', '🍔', '🥤', '🥗', '🍜', '🍣', '🥩', '🍰', '🥐', '🧁', '☕', '🍦', '🍩', '🌮', '🥪', '🍝', '🍛', '🥟'];
const TILE_COLORS = ['#FFF3E8', '#FFF0F1', '#F0FFF4', '#F0F4FF', '#FFFBF0', '#F5F0FF', '#F0FAFF', '#FFF0F8'];

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts();

  const allProducts =
    data?.pages.flatMap((p) => {
      const d = (p.data as any);
      return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? [];
    }) ?? [];

  const filtered = search
    ? allProducts.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;

  const renderItem = useCallback(({ item }: { item: Product }) => {
    const emoji   = EMOJIS[item.name.length % EMOJIS.length];
    const tileBg  = TILE_COLORS[item.name.length % TILE_COLORS.length];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('ProductForm', { product: item })}>

        <View style={[styles.emojiTile, { backgroundColor: tileBg }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>₹{Number(item.price_per_unit).toLocaleString()}</Text>
        </View>

        <View style={styles.editIcon}>
          <MaterialCommunityIcons name="pencil-outline" size={13} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Menu</Text>
          <Text style={styles.headerTitle}>
            Products
           
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ProductForm', {})}
          activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

    

      {/* Grid */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(i) => String(i)}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={() => (
            <View style={styles.skeletonCard}>
              <Skeleton width="100%" height={72} borderRadius={12} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={11} borderRadius={6} style={{ marginBottom: 4 }} />
              <Skeleton width="45%" height={11} borderRadius={6} />
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
            <View style={styles.empty}>
              <MaterialCommunityIcons name="food-off-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>{search ? 'Try a different keyword' : 'Add your first product'}</Text>
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
  headerCount: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    ...theme.shadow.lg,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  searchWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  resultsRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  list: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  emojiTile: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 34,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 10,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  editIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
