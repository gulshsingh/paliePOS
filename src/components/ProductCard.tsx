import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Product } from '../types/product';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

const EMOJIS = ['🍕', '🍔', '🥤', '🥗', '🍜', '🍣', '🥩', '🍰', '🥐', '🧁', '☕', '🍦', '🍩', '🌮', '🥪', '🍝', '🍛', '🥟', '🧆', '🥨'];

export default function ProductCard({ product, onPress }: Props) {
  const emoji = EMOJIS[product.name.length % EMOJIS.length];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => onPress(product)}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>
        ₹ {Number(product.price_per_unit).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    width: '46%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  price: {
    color: '#E04556',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
