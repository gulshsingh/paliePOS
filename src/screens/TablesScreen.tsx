import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTables } from '../hooks/useTables';
import { theme } from '../theme';
import SkeletonCard from '../components/SkeletonCard';
import { RestaurantTable } from '../types/table';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function TablesScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useTables();
  const tables: RestaurantTable[] = (data as any)?.data?.data?.data ?? [];
  const total = tables.length;
  const available = tables.filter((t) => t.status === 'available').length;
  const occupied = tables.filter((t) => t.status === 'occupied').length;


  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return {
          dot: '●',
          dotColor: theme.colors.success,
          bgColor: '#ECFDF5',
          textColor: '#065F46',
          label: 'Available',
        };
      case 'occupied':
        return {
          dot: '●',
          dotColor: theme.colors.danger,
          bgColor: '#FEF2F2',
          textColor: '#991B1B',
          label: 'Occupied',
        };
      default:
        return {
          dot: '●',
          dotColor: theme.colors.textMuted,
          bgColor: '#F8FAFC',
          textColor: '#475569',
          label: 'Unknown',
        };
    }
  };

  const renderCard = useCallback(({ item }: { item: RestaurantTable }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, { borderLeftColor: statusStyle.dotColor }]}
        onPress={() => navigation.navigate('TableForm', { table: item })}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardInfoRow}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardInfo}>{item.capacity} guests</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusStyle.bgColor }]}>
          <Text style={[styles.dot, { color: statusStyle.dotColor }]}>
            {statusStyle.dot}
          </Text>
          <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
            {statusStyle.label}
          </Text>
        </View>
       
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Restaurant</Text>
          <Text style={styles.title}>Tables</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TableForm', {})}>
          <Text style={styles.addBtnText}>+ Add Table</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>{available}</Text>
          <Text style={[styles.statLabel, { color: '#065F46' }]}>Available</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.statNumber, { color: theme.colors.danger }]}>{occupied}</Text>
          <Text style={[styles.statLabel, { color: '#991B1B' }]}>Occupied</Text>
        </View>
      </View>

      {isLoading ? (
        <FlatList
          data={[1,2,3,4]}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={() => <SkeletonCard />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No tables yet</Text>
              <Text style={styles.emptySubtext}>Tap + Add Table to get started</Text>
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
    paddingBottom: 16,
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
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
  statsRow: {
  flexDirection: 'row',
  marginHorizontal: 16,
  marginBottom: 16,
  gap: 8,
},
statCard: {
  flex: 1,
  height: 78,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
  statNumber: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
 card: {
  width: CARD_WIDTH,
  backgroundColor: '#F8FAFC',
  borderRadius: 20,
  borderLeftWidth: 4,
  padding: 16,
  borderWidth: 1,
  borderColor: '#E2E8F0',
  elevation: 0,
  shadowOpacity: 0,
},
  cardTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardInfo: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  dot: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#475569',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
});
