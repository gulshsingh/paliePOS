import { z } from "zod";

export const completeProfileSchema = z.object({
	full_name: z
		.string()
		.trim()
		.min(2, "Full name is required"),
	phone: z
		.string()
		.trim()
		.min(10, "Enter a valid phone number")
		.max(15, "Enter a valid phone number")
		.regex(/^[0-9]+$/, "Phone must contain only numbers"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Include at least one uppercase letter")
		.regex(/[0-9]/, "Include at least one number"),
	company_name: z
		.string()
		.trim()
		.min(2, "Company name is required"),
});