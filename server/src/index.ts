/**
 * Nightfall 2: Elf Town — game server.
 *
 *   npm run dev      (auto-restart on changes)
 *   npm start
 *
 * Listens on PORT (default 2567). The browser client connects over WebSocket; a tunnel
 * (ngrok / Cloudflare) in front of this port gives it the https/wss address potesia.com needs.
 */
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { ElfTownRoom } from './ElfTownRoom.ts';
import { ROOM_NAME } from '../../shared/nightfall2/constants.ts';
import type { LobbyLookup } from '../../shared/nightfall2/messages.ts';

const PORT = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, game: 'nightfall2', time: Date.now() }));

/** Resolve a 4-letter lobby code to a room the client can join by id. */
app.get('/lobby/:code', async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  const rooms = await matchMaker.query({ name: ROOM_NAME });
  const room = rooms.find((r) => r.metadata?.code === code);
  if (!room) return res.status(404).json({ error: 'not_found' });
  const out: LobbyLookup = { roomId: room.roomId, clients: room.clients, maxClients: room.maxClients, locked: room.locked };
  res.json(out);
});

const server = http.createServer(app);
const gameServer = new Server({ transport: new WebSocketTransport({ server }) });
gameServer.define(ROOM_NAME, ElfTownRoom);

gameServer.listen(PORT).then(() => {
  console.log(`Nightfall 2 server ready on http://localhost:${PORT}  (ws://localhost:${PORT})`);
});
