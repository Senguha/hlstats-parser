import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Preset, StaticPreset } from "@/types/types";
import { presetsStatic } from "@/lib/presets";

type PresetState = {
  // === STATE ===
  presets: Preset[];
  staticPresets: StaticPreset[];
  activePreset: string;

  // === ACTIONS ===
  addPreset: (preset: Preset) => void;
  deletePreset: (presetName: string) => void;
  updatePreset: (oldName: string, newPreset: Preset) => void;
  setActivePreset: (preset: string) => void;
  refreshStaticPresets:()=> void;
};

export const usePresetStore = create<PresetState>()(
  persist(
    (set) => ({
      presets: [],
      staticPresets: [],
      activePreset: "",

      refreshStaticPresets: () => {
        set((state)=>{
          const staticNames = presetsStatic.map((preset)=>preset.name)
          const initPresets = state.presets.filter((p)=> !staticNames.includes(p.name))
          return {presets: initPresets, staticPresets: presetsStatic};
        })
      },
      addPreset: (preset) => {
        set((state) => {
          // Check if preset with same name already exists
          const exists = state.presets.some((p) => p.name === preset.name);
          if (exists) {
            throw new Error(`Preset "${preset.name}" already exists`);
          }

          const newPreset: Preset = {
            ...preset,
          };

          return {
            presets: [...state.presets, newPreset],
          };
        });
      },

      /**
       * Deletes a preset by name.
       */
      deletePreset: (presetName) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.name !== presetName),
        }));
      },

      /**
       * Updates an existing preset.
       */
      updatePreset: (oldName, newPreset) => {
        set((state) => ({
          presets: state.presets.map((p) =>
            p.name === oldName ? { ...newPreset } : p
          ),
        }));
      },
      setActivePreset: (preset) => {
        set(() => ({
          activePreset: preset,
        }));
      },
    }),
    {
      name: "saved-presets",
      onRehydrateStorage: () => (state) => {
        // This runs after the store loads from localStorage
        if (state) {
          state.refreshStaticPresets();
        }
      },
    }
  )
);
