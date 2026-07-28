import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useDashboard, useStockSummary, useLowStock } from '../hooks/useInventory';
import { theme } from '../theme';

type ReportTab = 'dashboard' | 'stock' | 'lowstock';

export default function ReportsScreen() {
  const [tab, setTab] = useState<ReportTab>('dashboard');
  const { data: dashboardData } = useDashboard();
  const { data: stockData } = useStockSummary();
  const { data: lowStockData } = useLowStock();

  const dashboard = (dashboardData as any)?.data?.data?.data;
  const stock = (stockData as any)?.data?.data?.data;
  const lowStock = (lowStockData as any)?.data?.data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      <View style={styles.tabs}>
        {(['dashboard', 'stock', 'lowstock'] as ReportTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'dashboard'
                ? 'Dashboard'
                : t === 'stock'
                  ? 'Stock'
                  : 'Low Stock'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {tab === 'dashboard' && dashboard && (
          <View>
            <View style={styles.cardRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {dashboard.total_orders_today}
                </Text>
                <Text style={styles.statLabel}>Orders Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  ₹ {dashboard.total_revenue_today?.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Revenue Today</Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {dashboard.total_customers}
                </Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {dashboard.total_products}
                </Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
            </View>
          </View>
        )}

        {tab === 'stock' && stock && (
          <View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stock.total_products}</Text>
              <Text style={styles.statLabel}>Total Products</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ₹ {stock.total_stock_value?.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Stock Value</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stock.low_stock_count}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.warning }]}>
                Low Stock Items
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stock.out_of_stock_count}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.danger }]}>
                Out of Stock
              </Text>
            </View>
          </View>
        )}

        {tab === 'lowstock' && (
          <View>
            {lowStock.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>
                  No low stock items
                </Text>
              </View>
            ) : (
              lowStock.map((item: any) => (
                <View key={item.id} style={styles.lowStockItem}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} {item.unit} / Min: {item.min_stock_level}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  lowStockItem: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  itemQty: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
