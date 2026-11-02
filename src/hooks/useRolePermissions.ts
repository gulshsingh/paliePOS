import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getRolePermissions } from "../api/services/rolePermissions";
import { usePermissionStore } from "../store/permissionStore";
import type { RolePermissionItem } from "../types/permission";

export const ROLE_PERMISSIONS_QUERY_KEY = ["role-permissions"];

export function useRolePermissions(explicitRoleId?: string | null) {
	const storeRoleId = usePermissionStore((s) => s.roleId);
	const setRoleId = usePermissionStore((s) => s.setRoleId);
	const setPermissions = usePermissionStore((s) => s.setPermissions);

	const [activeRoleId, setActiveRoleId] = useState<string | null>(
		explicitRoleId ?? storeRoleId ?? null,
	);

	// Hydrate or sync role_id from explicit prop, store, or AsyncStorage
	useEffect(() => {
		if (explicitRoleId) {
			setActiveRoleId(explicitRoleId);
			setRoleId(explicitRoleId);
			return;
		}
		if (storeRoleId) {
			setActiveRoleId(storeRoleId);
			return;
		}
		AsyncStorage.getItem("role_id").then((storedId) => {
			if (storedId) {
				setActiveRoleId(storedId);
				setRoleId(storedId);
			}
		});
	}, [explicitRoleId, storeRoleId, setRoleId]);

	const query = useQuery({
		queryKey: [...ROLE_PERMISSIONS_QUERY_KEY, activeRoleId],
		queryFn: async () => {
			const token = await AsyncStorage.getItem("token");
			if (!token || !activeRoleId) return null;
			const res = await getRolePermissions(activeRoleId);
			return res.data;
		},
		enabled: !!activeRoleId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	// Sync fetched permissions to Zustand store & AsyncStorage cache
	useEffect(() => {
		if (query.data) {
			const d = query.data as {
				data?: { data?: RolePermissionItem[] } | RolePermissionItem[];
			};
			const list =
				(d?.data as { data?: RolePermissionItem[] })?.data ?? d?.data ?? [];
			const item = Array.isArray(list) ? list[0] : (list as RolePermissionItem);
			if (item?.permissions) {
				setPermissions(item.permissions);
				AsyncStorage.setItem(
					"permissions",
					JSON.stringify(item.permissions),
				).catch(() => {});
			}
		}
	}, [query.data, setPermissions]);

	return query;
}
