import { z } from "zod";

export const unitSchema = z.object({
	name: z.string().min(1, "Unit name is required"),
	symbol: z.string().optional(),
});

export type UnitFormData = z.infer<typeof unitSchema>;
