import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FlowDraft, FlowDraftInput } from "../types/flow";

function makeId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface FlowStore {
	drafts: FlowDraft[];
	activeDraftId: string | null;
	setActiveDraftId: (id: string | null) => void;
	saveDraft: (input: FlowDraftInput) => string;
	updateDraft: (id: string, patch: Partial<FlowDraft>) => void;
	removeDraft: (id: string) => void;
	clearDrafts: () => void;
}

export const useFlowStore = create<FlowStore>()(
	persist(
		(set, get) => ({
			drafts: [],
			activeDraftId: null,

			setActiveDraftId: (id) => set({ activeDraftId: id }),

			// Saves a draft. If the same table already has a running draft,
			// it updates that one instead of creating a duplicate.
			saveDraft: (input) => {
				const now = Date.now();
				const existing =
					input.table_id != null
						? get().drafts.find((d) => d.table_id === input.table_id)
						: undefined;

				if (existing) {
					const updated: FlowDraft = {
						...existing,
						...input,
						id: existing.id,
						created_at: existing.created_at,
						updated_at: now,
					};
					set((state) => ({
						drafts: state.drafts.map((d) =>
							d.id === existing.id ? updated : d,
						),
					}));
					return existing.id;
				}

				const draft: FlowDraft = {
					id: makeId(),
					items: input.items,
					table_id: input.table_id ?? null,
					table_name: input.table_name ?? null,
					customer_id: input.customer_id ?? null,
					customer_name: input.customer_name ?? null,
					note: input.note,
					created_at: now,
					updated_at: now,
				};
				set((state) => ({ drafts: [draft, ...state.drafts] }));
				return draft.id;
			},

			updateDraft: (id, patch) =>
				set((state) => ({
					drafts: state.drafts.map((d) =>
						d.id === id ? { ...d, ...patch, updated_at: Date.now() } : d,
					),
				})),

			removeDraft: (id) =>
				set((state) => ({
					drafts: state.drafts.filter((d) => d.id !== id),
					activeDraftId:
						state.activeDraftId === id ? null : state.activeDraftId,
				})),

			clearDrafts: () => set({ drafts: [], activeDraftId: null }),
		}),
		{
			name: "palie-flow-drafts",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
