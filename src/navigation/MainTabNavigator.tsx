import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  
} from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CounterScreen from '../screens/CounterScreen';
import CustomersScreen from '../screens/CustomersScreen';
import ProductsScreen from '../screens/ProductsScreen';
import TablesScreen from '../screens/TablesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ConfigurationScreen from '../screens/ConfigurationScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();


const TAB_CONFIG = [
  { name: 'Counter',       label: 'POS',       icon: 'point-of-sale',         iconActive: 'point-of-sale' },
  { name: 'Customers',     label: 'Customers', icon: 'account-group-outline', iconActive: 'account-group' },
  { name: 'Products',      label: 'Menu',      icon: 'food-outline',          iconActive: 'food' },
  { name: 'Tables',        label: 'Tables',    icon: 'table-furniture',       iconActive: 'table-furniture' },
  { name: 'Reports',       label: 'Reports',   icon: 'chart-bar-stacked',     iconActive: 'chart-bar' },
  { name: 'Settings',      label: 'Settings',  icon: 'cog-outline',           iconActive: 'cog' },
];

// ── Animated tab item ─────────────────────────────────────
function TabItem({
  label, icon, iconActive, focused, onPress, onLongPress,
}: {
  label: string;
  icon: string;
  iconActive: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 180,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, bgOpacity]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        {/* Pill background */}
        <Animated.View
          style={[styles.pill, { opacity: bgOpacity }]}
          pointerEvents="none"
        />
        <MaterialCommunityIcons
          name={focused ? iconActive : icon}
          size={22}
          color={focused ? theme.colors.primary : theme.colors.textMuted}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Custom tab bar ────────────────────────────────────────
function CustomTabBar({ state,  navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const cfg = TAB_CONFIG.find((t) => t.name === route.name)!;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            label={cfg.label}
            icon={cfg.icon}
            iconActive={cfg.iconActive}
            focused={focused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

// ── Navigator ─────────────────────────────────────────────
export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Counter"   component={CounterScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Products"  component={ProductsScreen} />
      <Tab.Screen name="Tables"    component={TablesScreen} />
      <Tab.Screen name="Reports"   component={ReportsScreen} />
      <Tab.Screen name="Settings"  component={ConfigurationScreen} />
    </Tab.Navigator>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 4,
    height: 68,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
