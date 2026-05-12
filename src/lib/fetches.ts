import type SteamID from 'steamid';
import type { PlayerInfo, StaticPreset } from '../types/types' // Adjust path as needed



export async function fetchPlayer(playerId: string): Promise<PlayerInfo> {
  const res = await fetch(`https://${import.meta.env.VITE_VERCEL_URL}/api/playerInfo/${playerId}`);

  const data = await res.json();  
  if (!res.ok){
    throw new Error(`Error getting player info. ${data?.error}`)
  }

  return data;
}

type fetchHLStatsIDResponse = {
  status: "success";
  playerID: string;
} | {
  status: "error";
  error?: string;
};

export async function fetchHLStatsID(steamID: SteamID): Promise<fetchHLStatsIDResponse>{
  
  try {
      const steamID2 = steamID.steam2();
  const res = await fetch(`https://${import.meta.env.VITE_VERCEL_URL}/api/hlstatsid?steamid=${steamID2}`);

  const data = await res.json();  
  if (!res.ok){
    throw new Error(`Error getting player info. ${data?.error}`)
  }

  return ({status: "success", playerID: data.playerID});
  } catch (error) {
    if (error instanceof Error) {
      return ({status: "error", error: error.message});
    }
    return ({status: "error"});
  }

}

export async function getPresets(): Promise<StaticPreset[]>{
  
  try {
    console.log(`https://${import.meta.env.VITE_VERCEL_URL}/api/presets`, import.meta.env.VITE_VERCEL_URL)
    const res = await fetch(`https://${import.meta.env.VITE_VERCEL_URL}/api/presets`);
    const data = await res.json(); 
    if (!res.ok)
      throw new Error(`Error getting presets. ${data?.error}`)
    return data
  } 
  catch (error) {
    throw new Error(`Error getting presets. ${error}`)
  }
}