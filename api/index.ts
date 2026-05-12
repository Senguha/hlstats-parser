import { Hono } from "hono";
import * as cheerio from "cheerio";
//import { prisma } from "../prisma/client.js";
import SteamAuth from "node-steam-openid";
// import { setCookie } from "hono/cookie";
// import { sign } from "hono/jwt";

import { createClient } from "redis";
import { getPresets } from "./utils/sheets.js";

const app = new Hono().basePath("/api");

const client = await createClient({url: process.env.REDIS_URL}).connect();


type GameSession = {
  date: Date;
  time: string;
  timeInSeconds: number;
};

type PlayerInfo = {
  id: string;
  name: string;
  sessions: GameSession[];
  totalConnectionTimeSeconds: number;
  createdAt: Date
};

function parseTimeToSeconds(timeString: string): number {
  // Parse time strings like "0d 02:30:45" (days hours:minutes:seconds)
  const match = timeString.match(/(\d+)d\s+(\d+):(\d+):(\d+)/);

  if (!match) {
    return 0;
  }

  const days = Number.parseInt(match[1]);
  const hours = Number.parseInt(match[2]);
  const minutes = Number.parseInt(match[3]);
  const seconds = Number.parseInt(match[4]);

  // Convert everything to seconds
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
}

const appUrl = (process.env.VERCEL_ENV==="production") ? (`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : (`https://${process.env.VERCEL_URL}`)


const steam = new SteamAuth({
  realm: `https://${appUrl}/api`,
  returnUrl: `https://${appUrl}/api/auth/steam/authenticate`,
  apiKey: `${process.env.STEAM_API_KEY}`,
});

app.get("/playerInfo/:playerId", async (c) => {
  try {
    const playerId = c.req.param("playerId");

    const redisRes = await client.get(`playerInfo:${playerId}`) as string;
    if (redisRes) {
      console.log(`Got playerInfo for ${playerId} from Cache`);
      return c.json(JSON.parse(redisRes));
    }
    

    const urlInfo = `${process.env.HLSTATS_URL}?mode=playerinfo&player=${playerId}`;
    const responseInfo = await fetch(urlInfo);

    if (!responseInfo.ok) {
      throw new Error("Failed to fetch player info");
    }

    const htmlInfo = await responseInfo.text();

    if (htmlInfo.includes("No player ID specified") || htmlInfo.includes(`No such player '${playerId}'`))
        return c.json({ error: "Invalid player ID or player not found" }, 400);    

    const $ = cheerio.load(htmlInfo);

    let playerName = "";

    $("table.data-table tr").each((index, row) => {
      let cells;
      if (index === 1) {
        cells = $(row).find("td");
        if ((cells.length === 1)) {
          playerName = $(cells[0]).text().trim();
          return;
        }
      }
    });

    // Extract total connection time
    let totalConnectionTime = "";
    let totalConnectionTimeSeconds = 0;

    // Find the row containing "Total Connection Time:"
    $("table.data-table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim();
        if (label === "Total Connection Time:") {
          totalConnectionTime = $(cells[1]).text().trim();
          // Parse the time format "2d 16:13:09h"
          totalConnectionTimeSeconds = parseTimeToSeconds(
            totalConnectionTime.replace(/h$/, "")
          );
        }
      }
    });

    if (!playerName) {
      playerName = `Player ${playerId}`;
    }

    // Fetch the player sessions page
    const urlSessions = `${process.env.HLSTATS_URL}?mode=playersessions&player=${playerId}`;
    const responseSessions = await fetch(urlSessions, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!responseSessions.ok) {
      throw new Error("Failed to fetch player sessions");
    }

    const htmlSessions = await responseSessions.text();

    // Check for error messages
    if (
      htmlSessions.includes("No player ID specified") ||
      htmlSessions.includes("ERROR")
    ) {
      throw new Error("Invalid player ID or player not found");
    }

    // Parse HTML with cheerio
    const $S = cheerio.load(htmlSessions);
    const sessions: GameSession[] = [];

    $S("table.data-table tbody tr").each((_, row) => {
      const cells = $S(row).find("td");

      if (cells.length >= 4) {
        const sDate = $S(cells[0]).text().trim();
        const time = $S(cells[3]).text().trim();

        // Only add if we have valid data and skip first row which is a header
        if (sDate && time && sDate !== "Date") {
          const date = new Date(sDate);
          sessions.push({
            date,
            time,
            timeInSeconds: parseTimeToSeconds(time),
          });
        }
      }
    });

    const Player = {
      id: playerId,
      name: playerName,
      sessions,
      totalConnectionTimeSeconds: totalConnectionTimeSeconds,
      createdAt: new Date()
    } as PlayerInfo;

    client.set(`playerInfo:${playerId}`,JSON.stringify(Player),{expiration: {type: "EX", value: 1*3600}}); // 1 h cache
    console.log(`Got playerInfo for ${playerId} from DB`);

    return c.json(Player);
  } catch (error) {
    console.error("Error parsing player info:", error);
    return c.json({ error: "Failed to parse player info" }, 500);
  }
});

app.get("/hlstatsid", async (c) => {
  const steamID = c.req.query("steamid");
  if (!steamID) return c.json({ error: "No steamID provided" }, 400);

  const redisRes = await client.get(`hlstatsid:${steamID}`)

  if (redisRes) {
      console.log(`Set playerID for ${steamID} to ${redisRes} from Cache`);
    return c.json({ playerID: redisRes });
  }

  const url = `${process.env.HLSTATS_URL}?mode=search&q=${steamID}&st=uniqueid`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch player info");
  }
  const html = await response.text();
  if (html.includes("Search results: 0 items matching"))
    return c.json({ error: "Invalid player ID or player not found" }, 400);

  const $ = cheerio.load(html);

  let playerID = "";

  $("table.data-table tr").each((index, row) => {
    let cells;
    if (index === 5) {
      cells = $(row).find("td");
      playerID = $(cells[3]).text().trim();
      return;
    }
  });
  if (!playerID) {
    return c.json({ error: "Invalid player ID or player not found" }, 400);
  }

  const pIdCleaned = playerID.replace(/\D/g, "");

  client.set(`hlstatsid:${steamID}`, pIdCleaned);
  console.log(`Set playerID for ${steamID} to ${pIdCleaned} from DB`);

  return c.json({ playerID: pIdCleaned });
});

app.get("/auth/steam", async (c) => {
  const redirectUrl = await steam.getRedirectUrl();
  return c.redirect(redirectUrl);
});

app.get("/auth/steam/authenticate", async (c) => {
  try {
    const user = await steam.authenticate(c.req);

    const dbUser = user
    // const dbUser = await prisma.user.findFirst({
    //   where: {
    //     steamID: user.steamid,
    //   },
    // });

    if (!dbUser) return c.json({ error: "Unauthorised steam user" }, 401);

    // const { _json, ...dbUser1 } = dbUser;

    // const jwt = await sign(dbUser1, "assdfsdfs");

    // setCookie(c, "jwt_token", jwt, {
    //   httpOnly: true,
    //   maxAge: 86400 * 30,
    //   secure: true,
    //   sameSite: "Lax",
    // });

    return c.json(user, 200);
  } catch (error) {
    return c.json(error, 500);
  }
});

app.get("/presets", async (c)=> {

  try {

    const redisRes = await client.get("presets")

    if (redisRes) {
      console.log(`Presets got from Cache`);
      return c.json(JSON.parse(redisRes.toString()));
    }

    const presetResult = await getPresets()

    client.set("presets",JSON.stringify(presetResult),{expiration: {type: "EX", value: 1*3600}}); // 1 hour cache
    console.log("Presets from Sheets");
    return c.json(presetResult)

  } catch {
    return c.json({error:"Error getting player presets"},400)
  }
})

app.get("/hello", (c)=>{
return c.text(`hallo`)
})

export default app;
