import { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Product } from '../types/product';
import { theme } from '../theme';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

const EMOJIS = ['🍕', '🍔', '🥤', '🥗', '🍜', '🍣', '🥩', '🍰', '🥐', '🧁', '☕', '🍦', '🍩', '🌮', '🥪', '🍝', '🍛', '🥟', '🧆', '🥨'];

// Soft background colors for the emoji tile
const TILE_COLORS = [
  '#FFF3E8', '#FFF0F0', '#F0FFF4', '#F0F4FF',
  '#FFFBF0', '#F5F0FF', '#F0FAFF', '#FFF0F8',
];

function ProductCard({ product, onPress }: Props) {
  const emoji = EMOJIS[product.name.length % EMOJIS.length];
  const tileBg = TILE_COLORS[product.name.length % TILE_COLORS.length];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => onPress(product)}>

      {/* Emoji tile */}
      <View style={[styles.emojiTile, { backgroundColor: tileBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          ₹{Number(product.price_per_unit).toLocaleString()}
        </Text>
      </View>

      {/* Add button */}
      <View style={styles.addBtn}>
        <MaterialCommunityIcons name="plus" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    margin: 5,
    width: '46.5%',
    overflow: 'hidden',
    ...theme.shadow.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emojiTile: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
  },
  info: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  price: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
});
