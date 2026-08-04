import { z } from 'zod';

export const orderItemSchema = z.object({
  product_id: z.string(),
  quantity:   z.number().min(1),
  price:      z.number().min(0),
  total:      z.number().min(0),
});

export const orderSchema = z.object({
  table_id:        z.string().nullable().optional(),
  account_id:      z.string().nullable().optional(),
  total_amount:    z.number().min(0),
  tax_amount:      z.number().min(0),
  discount_amount: z.number().min(0),
  grand_total:     z.number().min(0),
  items:           z.array(orderItemSchema).min(1, 'At least one item required'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
