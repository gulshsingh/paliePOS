import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function SkeletonListItem() {
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} borderRadius={6} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={13} borderRadius={6} />
      </View>
      <Skeleton width={50} height={30} borderRadius={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
});
