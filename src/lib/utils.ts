import { clsx, type ClassValue } from "clsx";
import SteamID from "steamid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type searchQuerry =
  | {
      type: "HLStatsID";
      value: string;
    }
    |{
      type: "SteamID",
      value: SteamID
    }
  | {
      type: "Invalid";
    };

export function parseSearchQuery(query: string | undefined): searchQuerry {
  if (typeof query === "undefined") return { type: "Invalid" };
  try {
    const steamID = new SteamID(query);
    if (steamID.isValidIndividual()) {
      return { type: "SteamID", value: steamID };
    } else throw new Error("Invalid SteamID");
  } catch {
    if (!Number.isInteger(Number(query))) {
      return { type: "Invalid" };
    } else {
      return { type: "HLStatsID", value: query };
    }
  }
}
