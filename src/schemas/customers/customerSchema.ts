import { z } from "zod";

export const customerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Customer name is required")
		.max(100, "Name is too long"),
	phone: z
		.string()
		.optional()
		.refine(
			(v) => !v || v.trim().length === 0 || /^[0-9]{10}$/.test(v.trim()),
			{
				message: "Phone must be exactly 10 digits",
			},
		),
	email: z
		.string()
		.optional()
		.refine(
			(v) =>
				!v ||
				v.trim().length === 0 ||
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
			{
				message: "Please enter a valid email address",
			},
		),
	address: z.string().max(250, "Address is too long").optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
