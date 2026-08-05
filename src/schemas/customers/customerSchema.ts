import { z } from "zod";

export const customerSchema = z.object({
	name: z
		.string()
		.min(1, "Customer name is required")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name is too long"),
	phone: z
		.string()
		.optional()
		.refine((v) => !v || /^[0-9]{10}$/.test(v), {
			message: "Phone must be exactly 10 digits",
		}),
	email: z
		.string()
		.optional()
		.refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
			message: "Please enter a valid email address",
		}),
	address: z.string().max(250, "Address is too long").optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
