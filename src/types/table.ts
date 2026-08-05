export interface RestaurantTable {
	id: string;
	name: string;
	capacity: number;
	status: "available" | "occupied";
	company_id?: string;
	created_at?: string;
	updated_at?: string;
}
