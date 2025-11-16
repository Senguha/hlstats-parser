import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Preset } from '@/types/types';

type PresetState = {
  // === STATE ===
  presets: Preset[];

  // === ACTIONS ===
  addPreset: (preset: Omit<Preset, 'createdAt'>) => void;
  deletePreset: (presetName: string) => void;
  updatePreset: (oldName: string, newPreset: Omit<Preset, 'createdAt'>) => void;
};

export const usePresetStore = create<PresetState>()(
  persist(
    (set) => ({
      // --- INITIAL STATE ---
      presets: [],

      // --- ACTIONS ---

      /**
       * Adds a new preset to the list.
       */
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
            p.name === oldName
              ? { ...newPreset }
              : p
          ),
        }));
      },
    }),{
      name: "saved-presets"
    }
  )
);