import { z } from 'zod';

export const tableSchema = z.object({
  name: z
    .string()
    .min(1, 'Table name is required')
    .max(50, 'Table name is too long'),
  capacity: z
    .number({ invalid_type_error: 'Capacity must be a number' })
    .min(1, 'Capacity must be at least 1')
    .max(50, 'Capacity cannot exceed 50'),
  status: z.enum(['available', 'occupied']),
});

export type TableFormData = z.infer<typeof tableSchema>;
