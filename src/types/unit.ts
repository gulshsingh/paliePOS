export interface Unit {
	id: string;
	name: string;
	symbol: string;
	company_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface UnitPayload {
	name: string;
	symbol: string;
}
