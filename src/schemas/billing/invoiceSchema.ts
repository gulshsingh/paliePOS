import { z } from "zod";

export const invoiceSchema = z.object({
	order_id: z.string().min(1),
	notes: z.string().optional(),
	due_date: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
