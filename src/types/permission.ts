export type PermissionValue =
	| boolean
	| { description?: string; display_name?: string };

export type ResourcePermissions = Record<string, PermissionValue>;

export interface RolePermissionItem {
	id: string;
	role_id: string;
	company_id: string;
	permissions: Record<string, ResourcePermissions>;
	created_at: string;
}

export interface UserProfile {
	id: string;
	company_id: string;
	role: string;
	full_name: string;
	phone?: string;
	role_id: string;
	plan?: string;
	has_custom_permissions?: boolean;
	created_at?: string;
	updated_at?: string;
}
