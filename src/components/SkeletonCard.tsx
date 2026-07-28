import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={14} borderRadius={6} style={{ marginBottom: 4 }} />
      <Skeleton width="40%" height={14} borderRadius={6} />
    </View>
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
});
