import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { RestaurantTable } from '../types/table';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  tables: RestaurantTable[];
  onSelect: (table: RestaurantTable) => void;
  onClose: () => void;
}

export default function TableModal({ visible, tables, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Table</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tables}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tableCard,
                  item.status === 'occupied' && styles.occupied,
                ]}
                onPress={() => {
                  if (item.status !== 'occupied') {
                    onSelect(item);
                    onClose();
                  }
                }}
                disabled={item.status === 'occupied'}>
                <Text style={styles.tableName}>{item.name}</Text>
                <Text style={styles.tableInfo}>Cap: {item.capacity}</Text>
                <Text style={[styles.tableStatus, getStatusColor(item.status)]}>
                  {item.status}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'available':
      return { color: theme.colors.success };
    case 'occupied':
      return { color: theme.colors.danger };
    default:
      return { color: theme.colors.textMuted };
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: theme.colors.textMuted,
    fontSize: 20,
  },
  grid: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableCard: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  occupied: {
    opacity: 0.5,
  },
  tableName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  tableInfo: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tableStatus: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
});
