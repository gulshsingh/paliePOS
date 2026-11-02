import type { ApiResponse } from "../../types/api";
import type { RolePermissionItem } from "../../types/permission";
import { api } from "../client";

export const getRolePermissions = (roleId: string) =>
	api.get<ApiResponse<RolePermissionItem[]>>("/role-permissions", {
		params: { role_id: roleId },
	});
