import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { theme } from '../theme';

const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'packet'];

const EMOJIS = ['🍕', '🍔', '🥤', '🥗', '🍜', '🍣', '🥩', '🍰', '🥐', '🧁', '☕', '🍦', '🍩', '🌮', '🥪', '🍝', '🍛', '🥟'];
const TILE_COLORS = ['#FFF3E8', '#FFF0F1', '#F0FFF4', '#F0F4FF', '#FFFBF0', '#F5F0FF'];

export default function ProductFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const product = route.params?.product;
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(String(product?.price_per_unit ?? ''));
  const [tax, setTax] = useState(String(product?.tax_percentage ?? '0'));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [unit, setUnit] = useState(product?.unit ?? '');
  const [focused, setFocused] = useState<string | null>(null);

  const { data: categoriesData } = useCategories();
  const categories = (categoriesData as any)?.data ?? [];
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const isPending = createProduct.isPending || updateProduct.isPending;

  const emoji = name ? EMOJIS[name.length % EMOJIS.length] : '🍽️';
  const tileBg = name ? TILE_COLORS[name.length % TILE_COLORS.length] : theme.colors.surfaceSecondary;

  const handleSave = async () => {
    const data = {
      name,
      description,
      price_per_unit: Number(price),
      tax_percentage: Number(tax),
      category_id: categoryId || undefined,
      unit: unit || undefined,
    };
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save product', e);
    }
  };

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    props: any = {},
  ) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused === id && styles.inputFocused, props.multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={() => setFocused(id)}
        onBlur={() => setFocused(null)}
        {...props}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit' : 'New'} Product</Text>
          <Text style={styles.headerSub}>{isEdit ? 'Update product details' : 'Add to your menu'}</Text>
        </View>
        {isEdit ? (
          <TouchableOpacity
            style={styles.deleteIconBtn}
            onPress={() => { deleteProduct.mutate(product.id); navigation.goBack(); }}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">

        {/* Emoji preview */}
        <View style={[styles.emojiPreview, { backgroundColor: tileBg }]}>
          <Text style={styles.emojiLarge}>{emoji}</Text>
          {name ? <Text style={styles.emojiName}>{name}</Text> : <Text style={styles.emojiPlaceholder}>Product preview</Text>}
          {price ? <Text style={styles.emojiPrice}>₹{Number(price).toLocaleString()}</Text> : null}
        </View>

        {/* Card 1 — details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="food-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Product Details</Text>
          </View>
          {field('name', 'Product Name', name, setName, { placeholder: 'e.g. Veg Pizza' })}
          {field('desc', 'Description', description, setDescription, {
            placeholder: 'Short description...',
            multiline: true,
            numberOfLines: 3,
            textAlignVertical: 'top',
          })}
        </View>

        {/* Card 2 — pricing */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="tag-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Pricing</Text>
          </View>
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              {field('price', 'Price (₹)', price, setPrice, { placeholder: '0', keyboardType: 'numeric' })}
            </View>
            <View style={{ flex: 1 }}>
              {field('tax', 'Tax %', tax, setTax, { placeholder: '0', keyboardType: 'numeric' })}
            </View>
          </View>
        </View>

        {/* Card 3 — category & unit */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="shape-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Category & Unit</Text>
          </View>

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled style={{ marginBottom: 4 }}>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !categoryId && styles.chipActive]}
                onPress={() => setCategoryId('')}>
                <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>None</Text>
              </TouchableOpacity>
              {categories.map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, categoryId === c.id && styles.chipActive]}
                  onPress={() => setCategoryId(c.id)}>
                  <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.label, { marginTop: 12 }]}>Unit</Text>
          <View style={styles.chipRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.chip, unit === u && styles.chipActive]}
                onPress={() => setUnit(unit === u ? '' : u)}>
                <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isPending && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isPending}
          activeOpacity={0.85}>
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name={isEdit ? 'content-save-outline' : 'plus-circle-outline'} size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add to Menu'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emojiPreview: {
    borderRadius: theme.radius.xl,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  emojiLarge: { fontSize: 52 },
  emojiName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  emojiPlaceholder: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  emojiPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldWrap: { marginBottom: 4 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: theme.colors.surfaceSecondary,
    color: theme.colors.textPrimary,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  inputMulti: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    ...theme.shadow.lg,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
