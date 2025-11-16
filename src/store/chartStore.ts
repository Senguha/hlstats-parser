import { create } from "zustand";
import type { ChartOption } from "@/types/types";

export type ChartOptionsStore = {
    option : ChartOption,
    setChartOption: (option: ChartOption) => void
}

export const useChartOptions = create<ChartOptionsStore>()(
    (set)=>({
        option: {type: "Full"},
        setChartOption: (option: ChartOption) => set({option})
    })
)

