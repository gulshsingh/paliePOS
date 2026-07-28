import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OrdersPanel from './OrdersPanel';
import ProductsPanel from './ProductsPanel';
import BillingPanel from './BillingPanel';
import { theme } from '../theme';

type Tab = 'orders' | 'products' | 'billing';

const TABS: { key: Tab; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'billing', label: 'Cart' },
];

export default function CounterScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PALIE POS</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.activeTab]}
            onPress={() => setActiveTab(t.key)}>
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.activeTabText,
              ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'orders' && <OrdersPanel onBillToCart={() => setActiveTab('billing')} />}
        {activeTab === 'products' && <ProductsPanel />}
        {activeTab === 'billing' && <BillingPanel />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSecondary,
    padding: 4,
    margin: 8,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
