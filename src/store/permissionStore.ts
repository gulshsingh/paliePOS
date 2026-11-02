import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { ResourcePermissions } from "../types/permission";

interface PermissionState {
	roleId: string | null;
	permissions: Record<string, ResourcePermissions> | null;
	setRoleId: (roleId: string | null) => void;
	setPermissions: (
		permissions: Record<string, ResourcePermissions> | null,
	) => void;
	hasPermission: (resource: string, action: string) => boolean;
	clear: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
	roleId: null,
	permissions: null,
	setRoleId: (roleId) => set({ roleId }),
	setPermissions: (permissions) => set({ permissions }),
	hasPermission: (resource, action) => {
		const perms = get().permissions;
		if (!perms) return false;
		const val = perms[resource]?.[action];
		if (typeof val === "boolean") return val;
		return Boolean(val);
	},
	clear: () => {
		AsyncStorage.removeItem("role_id").catch(() => {});
		AsyncStorage.removeItem("permissions").catch(() => {});
		set({ roleId: null, permissions: null });
	},
}));
