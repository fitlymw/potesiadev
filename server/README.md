# Nightfall 2: Elf Town — game server

Authoritative multiplayer server (Node + Colyseus). It owns player positions, collisions,
the day/night clock and proximity chat (text is only delivered to players within range).

## Run on the host PC

```
cd app/server
npm install        # first time only
npm run dev        # auto-restarts on changes;  npm start  for plain run
```

Listens on port 2567 (`PORT=… npm start` to change). Health check: http://localhost:2567/health

## Testing

- Same PC: open the site on http://localhost:5173 (dev) — the client connects to ws://localhost:2567 by itself.
- Phones on the same Wi-Fi: run the site with `npm run dev -- --host`, open http://<PC-IP>:5173 on the phone;
  the client connects to ws://<PC-IP>:2567. Allow Node through the Windows firewall when asked.
- Internet / potesia.com: the site is https, so the server needs an https tunnel, e.g. `ngrok http 2567`.
  Set `VITE_NF2_SERVER=wss://<your-tunnel-host>` in the Vercel project, or try it first without a rebuild by
  opening `https://www.potesia.com/games/nightfall-2?server=wss://<your-tunnel-host>` (remembered in the browser).

## Layout

- `src/index.ts`      — HTTP (health, lobby-code lookup) + WebSocket transport
- `src/ElfTownRoom.ts` — the room: lobby codes, join/leave, 20 Hz tick, phases, chat radius
- `../shared/nightfall2/` — map, physics and message types shared with the browser client
