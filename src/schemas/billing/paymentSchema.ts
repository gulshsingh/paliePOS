import { z } from 'zod';

export const paymentSchema = z.object({
  order_id:        z.string().min(1, 'Order ID is required'),
  amount_paid:     z.number({ invalid_type_error: 'Amount must be a number' }).min(0),
  payment_method:  z.enum(['cash', 'card', 'upi', 'other']),
  discount_amount: z.number().min(0).optional(),
  already_paid:    z.number().min(0).optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
