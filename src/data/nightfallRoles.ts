/**
 * Nightfall Deception — role book (EN + ID), Standard mode.
 *
 * Luminaries and Cursed are the good side (Kubu Terang); Shadows and the
 * Nightbringer are the evil side (Kubu Gelap). Rules are enforced by
 * src/lib/party/nightfall.ts; the texts here are what players read on the
 * "Role hint" button during their private turns.
 */

type Localized = { en: string; id: string };

export type Team = 'luminary' | 'cursed' | 'shadow' | 'nightbringer';

export type RoleId =
  | 'aura' | 'aegis' | 'glyph' | 'rune' | 'trace' | 'dirge' | 'nova' | 'spark' | 'gaze'
  | 'echo' | 'baiter' | 'void'
  | 'mirage' | 'snare' | 'viper'
  | 'abyss' | 'fang';

export interface RoleInfo {
  id: RoleId;
  team: Team;
  name: string;
  short: Localized;
  ability: Localized;
  tips: Localized[];
}

export const TEAM_LABEL: Record<Team, Localized> = {
  luminary: { en: 'Luminary · Light side', id: 'Luminary · Kubu Terang' },
  cursed: { en: 'Cursed · Light side (with a drawback)', id: 'Cursed · Kubu Terang (dengan kelemahan)' },
  shadow: { en: 'Shadow · Dark side', id: 'Shadow · Kubu Gelap' },
  nightbringer: { en: 'Nightbringer · Dark side boss', id: 'Nightbringer · Bos Kubu Gelap' },
};

export const TEAM_GOAL: Record<'good' | 'evil', Localized> = {
  good: {
    en: 'Light side wins by executing the Nightbringer during the day.',
    id: 'Kubu Terang menang jika berhasil mengeksekusi Nightbringer di siang hari.',
  },
  evil: {
    en: 'Dark side wins when the living Dark players are as many as (or more than) the living Light players.',
    id: 'Kubu Gelap menang jika jumlah pemain Kubu Gelap yang hidup sama dengan (atau lebih dari) Kubu Terang yang hidup.',
  },
};

const r = (id: RoleId, team: Team, name: string, short: [string, string], ability: [string, string], tips: [string, string][]): RoleInfo => ({
  id,
  team,
  name,
  short: { en: short[0], id: short[1] },
  ability: { en: ability[0], id: ability[1] },
  tips: tips.map(([en, idText]) => ({ en, id: idText })),
});

export const ROLES: Record<RoleId, RoleInfo> = {
  // ==================== LUMINARIES ====================
  aura: r('aura', 'luminary', 'Aura',
    ['Each night, check whether two players include the Dark side.', 'Tiap malam, cek apakah ada Kubu Gelap di antara dua pemain.'],
    ['Each night choose 2 players. At dawn you learn YES if at least one of them is Dark, or NO if neither is.', 'Tiap malam pilih 2 pemain. Saat fajar kamu tahu YA jika setidaknya satu dari mereka Kubu Gelap, atau TIDAK jika keduanya bukan.'],
    [['Check yourself plus a suspect: if the answer is YES, the suspect is Dark.', 'Cek dirimu sendiri + satu tersangka: kalau jawabannya YA, tersangka itu Kubu Gelap.'], ['Your information can be wrong if you are poisoned.', 'Informasimu bisa salah kalau kamu sedang diracun.']]),
  aegis: r('aegis', 'luminary', 'Aegis',
    ['Each night, protect one player from being killed.', 'Tiap malam, lindungi satu pemain dari pembunuhan.'],
    ['From the second night, choose 1 other player each night. If the Nightbringer attacks them that night, they survive. You cannot protect yourself.', 'Mulai malam kedua, pilih 1 pemain lain setiap malam. Jika Nightbringer menyerangnya malam itu, ia selamat. Kamu tidak bisa melindungi dirimu sendiri.'],
    [['Protect the players who share strong information during the day.', 'Lindungi pemain yang membagikan informasi penting di siang hari.'], ['Revealing yourself makes you a target.', 'Kalau kamu membuka identitas, kamu bisa jadi incaran.']]),
  glyph: r('glyph', 'luminary', 'Glyph',
    ['First night: learn that one of two players is a specific Shadow.', 'Malam pertama: tahu bahwa salah satu dari dua pemain adalah Shadow tertentu.'],
    ['On the first night you learn 2 players and a Shadow role: one of those two players is that Shadow. If no Shadow can be detected, you are told so.', 'Di malam pertama kamu diberi 2 nama dan 1 peran Shadow: salah satu dari dua pemain itu adalah Shadow tersebut. Jika tidak ada Shadow yang terdeteksi, kamu akan diberi tahu.'],
    [['Combine your clue with Aura or Rune results to narrow it down.', 'Gabungkan petunjukmu dengan hasil Aura atau Rune untuk mempersempit tersangka.']]),
  rune: r('rune', 'luminary', 'Rune',
    ['Each night, learn how many of your living neighbours are Dark.', 'Tiap malam, tahu berapa tetangga hidupmu yang Kubu Gelap.'],
    ['Each night you learn a number 0, 1 or 2: how many of your two nearest living neighbours (left and right) are Dark.', 'Tiap malam kamu mendapat angka 0, 1, atau 2: berapa dari dua tetangga hidup terdekatmu (kiri dan kanan) yang Kubu Gelap.'],
    [['When a neighbour dies, your next living neighbour counts instead.', 'Kalau tetanggamu mati, tetangga hidup berikutnya yang dihitung.'], ['Your seat matters — stay in your chair when the day ends.', 'Kursimu penting — kembali duduk saat siang berakhir.']]),
  trace: r('trace', 'luminary', 'Trace',
    ['Each night, learn one player the Dark side visited.', 'Tiap malam, tahu satu pemain yang didatangi Kubu Gelap.'],
    ['Each dawn you learn one player whom the Dark side visited that night (attacked or poisoned) — or that nobody was visited.', 'Tiap fajar kamu tahu satu pemain yang didatangi Kubu Gelap malam itu (diserang atau diracun) — atau bahwa tidak ada yang didatangi.'],
    [['A visited player who is still alive was probably protected or poisoned.', 'Pemain yang didatangi tapi masih hidup kemungkinan dilindungi atau diracun.']]),
  dirge: r('dirge', 'luminary', 'Dirge',
    ['Each night, learn the true role of whoever was executed that day.', 'Tiap malam, tahu peran asli pemain yang dieksekusi hari itu.'],
    ['From the second night, you learn the true role of the player executed during the previous day (if anyone was executed).', 'Mulai malam kedua, kamu tahu peran asli pemain yang dieksekusi pada siang sebelumnya (jika ada yang dieksekusi).'],
    [['Your information shows whether the group executed the right person.', 'Informasimu menunjukkan apakah kelompok mengeksekusi orang yang tepat.']]),
  nova: r('nova', 'luminary', 'Nova',
    ['Once per game, during the day, shoot a player: if they are the Nightbringer, they die.', 'Sekali per permainan, di siang hari, tembak satu pemain: jika ia Nightbringer, ia mati.'],
    ['Once per game, during the day, publicly choose a player using the “Day ability” button. If that player is the Nightbringer, they die immediately. Otherwise nothing happens and your ability is used up.', 'Sekali per permainan, di siang hari, pilih satu pemain secara terbuka lewat tombol "Kemampuan siang". Jika pemain itu Nightbringer, ia langsung mati. Jika bukan, tidak terjadi apa-apa dan kemampuanmu habis.'],
    [['Anyone can pretend to shoot — only the real Nova’s shot works.', 'Siapa pun bisa berpura-pura menembak — hanya tembakan Nova asli yang berpengaruh.'], ['Wait until you are confident; you only get one shot.', 'Tunggu sampai kamu yakin; kamu hanya punya satu tembakan.']]),
  spark: r('spark', 'luminary', 'Spark',
    ['First night: learn that one of two players is a specific Luminary.', 'Malam pertama: tahu bahwa salah satu dari dua pemain adalah Luminary tertentu.'],
    ['On the first night you learn 2 players and a Luminary role: one of those two players is that role.', 'Di malam pertama kamu diberi 2 nama dan 1 peran Luminary: salah satu dari dua pemain itu memegang peran tersebut.'],
    [['Use it to confirm who can be trusted.', 'Gunakan untuk memastikan siapa yang bisa dipercaya.']]),
  gaze: r('gaze', 'luminary', 'Gaze',
    ['First night: learn that one of two players is a specific Cursed.', 'Malam pertama: tahu bahwa salah satu dari dua pemain adalah Cursed tertentu.'],
    ['On the first night you learn 2 players and a Cursed role: one of those two players is that role. If there is no Cursed in the game, you are told so.', 'Di malam pertama kamu diberi 2 nama dan 1 peran Cursed: salah satu dari dua pemain itu memegang peran tersebut. Jika tidak ada Cursed dalam permainan, kamu akan diberi tahu.'],
    [['Knowing the Cursed explains strange information (e.g. a Baiter reading as Dark).', 'Mengetahui Cursed membantu menjelaskan info yang aneh (misalnya Baiter terbaca sebagai Kubu Gelap).']]),
  // ==================== CURSED ====================
  echo: r('echo', 'cursed', 'Echo',
    ['Your vote counts twice — but a wrong execution costs your life.', 'Suaramu dihitung dua — tapi eksekusi yang salah membuatmu mati.'],
    ['While you are alive, your vote counts as 2. If the group executes a Light-side player, you die the following night.', 'Selama kamu hidup, suaramu dihitung 2. Jika kelompok mengeksekusi pemain Kubu Terang, kamu mati pada malam berikutnya.'],
    [['Push the group to be careful before executing anyone.', 'Dorong kelompok untuk berhati-hati sebelum mengeksekusi.']]),
  baiter: r('baiter', 'cursed', 'Baiter',
    ['You are good, but you read as Dark to every check.', 'Kamu baik, tapi selalu terbaca sebagai Kubu Gelap.'],
    ['You are on the Light side, but Aura, Rune and similar abilities always detect you as Dark. You may also be shown to Glyph as a Shadow.', 'Kamu Kubu Terang, tapi Aura, Rune, dan kemampuan sejenis selalu mendeteksimu sebagai Kubu Gelap. Kamu juga bisa ditunjukkan ke Glyph sebagai Shadow.'],
    [['Tell the group early so your “Dark” reading is not misunderstood.', 'Beri tahu kelompok lebih awal supaya hasil "Gelap" pada dirimu tidak disalahpahami.']]),
  void: r('void', 'cursed', 'Void',
    ['If you are executed, the Nightbringer kills two players the next night.', 'Jika kamu dieksekusi, Nightbringer membunuh dua orang malam berikutnya.'],
    ['You are on the Light side. If the group executes you, the Nightbringer may kill 2 players the following night.', 'Kamu Kubu Terang. Jika kelompok mengeksekusimu, Nightbringer boleh membunuh 2 pemain pada malam berikutnya.'],
    [['Make sure the group does not execute you.', 'Pastikan kelompok tidak mengeksekusimu.']]),
  // ==================== SHADOWS ====================
  mirage: r('mirage', 'shadow', 'Mirage',
    ['Each night, poison a player: their ability fails until the next night.', 'Tiap malam, racuni satu pemain: kemampuannya gagal sampai malam berikutnya.'],
    ['Each night choose 1 player. That night and the next day their ability malfunctions: information is false, protections and shots fail.', 'Tiap malam pilih 1 pemain. Malam itu dan siang berikutnya kemampuannya kacau: informasinya palsu, perlindungan dan tembakannya gagal.'],
    [['Poison players who seem to have strong information.', 'Racuni pemain yang tampaknya punya informasi kuat.'], ['Help the Nightbringer — you win together.', 'Bantu Nightbringer — kalian menang bersama.']]),
  snare: r('snare', 'shadow', 'Snare',
    ['First night: learn your neighbours’ roles. You read as Light.', 'Malam pertama: tahu peran tetanggamu. Kamu terbaca sebagai Kubu Terang.'],
    ['On the first night you learn the true roles of your left and right neighbours. Aura, Rune and Glyph always detect you as Light.', 'Di malam pertama kamu tahu peran asli tetangga kiri dan kananmu. Aura, Rune, dan Glyph selalu mendeteksimu sebagai Kubu Terang.'],
    [['You can safely claim to be a Luminary — checks will back you up.', 'Kamu bisa aman mengaku sebagai Luminary — hasil pengecekan akan mendukungmu.']]),
  viper: r('viper', 'shadow', 'Viper',
    ['If you are executed, the last player who voted for you dies.', 'Jika kamu dieksekusi, pemberi suara terakhir untukmu ikut mati.'],
    ['If the group executes you, the last player (in seating order) who voted for you dies the following night.', 'Jika kelompok mengeksekusimu, pemain terakhir (sesuai urutan duduk) yang memilihmu akan mati pada malam berikutnya.'],
    [['Being suspected is not all bad — it can cost them a player.', 'Dicurigai tidak selalu buruk — itu bisa membuat mereka kehilangan satu pemain.']]),
  // ==================== NIGHTBRINGER ====================
  abyss: r('abyss', 'nightbringer', 'Abyss',
    ['Boss. From the second night, kill one player each night.', 'Bos. Mulai malam kedua, bunuh satu pemain tiap malam.'],
    ['From the second night, choose 1 player to kill each night. You may choose yourself: you die and a living Shadow becomes the new Abyss.', 'Mulai malam kedua, pilih 1 pemain untuk dibunuh setiap malam. Kamu boleh memilih dirimu sendiri: kamu mati dan salah satu Shadow yang hidup menjadi Abyss yang baru.'],
    [['Use one of your three bluff roles to pretend to be a Luminary.', 'Gunakan salah satu dari tiga peran samaranmu untuk berpura-pura menjadi Luminary.'], ['Passing the title can save your team when you are about to be executed.', 'Mengoper gelar bisa menyelamatkan timmu saat kamu hampir dieksekusi.']]),
  fang: r('fang', 'nightbringer', 'Fang',
    ['Boss. Kills each night and survives the first execution.', 'Bos. Membunuh tiap malam dan selamat dari eksekusi pertama.'],
    ['From the second night, choose 1 other player to kill each night. The first time you are executed, the execution fails mysteriously and you survive.', 'Mulai malam kedua, pilih 1 pemain lain untuk dibunuh setiap malam. Saat pertama kali kamu dieksekusi, eksekusi itu gagal secara misterius dan kamu selamat.'],
    [['A failed execution reveals a Fang — after that you must hide even better.', 'Eksekusi yang gagal membocorkan adanya Fang — setelah itu kamu harus bersembunyi lebih baik.']]),
};

export const ROLE_IDS = Object.keys(ROLES) as RoleId[];

export function rolesOfTeam(team: Team): RoleId[] {
  return ROLE_IDS.filter((id) => ROLES[id].team === team);
}

export function isEvilTeam(team: Team): boolean {
  return team === 'shadow' || team === 'nightbringer';
}
