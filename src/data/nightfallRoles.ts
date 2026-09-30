/**
 * Nightfall Deception — role book (EN + ID) for all three modes.
 *
 * Luminaries and Cursed are the good side (Kubu Terang); Shadows and the
 * Nightbringer are the evil side (Kubu Gelap). Rules are enforced by
 * src/lib/party/nightfall.ts; the texts here are what players read on the
 * "Role hint" button during their private turns.
 */

type Localized = { en: string; id: string };

export type Team = 'luminary' | 'cursed' | 'shadow' | 'nightbringer';

export type RoleId =
  | 'aura' | 'aegis' | 'glyph' | 'rune' | 'trace' | 'dirge' | 'nova' | 'spark' | 'gaze' | 'loom' | 'pyre' | 'apex' | 'pact' | 'tide' | 'saint'
  | 'echo' | 'baiter' | 'void'
  | 'mirage' | 'snare' | 'viper' | 'blight' | 'heretic'
  | 'abyss' | 'fang' | 'gouge' | 'bane'
  | 'joker' | 'zombie';

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
    ['Each night, learn one player who was visited by a night threat.', 'Tiap malam, tahu satu pemain yang didatangi ancaman malam.'],
    ['Each dawn you learn one player who was visited that night by an attack, poison, Gouge, infection or the crown holder — or that nobody was visited.', 'Tiap fajar kamu tahu satu pemain yang didatangi malam itu oleh serangan, racun, Gouge, infeksi, atau pemegang mahkota — atau bahwa tidak ada yang didatangi.'],
    [['A visited player who is still alive was probably protected or poisoned.', 'Pemain yang didatangi tapi masih hidup kemungkinan dilindungi atau diracun.']]),
  dirge: r('dirge', 'luminary', 'Dirge',
    ['Each night, learn the true role of whoever was executed that day.', 'Tiap malam, tahu peran asli pemain yang dieksekusi hari itu.'],
    ['From the second night, you learn the true role of the player executed during the previous day (if anyone was executed).', 'Mulai malam kedua, kamu tahu peran asli pemain yang dieksekusi pada siang sebelumnya (jika ada yang dieksekusi).'],
    [['Your information shows whether the group executed the right person.', 'Informasimu menunjukkan apakah kelompok mengeksekusi orang yang tepat.']]),
  nova: r('nova', 'luminary', 'Nova',
    ['Once per game, sacrifice yourself to shoot a player: if they are the boss, they die.', 'Sekali per permainan, korbankan dirimu untuk menembak satu pemain: jika ia bos, ia mati.'],
    ['Once per game, during the day, publicly shoot a player using the “Day ability” button. If that player is the boss (Nightbringer, Joker or Zombie), they die. Hit or miss, the shot costs your life: you die immediately and completely — no ghost vote.', 'Sekali per permainan, di siang hari, tembak satu pemain secara terbuka lewat tombol "Kemampuan siang". Jika pemain itu bos (Nightbringer, Joker, atau Zombie), ia mati. Kena atau meleset, tembakan itu dibayar dengan nyawamu: kamu langsung mati total — tanpa suara hantu.'],
    [['Anyone can pretend to shoot — but a pretender survives, so everyone will know it was not the Nova.', 'Siapa pun bisa berpura-pura menembak — tapi yang berpura-pura tetap hidup, jadi semua akan tahu ia bukan Nova.'], ['You only get one shot and it costs your life — wait until you are sure.', 'Kamu hanya punya satu tembakan dan itu mengorbankan nyawamu — tunggu sampai kamu yakin.']]),
  spark: r('spark', 'luminary', 'Spark',
    ['First night: learn that one of two players is a specific Luminary.', 'Malam pertama: tahu bahwa salah satu dari dua pemain adalah Luminary tertentu.'],
    ['On the first night you learn 2 players and a Luminary role: one of those two players is that role.', 'Di malam pertama kamu diberi 2 nama dan 1 peran Luminary: salah satu dari dua pemain itu memegang peran tersebut.'],
    [['Use it to confirm who can be trusted.', 'Gunakan untuk memastikan siapa yang bisa dipercaya.']]),
  gaze: r('gaze', 'luminary', 'Gaze',
    ['First night: learn that one of two players is a specific Cursed.', 'Malam pertama: tahu bahwa salah satu dari dua pemain adalah Cursed tertentu.'],
    ['On the first night you learn 2 players and a Cursed role: one of those two players is that role. If there is no Cursed in the game, you are told so.', 'Di malam pertama kamu diberi 2 nama dan 1 peran Cursed: salah satu dari dua pemain itu memegang peran tersebut. Jika tidak ada Cursed dalam permainan, kamu akan diberi tahu.'],
    [['Knowing the Cursed explains strange information (e.g. a Baiter reading as Dark).', 'Mengetahui Cursed membantu menjelaskan info yang aneh (misalnya Baiter terbaca sebagai Kubu Gelap).']]),
  loom: r('loom', 'luminary', 'Loom',
    ['Once per game, bring a dead player back to life.', 'Sekali per permainan, hidupkan kembali satu pemain yang sudah mati.'],
    ['From the second night, once per game: choose 1 dead player. At dawn they come back to life with their role and a normal vote. You may skip and save it for later.', 'Mulai malam kedua, sekali per permainan: pilih 1 pemain yang sudah mati. Saat fajar ia hidup kembali dengan perannya dan hak suara biasa. Kamu boleh melewatinya dan menyimpannya untuk nanti.'],
    [['Revive a player whose information was trustworthy.', 'Hidupkan pemain yang informasinya bisa dipercaya.'], ['If you are poisoned, the revival fails and is used up.', 'Kalau kamu sedang diracun, kebangkitannya gagal dan kemampuanmu habis.']]),
  pyre: r('pyre', 'luminary', 'Pyre',
    ['If you are killed by a night attack, you take someone with you.', 'Jika kamu terbunuh oleh serangan malam, kamu membawa satu orang ikut mati.'],
    ['From the second night, choose 1 player each night (or skip). If a night attack kills you that night (Nightbringer, crown holder or horde), that player dies together with you.', 'Mulai malam kedua, pilih 1 pemain setiap malam (atau lewati). Jika serangan malam membunuhmu malam itu (Nightbringer, pemegang mahkota, atau gerombolan), pemain tersebut ikut mati bersamamu.'],
    [['Always pick your strongest suspect — you never know which night is your last.', 'Selalu pilih tersangka terkuatmu — kamu tidak pernah tahu malam mana yang terakhir.']]),
  apex: r('apex', 'luminary', 'Apex',
    ['Survive to the final three: a tied vote makes the Light side win.', 'Bertahan sampai sisa tiga pemain: voting seri membuat Kubu Terang menang.'],
    ['When only 3 players are alive and you are one of them, if the day ends with a tie between the top valid nominations, the Light side wins immediately.', 'Saat hanya tersisa 3 pemain hidup dan kamu salah satunya, jika hari berakhir dengan nominasi sah teratas yang seri, Kubu Terang langsung menang.'],
    [['Stay hidden — the Dark side will hunt you once they suspect an Apex.', 'Tetap tersembunyi — Kubu Gelap akan memburumu begitu curiga ada Apex.']]),
  pact: r('pact', 'luminary', 'Pact',
    ['Bound to another Light player: you know each other, and die together.', 'Terikat dengan satu pemain Kubu Terang: kalian saling tahu, dan mati bersama.'],
    ['On the first night you and one other Light-side player learn each other’s names. If one of you dies (night, execution or anything else), the other dies too.', 'Di malam pertama kamu dan satu pemain Kubu Terang lain saling mengetahui nama. Jika salah satu dari kalian mati (malam, eksekusi, atau sebab lain), yang lain ikut mati.'],
    [['Your partner is someone you can fully trust — protect each other.', 'Pasanganmu adalah orang yang bisa kamu percaya penuh — saling lindungi.']]),
  tide: r('tide', 'luminary', 'Tide',
    ['Twice per game, swap two players’ seats and shield them that night.', 'Dua kali per permainan, tukar kursi dua pemain dan lindungi mereka malam itu.'],
    ['From the second night, twice per game: choose 2 players. They swap seats (before any seat attack that night), and that night no attack, Gouge or infection can hurt them. You may skip.', 'Mulai malam kedua, dua kali per permainan: pilih 2 pemain. Mereka bertukar kursi (sebelum serangan kursi malam itu), dan malam itu serangan, Gouge, atau infeksi tidak bisa melukai mereka. Kamu boleh melewatinya.'],
    [['Swapping seats changes who sits next to whom — useful for Rune and for the Viper vote order.', 'Menukar kursi mengubah siapa duduk di sebelah siapa — berguna untuk Rune dan urutan voting Viper.'], ['The Joker also swaps seats, so a swap does not prove who did it.', 'Joker juga menukar kursi, jadi pertukaran kursi tidak membuktikan siapa pelakunya.']]),
  saint: r('saint', 'luminary', 'Saint',
    ['After the first blood you are revealed and must kill or revive — at the cost of your life.', 'Setelah first blood kamu terungkap dan wajib membunuh atau menghidupkan kembali — dengan nyawamu sebagai bayarannya.'],
    ['You have no night action and cannot be poisoned. The day after the first night death (first blood), the Oracle reveals to everyone that you are the Saint, and before nominations you must choose: kill 1 living player, or bring back 1 player who died in that first blood. Using your power costs your life, but you keep 2 ghost votes (at most 1 per day). Afterwards, when the next player dies, you learn 2 possible roles for them — one Dark, one Light. Usually one is true, but there is a 30% chance both are false. A kill is blocked if the target was protected by Aegis or Tide the night before.', 'Kamu tidak punya aksi malam dan tidak bisa diracun. Siang setelah kematian malam pertama (first blood), The Oracle mengumumkan ke semua pemain bahwa kamu adalah Saint, dan sebelum nominasi kamu wajib memilih: membunuh 1 pemain yang hidup, atau menghidupkan kembali 1 pemain yang mati pada first blood itu. Memakai kekuatanmu dibayar dengan nyawamu, tapi kamu tetap punya 2 suara hantu (maksimal 1 per hari). Setelahnya, saat pemain berikutnya mati, kamu mengetahui 2 kemungkinan perannya — satu Kubu Gelap, satu Kubu Terang. Biasanya salah satunya benar, tapi ada 30% kemungkinan keduanya salah. Pembunuhan gagal jika targetnya dilindungi Aegis atau Tide pada malam sebelumnya.'],
    [['You are the early turning point: revive a key role that fell, or strike the player you trust least.', 'Kamu adalah titik balik di awal permainan: hidupkan kembali peran penting yang gugur, atau hukum pemain yang paling kamu curigai.'], ['Beware: a Heretic may also claim to be the Saint.', 'Hati-hati: Heretic juga bisa muncul sebagai Saint.']]),
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
    ['If you are executed, the Dark boss acts twice the next night.', 'Jika kamu dieksekusi, bos Kubu Gelap beraksi dua kali malam berikutnya.'],
    ['You are on the Light side. If the group executes you, the Dark boss gets a double action the following night (2 kills, or 2 infections for the Zombie).', 'Kamu Kubu Terang. Jika kelompok mengeksekusimu, bos Kubu Gelap mendapat aksi ganda pada malam berikutnya (2 pembunuhan, atau 2 infeksi untuk Zombie).'],
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
  blight: r('blight', 'shadow', 'Blight',
    ['Your presence adds 2 extra Cursed to the game.', 'Kehadiranmu menambah 2 Cursed ke dalam permainan.'],
    ['You have no night action. When you are in the game, 2 Luminaries are replaced by 2 Cursed, so the Light side has more troublemakers.', 'Kamu tidak punya aksi malam. Saat kamu ada dalam permainan, 2 Luminary diganti 2 Cursed, sehingga Kubu Terang punya lebih banyak pengacau.'],
    [['If the Light side notices many Cursed, they may suspect a Blight — bluff as a Cursed yourself.', 'Kalau Kubu Terang melihat banyak Cursed, mereka bisa curiga ada Blight — menyamarlah sebagai Cursed.']]),
  heretic: r('heretic', 'shadow', 'Heretic',
    ['A false Saint: revealed to all as the Saint after first blood — kill or revive for the Dark side.', 'Saint palsu: diumumkan ke semua sebagai Saint setelah first blood — membunuh atau menghidupkan untuk Kubu Gelap.'],
    ['You work exactly like the Saint and the whole table is told you ARE the Saint. The day after the first night death you must kill 1 living player or bring back 1 first-blood victim, then die with 2 ghost votes (at most 1 per day). You also get the Saint’s 2-role vision of the next death. You cannot be poisoned. A Saint and a Heretic are never in the same game.', 'Kamu bekerja persis seperti Saint dan seluruh meja diberi tahu bahwa kamu ADALAH Saint. Siang setelah kematian malam pertama kamu wajib membunuh 1 pemain yang hidup atau menghidupkan kembali 1 korban first blood, lalu mati dengan 2 suara hantu (maksimal 1 per hari). Kamu juga mendapat penglihatan 2 peran Saint untuk kematian berikutnya. Kamu tidak bisa diracun. Saint dan Heretic tidak pernah ada di permainan yang sama.'],
    [['Everyone thinks you are holy — use that trust, then strike a key Light player.', 'Semua orang mengira kamu suci — manfaatkan kepercayaan itu, lalu singkirkan pemain penting Kubu Terang.'], ['Reviving a harmless Light player can make your “Saint” act look genuine.', 'Menghidupkan pemain Terang yang tidak berbahaya bisa membuat aksi “Saint”-mu terlihat asli.']]),
  // ==================== NIGHTBRINGER ====================
  abyss: r('abyss', 'nightbringer', 'Abyss',
    ['Boss. From the second night, kill one player each night.', 'Bos. Mulai malam kedua, bunuh satu pemain tiap malam.'],
    ['From the second night, choose 1 player to kill each night. You may choose yourself: you die and a living Shadow becomes the new Abyss.', 'Mulai malam kedua, pilih 1 pemain untuk dibunuh setiap malam. Kamu boleh memilih dirimu sendiri: kamu mati dan salah satu Shadow yang hidup menjadi Abyss yang baru.'],
    [['Use one of your three bluff roles to pretend to be a Luminary.', 'Gunakan salah satu dari tiga peran samaranmu untuk berpura-pura menjadi Luminary.'], ['Passing the title can save your team when you are about to be executed.', 'Mengoper gelar bisa menyelamatkan timmu saat kamu hampir dieksekusi.']]),
  fang: r('fang', 'nightbringer', 'Fang',
    ['Boss. Kills each night and survives one execution on day 1 or 2.', 'Bos. Membunuh tiap malam dan selamat dari satu eksekusi di Siang 1 atau 2.'],
    ['From the second night, choose 1 other player to kill each night. If you are executed on day 1 or 2, the execution fails mysteriously and you survive — once. The night after that you are too weak to kill. From day 3 on, an execution kills you.', 'Mulai malam kedua, pilih 1 pemain lain untuk dibunuh setiap malam. Jika kamu dieksekusi di Siang 1 atau 2, eksekusi itu gagal secara misterius dan kamu selamat — sekali saja. Malam berikutnya kamu terlalu lemah untuk membunuh. Mulai Siang 3, eksekusi akan membunuhmu.'],
    [['A failed execution reveals a Fang — after that you must hide even better.', 'Eksekusi yang gagal membocorkan adanya Fang — setelah itu kamu harus bersembunyi lebih baik.']]),
  gouge: r('gouge', 'nightbringer', 'Gouge',
    ['Boss. Your victims die one night later — and their information turns false.', 'Bos. Korbanmu mati satu malam kemudian — dan informasinya menjadi palsu.'],
    ['From the first night, choose 1 player each night. They die at the end of the following night. Until then all their information is false (they are not told). Aegis protection on the night you choose them saves them.', 'Mulai malam pertama, pilih 1 pemain setiap malam. Ia mati di akhir malam berikutnya. Sampai saat itu semua informasinya palsu (ia tidak diberi tahu). Perlindungan Aegis pada malam kamu memilihnya akan menyelamatkannya.'],
    [['Target players with information abilities — their last report will mislead the group.', 'Incar pemain dengan kemampuan informasi — laporan terakhir mereka akan menyesatkan kelompok.']]),
  bane: r('bane', 'nightbringer', 'Bane',
    ['Boss. Killing a Cursed resets your attack for a second kill.', 'Bos. Membunuh Cursed membuat seranganmu ter-reset untuk pembunuhan kedua.'],
    ['From the second night, choose up to 2 players in order. The first is attacked. If the first dies and was a Cursed, your attack resets and the second dies too.', 'Mulai malam kedua, pilih hingga 2 pemain secara berurutan. Pemain pertama diserang. Jika ia mati dan ternyata Cursed, seranganmu ter-reset dan pemain kedua ikut mati.'],
    [['Players who admit to being Cursed are tempting first targets.', 'Pemain yang mengaku Cursed adalah target pertama yang menggoda.']]),
  // ==================== SOLO BOSSES (Joker / Zombie modes, no Shadows) ====================
  joker: r('joker', 'nightbringer', 'Joker',
    ['Solo boss who never kills: lends a crown that forces someone else to kill, and moves seats.', 'Bos tunggal yang tidak pernah membunuh: meminjamkan mahkota yang memaksa orang lain membunuh, dan memindahkan kursi.'],
    ['You cannot kill. Every night you may give the Crown to another living player, take it back, or leave it where it is — and you may swap the seats of 2 players (yourself included). The crown holder learns it at dawn and, from the next night on, must attack a seat NUMBER every night (they only see numbers, not names) or die in the morning. Their own role ability does not work while they hold it, day or night. They keep their own side and do not know who you are — they may well be hunting you. All seat swaps of the night happen before the attack, so it hits whoever sits in that seat after the swaps. Passive: every night you learn the roles of your left and right living neighbours — one of the two is false, so keep moving seats to find the truth. Night 1 is a blackout: all information is unreliable. You win when only 2 players remain; you lose the moment you die.', 'Kamu tidak bisa membunuh. Setiap malam kamu boleh memberikan Mahkota ke pemain hidup lain, menariknya kembali, atau membiarkannya — dan kamu boleh menukar kursi 2 pemain (termasuk dirimu). Pemegang mahkota tahu saat fajar dan, mulai malam berikutnya, wajib menyerang satu NOMOR kursi setiap malam (ia hanya melihat angka, bukan nama) atau ia mati saat pagi. Selama memegangnya, kemampuan perannya tidak berlaku, malam maupun siang. Ia tetap di kubunya sendiri dan tidak tahu siapa kamu — bisa jadi ia sedang memburumu. Semua pertukaran kursi malam itu terjadi sebelum serangan, jadi serangan mengenai siapa pun yang duduk di kursi itu setelah pertukaran. Pasif: setiap malam kamu mengetahui peran tetangga hidup di kiri dan kananmu — salah satu dari keduanya palsu, jadi teruslah berpindah kursi untuk menemukan kebenaran. Malam 1 adalah blackout: semua informasi tidak bisa dipercaya. Kamu menang jika hanya tersisa 2 pemain; kamu kalah begitu kamu mati.'],
    [['The holder aims at the seat where they think you sit — move before they strike.', 'Pemegang mahkota mengincar kursi yang ia kira kamu duduki — pindahlah sebelum ia menyerang.'], ['Crown a detector to silence their information, or crown the Aegis to turn a protector into a killer.', 'Beri mahkota ke pendeteksi untuk membungkam informasinya, atau ke Aegis agar sang pelindung terpaksa membunuh.'], ['Taking the crown away cancels that night’s attack; leaving it out too long is a gamble.', 'Menarik mahkota membatalkan serangan malam itu; membiarkannya terlalu lama adalah pertaruhan.'], ['This is the hardest role in the game — made for true manipulators.', 'Ini peran tersulit dalam permainan — dibuat untuk manipulator sejati.']]),
  zombie: r('zombie', 'nightbringer', 'Zombie',
    ['Solo boss. Infects a player every other night and grows a hidden horde.', 'Bos tunggal. Menginfeksi satu pemain dua malam sekali dan membangun gerombolan tersembunyi.'],
    ['On odd nights (1, 3, 5…) choose 1 player to infect. At dawn they learn they are infected: they join the Dark side, keep their ability and learn who you are. Aegis and Tide block infections. Night 1 is a blackout for the Light side’s information. The Dark side wins when the horde (you + infected) outnumbers the healthy players. If you die, the game goes on: on odd nights every infected player chooses a kill, and the most chosen target dies.', 'Di malam ganjil (1, 3, 5…) pilih 1 pemain untuk diinfeksi. Saat fajar ia tahu dirinya terinfeksi: ia pindah ke Kubu Gelap, tetap punya kemampuannya, dan tahu siapa kamu. Aegis dan Tide memblokir infeksi. Malam 1 adalah blackout untuk informasi Kubu Terang. Kubu Gelap menang jika gerombolan (kamu + yang terinfeksi) lebih banyak dari pemain yang sehat. Jika kamu mati, permainan berlanjut: di malam ganjil setiap pemain terinfeksi memilih target, dan target yang paling banyak dipilih mati.'],
    [['Infect trusted players — their word becomes your weapon.', 'Infeksi pemain yang dipercaya — ucapan mereka menjadi senjatamu.'], ['The Light side only wins when you AND every infected player are dead.', 'Kubu Terang baru menang jika kamu DAN semua pemain terinfeksi sudah mati.']]),
};

export const ROLE_IDS = Object.keys(ROLES) as RoleId[];

export function rolesOfTeam(team: Team): RoleId[] {
  return ROLE_IDS.filter((id) => ROLES[id].team === team);
}

/** Bosses of the Standard mode (dealt together with Shadows). */
export const STANDARD_BOSSES: RoleId[] = ['abyss', 'fang', 'gouge', 'bane'];
/** Bosses of the solo modes (no Shadows). */
export const SOLO_BOSSES: RoleId[] = ['joker', 'zombie'];

export function isEvilTeam(team: Team): boolean {
  return team === 'shadow' || team === 'nightbringer';
}
