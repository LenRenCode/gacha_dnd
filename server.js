"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, ".gacha-dnd");
const CONFIG_FILE = path.join(DATA_DIR, "access.json");
const CAMPAIGN_FILE = path.join(DATA_DIR, "campaign.json");
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function makeCode(bytes = 5) {
  return crypto.randomBytes(bytes).toString("hex");
}

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw new Error(`Cannot read ${path.basename(file)}: ${error.message}`);
  }
}

const access = loadJson(CONFIG_FILE, null) || {
  dmToken: makeCode(24),
  inviteCode: makeCode(4)
};

if (!/^[a-f0-9]{48}$/.test(access.dmToken || "") || !/^[a-f0-9]{8}$/.test(access.inviteCode || "")) {
  throw new Error("Invalid .gacha-dnd/access.json. Remove or repair it, then restart the server.");
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, `${JSON.stringify(access, null, 2)}\n`, { mode: 0o600 });
}

let campaign = loadJson(CAMPAIGN_FILE, { characters: [] });
if (!campaign || typeof campaign !== "object" || !Array.isArray(campaign.characters)) {
  throw new Error("Invalid .gacha-dnd/campaign.json. Restore a backup or remove the invalid file.");
}

function persistCampaign() {
  const temporaryFile = `${CAMPAIGN_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(campaign, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporaryFile, CAMPAIGN_FILE);
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Content-Type": MIME_TYPES[".json"],
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(value));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function validId(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 120;
}

function cleanCharacter(value, ownerKey = "", ownerName = "") {
  if (!value || typeof value !== "object" || !validId(value.id) || typeof value.name !== "string") {
    throw Object.assign(new Error("Each character must have a name and id."), { statusCode: 400 });
  }
  return {
    ...value,
    name: value.name.slice(0, 80),
    ownerKey,
    ownerName: ownerName.slice(0, 80)
  };
}

function getProfile(ownerKey) {
  return campaign.characters.filter((character) => character.ownerKey === ownerKey);
}

function serveFile(request, response, filePath) {
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      sendJson(response, 500, { error: "Unable to read the requested application file." });
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    });
    response.end(contents);
  });
}

function privateRouteToken(urlPath) {
  const match = urlPath.match(/^\/dm\/([a-f0-9]{48})\/?$/);
  return match ? match[1] : null;
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    const role = url.searchParams.get("role");
    if (role === "dm") {
      if (url.searchParams.get("token") !== access.dmToken) {
        sendJson(response, 404, { error: "Not found." });
        return;
      }
      sendJson(response, 200, { role: "dm", inviteCode: access.inviteCode, characters: campaign.characters });
      return;
    }
    if (role === "player") {
      if (url.searchParams.get("room") !== access.inviteCode) {
        sendJson(response, 404, { error: "Campaign invitation is not valid." });
        return;
      }
      const ownerKey = url.searchParams.get("owner") || "";
      sendJson(response, 200, {
        role: "player",
        characters: ownerKey ? getProfile(ownerKey) : [],
        ownerKey: ownerKey || null,
        playerName: getProfile(ownerKey)[0]?.ownerName || ""
      });
      return;
    }
    sendJson(response, 400, { error: "Role is required." });
    return;
  }

  const body = await readBody(request);
  if (request.method === "POST" && url.pathname === "/api/player/open") {
    if (body.room !== access.inviteCode || !/^[a-f0-9]{48}$/.test(body.ownerKey || "")) {
      sendJson(response, 404, { error: "Campaign invitation or player file is not valid." });
      return;
    }
    const ownerName = typeof body.playerName === "string" ? body.playerName.trim().slice(0, 80) : "";
    if (!ownerName) {
      sendJson(response, 400, { error: "Enter a player name." });
      return;
    }
    if (body.playerFile) {
      const file = body.playerFile;
      if (file.ownerKey !== body.ownerKey || !Array.isArray(file.characters) || file.characters.length > 50) {
        sendJson(response, 400, { error: "The character backup does not match this player." });
        return;
      }
      const imported = file.characters.map((character) => cleanCharacter(character, body.ownerKey, ownerName));
      const importedIds = new Set(imported.map((character) => character.id));
      const profileSize = getProfile(body.ownerKey).filter((character) => !importedIds.has(character.id)).length + importedIds.size;
      if (profileSize > 50) {
        sendJson(response, 400, { error: "A player can keep at most 50 characters." });
        return;
      }
      for (const character of imported) {
        const index = campaign.characters.findIndex((entry) => entry.id === character.id && entry.ownerKey === body.ownerKey);
        if (index < 0) campaign.characters.push(character);
        else campaign.characters[index] = character;
      }
      persistCampaign();
    }
    const characters = getProfile(body.ownerKey).map((character) => ({ ...character, ownerName }));
    campaign.characters = campaign.characters.map((character) =>
      character.ownerKey === body.ownerKey ? { ...character, ownerName } : character
    );
    persistCampaign();
    sendJson(response, 200, { role: "player", ownerKey: body.ownerKey, playerName: ownerName, characters });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/player/save") {
    if (body.room !== access.inviteCode || !/^[a-f0-9]{48}$/.test(body.ownerKey || "") || !Array.isArray(body.characters)) {
      sendJson(response, 404, { error: "Player session is not valid." });
      return;
    }
    if (body.characters.length > 50) {
      sendJson(response, 400, { error: "A player can save at most 50 characters." });
      return;
    }
    const ownerName = typeof body.playerName === "string" ? body.playerName.trim().slice(0, 80) : "Player";
    const owned = body.characters.map((character) => cleanCharacter(character, body.ownerKey, ownerName));
    campaign.characters = campaign.characters.filter((character) => character.ownerKey !== body.ownerKey).concat(owned);
    persistCampaign();
    sendJson(response, 200, { saved: owned.length });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/dm/save") {
    if (body.token !== access.dmToken || !Array.isArray(body.characters)) {
      sendJson(response, 404, { error: "Not found." });
      return;
    }
    if (body.characters.length > 500) {
      sendJson(response, 400, { error: "Campaign character limit exceeded." });
      return;
    }
    campaign.characters = body.characters.map((character) => {
      const ownerKey = typeof character.ownerKey === "string" && /^[a-f0-9]{48}$/.test(character.ownerKey) ? character.ownerKey : "";
      const ownerName = typeof character.ownerName === "string" ? character.ownerName : "";
      return cleanCharacter(character, ownerKey, ownerName);
    });
    persistCampaign();
    sendJson(response, 200, { saved: campaign.characters.length });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/dm/import") {
    if (body.token !== access.dmToken || !body.playerFile || !Array.isArray(body.playerFile.characters) || body.playerFile.characters.length > 50) {
      sendJson(response, 404, { error: "Not found or invalid character backup." });
      return;
    }
    const playerFile = body.playerFile;
    const ownerKey = typeof playerFile.ownerKey === "string" && /^[a-f0-9]{48}$/.test(playerFile.ownerKey) ? playerFile.ownerKey : "";
    const ownerName = typeof playerFile.playerName === "string" ? playerFile.playerName : "";
    const imported = playerFile.characters.map((character) => cleanCharacter(character, ownerKey, ownerName));
    const importedIds = new Set(imported.map((character) => character.id));
    const campaignSize = campaign.characters.filter((character) => !importedIds.has(character.id)).length + importedIds.size;
    if (campaignSize > 500) {
      sendJson(response, 400, { error: "Campaign character limit exceeded." });
      return;
    }
    for (const character of imported) {
      const index = campaign.characters.findIndex((entry) => entry.id === character.id);
      if (index < 0) campaign.characters.push(character);
      else campaign.characters[index] = character;
    }
    persistCampaign();
    sendJson(response, 200, { imported: imported.length });
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    if (url.pathname === "/") {
      response.writeHead(302, { Location: `/join/${access.inviteCode}/`, "Cache-Control": "no-store" });
      response.end();
      return;
    }

    const token = privateRouteToken(url.pathname);
    if (token) {
      if (token !== access.dmToken) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      if (!url.pathname.endsWith("/")) {
        response.writeHead(302, { Location: `${url.pathname}/`, "Cache-Control": "no-store" });
        response.end();
        return;
      }
      serveFile(request, response, path.join(ROOT, "index.html"));
      return;
    }

    const joinMatch = url.pathname.match(/^\/join\/([a-f0-9]{8})\/?$/);
    if (joinMatch) {
      if (joinMatch[1] !== access.inviteCode) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Campaign invitation is not valid");
        return;
      }
      if (!url.pathname.endsWith("/")) {
        response.writeHead(302, { Location: `${url.pathname}/`, "Cache-Control": "no-store" });
        response.end();
        return;
      }
      serveFile(request, response, path.join(ROOT, "index.html"));
      return;
    }

    const dmAsset = url.pathname.match(/^\/dm\/([a-f0-9]{48})\/(app\.js|styles\.css)$/);
    if (dmAsset || url.pathname.match(/^\/join\/[a-f0-9]{8}\/(app\.js|styles\.css)$/)) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        sendJson(response, 405, { error: "Method not allowed." });
        return;
      }
      const playerAsset = url.pathname.match(/^\/join\/([a-f0-9]{8})\/(app\.js|styles\.css)$/);
      if (dmAsset && dmAsset[1] !== access.dmToken) {
        sendJson(response, 404, { error: "Not found." });
        return;
      }
      if (playerAsset && playerAsset[1] !== access.inviteCode) {
        sendJson(response, 404, { error: "Not found." });
        return;
      }
      const assetName = (dmAsset || playerAsset)[2];
      serveFile(request, response, path.join(ROOT, assetName));
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const allowedFiles = new Set(["/index.html", "/app.js", "/styles.css"]);
    if (!allowedFiles.has(requestedPath)) {
      sendJson(response, 404, { error: "Not found." });
      return;
    }
    serveFile(request, response, path.join(ROOT, requestedPath.slice(1)));
  } catch (error) {
    console.error("Request failed:", error);
    if (!response.headersSent) sendJson(response, error.statusCode || 500, { error: error.message || "Server error." });
    else response.destroy();
  }
});

server.listen(PORT, HOST, () => {
  const lanAddresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((details) => details && details.family === "IPv4" && !details.internal)
    .map((details) => details.address);
  const hostName = lanAddresses[0] || "127.0.0.1";
  console.log(`Gacha DnD running on port ${PORT}.`);
  console.log(`DM page (keep private): http://${hostName}:${PORT}/dm/${access.dmToken}/`);
  console.log(`Player invite:           http://${hostName}:${PORT}/join/${access.inviteCode}/`);
  for (const address of lanAddresses.slice(1)) {
    console.log(`Player invite:           http://${address}:${PORT}/join/${access.inviteCode}/`);
  }
  console.log(`Campaign data is stored locally in ${path.relative(ROOT, CAMPAIGN_FILE)}.`);
  console.log("The DM URL is a bearer secret. Do not share it; use only on a trusted private hotspot.");
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
