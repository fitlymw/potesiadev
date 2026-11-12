import type { Lang } from '../../shared/nightfall2/constants.ts';

/** What the room remembers about a day, for the Crier's bulletin. */
export interface DayStats {
  walked: Map<string, number>;
  chats: Map<string, number>;
  emotes: Map<string, number>;
  jumps: Map<string, number>;
}
export const emptyStats = (): DayStats => ({ walked: new Map(), chats: new Map(), emotes: new Map(), jumps: new Map() });

const RUMOURS = {
  id: [
    'Kabar dari Pasar: seorang pedagang bersumpah melihat bayangan yang tidak punya pemilik.',
    'Penjaga Menara Tua mendengar langkah kaki di jembatan tengah malam. Tak ada yang mengaku.',
    'Apel di kebun Hutan hilang satu per satu. Para tupai menyangkal.',
    'Lentera di Lantern Row padam sendiri semalam, lalu menyala lagi. Dua kali.',
    'Sumur di alun-alun berbunyi seperti berbisik. Jangan menunduk terlalu dekat.',
    'Seseorang meninggalkan sepasang sepatu basah di depan kedai. Sungai tidak sedalam itu.',
    'Burung hantu di Pohon Raksasa barat tidak berbunyi malam ini. Itu bukan pertanda baik.',
    'Tukang roti bilang adonannya tidak mengembang. Katanya ada yang berdiri di belakangnya.',
    'Anak-anak Kota Tua melihat cahaya biru di balik Menara. Orang tua mereka tidak percaya.',
    'Jembatan timur berderit walau tak ada yang lewat. Tukang kayu angkat bahu.',
    'Kucing kedai tidur di luar lagi. Ia hanya begitu kalau ada tamu yang tidak diundang.',
    'Angin dari Hutan membawa bau lilin. Tidak ada yang menyalakan lilin di Hutan.',
  ],
  en: [
    'Word from the Market: a trader swears he saw a shadow with no owner.',
    'The keeper of the Old Tower heard footsteps on the bridge at midnight. Nobody has owned up.',
    'Apples in the Grove orchard vanish one by one. The squirrels deny everything.',
    'A lantern on Lantern Row went out by itself last night, then lit again. Twice.',
    'The well on the plaza sounds like whispering. Do not lean in too close.',
    'Someone left a pair of wet boots outside the tavern. The river is not that deep.',
    'The owl in the great western oak made no sound tonight. That is not a good sign.',
    'The baker says her dough would not rise. She says something stood behind her.',
    'Children of the Old Quarter saw a blue light behind the Tower. Their parents do not believe them.',
    'The east bridge creaks though nobody crosses it. The carpenter just shrugs.',
    'The tavern cat slept outside again. It only does that when there is an uninvited guest.',
    'The wind from the Grove smells of candle wax. Nobody lights candles in the Grove.',
  ],
};

function top(m: Map<string, number>): [string, number] | null {
  let best: [string, number] | null = null;
  m.forEach((v, k) => { if (v > 0 && (!best || v > best[1])) best = [k, v]; });
  return best;
}

/** The Crier's bulletin for one night: greeting, headcount, up to two gossip stats, a rumour, the curfew. */
export function composeNews(lang: Lang, day: number, names: Map<string, string>, stats: DayStats, seed: number): string[] {
  const n = names.size;
  const nameOf = (id: string) => names.get(id) ?? '?';
  const lines: string[] = [];
  const T = lang === 'id'
    ? {
        open: `Dengar, dengar! Malam ke-${day} turun di Elf Town.`,
        count: n === 1 ? 'Hanya satu warga yang masih terjaga di kota ini.' : `${n} warga masih terjaga di kota ini.`,
        walked: (nm: string, m: number) => `${nm} paling rajin berkeliling hari ini: ${m} meter.`,
        chats: (nm: string, k: number) => `${nm} paling banyak bicara: ${k} pesan. Semoga tidak ada yang penting.`,
        emotes: (nm: string, k: number) => `${nm} paling ekspresif, ${k} kali.`,
        jumps: (nm: string, k: number) => `${nm} melompat ${k} kali. Entah kenapa.`,
        quiet: 'Hari ini kota terlalu tenang. Aku tidak suka kota yang tenang.',
        close: 'Sampai fajar, tak seorang pun boleh bersuara. Tidurlah... jika bisa.',
      }
    : {
        open: `Hear ye, hear ye! Night ${day} falls over Elf Town.`,
        count: n === 1 ? 'Only one townsfolk is still awake tonight.' : `${n} townsfolk are still awake tonight.`,
        walked: (nm: string, m: number) => `${nm} roamed the most today: ${m} metres.`,
        chats: (nm: string, k: number) => `${nm} talked the most: ${k} messages. Let us hope none of it mattered.`,
        emotes: (nm: string, k: number) => `${nm} was the most expressive, ${k} times.`,
        jumps: (nm: string, k: number) => `${nm} jumped ${k} times. Nobody knows why.`,
        quiet: 'The town was too quiet today. I do not like a quiet town.',
        close: 'Until dawn, no one may speak. Sleep... if you can.',
      };

  lines.push(T.open, T.count);
  const gossip: string[] = [];
  const w = top(stats.walked);
  if (w && w[1] >= 20) gossip.push(T.walked(nameOf(w[0]), Math.round(w[1])));
  const c = top(stats.chats);
  if (c) gossip.push(T.chats(nameOf(c[0]), c[1]));
  const e = top(stats.emotes);
  if (e) gossip.push(T.emotes(nameOf(e[0]), e[1]));
  const j = top(stats.jumps);
  if (j && j[1] >= 3) gossip.push(T.jumps(nameOf(j[0]), j[1]));
  if (gossip.length === 0) lines.push(T.quiet);
  else lines.push(...gossip.slice(0, 2));
  const pool = RUMOURS[lang];
  lines.push(pool[(seed + day * 7) % pool.length]);
  lines.push(T.close);
  return lines;
}
