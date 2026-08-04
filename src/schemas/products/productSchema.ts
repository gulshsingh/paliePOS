import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  price_per_unit: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
    .max(999999, 'Price is too high'),
  cost_price: z
    .number({ invalid_type_error: 'Cost price must be a number' })
    .min(0, 'Cost price cannot be negative')
    .optional(),
  tax_percentage: z
    .number({ invalid_type_error: 'Tax must be a number' })
    .min(0, 'Tax cannot be negative')
    .max(100, 'Tax cannot exceed 100%')
    .optional(),
  category_id:     z.string().nullable().optional(),
  unit_id:         z.string().nullable().optional(),
  open_stock:      z.number().min(0).optional(),
  is_raw_material: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
