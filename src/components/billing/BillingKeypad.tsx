import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface Props {
  value: string;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'];

export default function BillingKeypad({ value, onKeyPress, onDelete, onClear }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayText}>
          {value || '0'} F
        </Text>
      </View>
      <View style={styles.keys}>
        {KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => onKeyPress(key)}>
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={onClear}>
          <Text style={[styles.keyText, { color: theme.colors.danger }]}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={onDelete}>
          <Text style={[styles.keyText, { color: theme.colors.warning }]}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  display: {
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  displayText: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  key: {
    width: '30%',
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
});
