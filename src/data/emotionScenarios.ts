/**
 * Emotion Impostor scenarios (EN + ID).
 *
 * Citizens see the scenario and the target emotion; the Impostor only sees the
 * category. Every category has 6 scenarios (2 easy, 2 medium, 2 hard) so the
 * Impostor's last-chance guess can always offer 3 decoys from the same
 * category. Topics are everyday and light — no grief, abuse or trauma.
 *
 * Difficulty: easy = one clear emotion; medium = a nuanced emotion or one that
 * is being held back; hard = two mixed emotions at once.
 */

type Localized = { en: string; id: string };

export type EmotionCategory = 'school' | 'work' | 'friends' | 'family' | 'romance' | 'daily';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface EmotionScenario {
  id: string;
  category: EmotionCategory;
  difficulty: Difficulty;
  text: Localized;
  emotion: Localized;
}

export const CATEGORY_LABEL: Record<EmotionCategory, Localized> = {
  school: { en: 'School & university', id: 'Sekolah & kuliah' },
  work: { en: 'Work', id: 'Dunia kerja' },
  friends: { en: 'Friendship', id: 'Pertemanan' },
  family: { en: 'Family', id: 'Keluarga' },
  romance: { en: 'Crushes & romance', id: 'Asmara' },
  daily: { en: 'Everyday life', id: 'Kehidupan sehari-hari' },
};

const sc = (id: string, category: EmotionCategory, difficulty: Difficulty, text: [string, string], emotion: [string, string]): EmotionScenario => ({
  id,
  category,
  difficulty,
  text: { en: text[0], id: text[1] },
  emotion: { en: emotion[0], id: emotion[1] },
});

export const EMOTION_SCENARIOS: EmotionScenario[] = [
  // School & university
  sc('EI01', 'school', 'easy', ['Your exam score turns out to be the highest in the class.', 'Nilai ujianmu ternyata paling tinggi di kelas.'], ['Proud', 'Bangga']),
  sc('EI02', 'school', 'easy', ['Your presentation is tomorrow morning and your slides are nowhere near finished.', 'Presentasimu besok pagi, dan slide-nya masih jauh dari selesai.'], ['Panicked', 'Panik']),
  sc('EI03', 'school', 'medium', ['The lecturer praises your assignment in front of the class, but a friend did most of the work.', 'Dosen memuji tugasmu di depan kelas, padahal sebagian besar dikerjakan temanmu.'], ['Pleased but guilty', 'Senang tapi merasa bersalah']),
  sc('EI04', 'school', 'medium', ['Your classmates made a study group and didn’t invite you.', 'Teman-teman sekelas membuat grup belajar dan kamu tidak diajak.'], ['Left out', 'Tersisih']),
  sc('EI05', 'school', 'hard', ['A friend gets into your dream university; you don’t.', 'Temanmu diterima di kampus impianmu, sedangkan kamu tidak.'], ['Happy for them but envious', 'Ikut senang tapi iri']),
  sc('EI06', 'school', 'hard', ['You graduate and have to say goodbye to your closest friends.', 'Kamu lulus dan harus berpisah dengan teman-teman terdekatmu.'], ['Happy and sad at once', 'Bahagia sekaligus sedih']),
  // Work
  sc('EI07', 'work', 'easy', ['Your salary goes up more than you expected.', 'Gajimu naik lebih besar dari yang kamu harapkan.'], ['Delighted', 'Gembira']),
  sc('EI08', 'work', 'easy', ['Your boss scolds you in front of colleagues for a mistake that wasn’t yours.', 'Atasan memarahimu di depan rekan kerja karena kesalahan yang bukan salahmu.'], ['Angry', 'Marah']),
  sc('EI09', 'work', 'medium', ['A project you worked on for three weeks is cancelled without a clear reason.', 'Proyek yang sudah kamu kerjakan tiga minggu dibatalkan tanpa alasan jelas.'], ['Frustrated but staying calm', 'Frustrasi tapi berusaha tetap tenang']),
  sc('EI10', 'work', 'medium', ['It’s your first day at a new office and you don’t know anyone yet.', 'Hari pertama di kantor baru dan kamu belum kenal siapa pun.'], ['Nervous but curious', 'Gugup tapi penasaran']),
  sc('EI11', 'work', 'hard', ['A colleague who often helped you is let go, while you get to stay.', 'Rekan kerja yang sering membantumu diberhentikan, sementara kamu dipertahankan.'], ['Relieved but guilty', 'Lega tapi merasa bersalah']),
  sc('EI12', 'work', 'hard', ['You’re promoted to be the manager of your close friends at work.', 'Kamu dipromosikan menjadi atasan teman-teman dekatmu sendiri.'], ['Happy but awkward', 'Senang tapi canggung']),
  // Friendship
  sc('EI13', 'friends', 'easy', ['Your friends throw you a surprise birthday party.', 'Teman-temanmu menyiapkan pesta kejutan ulang tahun untukmu.'], ['Touched', 'Terharu']),
  sc('EI14', 'friends', 'easy', ['Your best friend forgets your birthday.', 'Sahabatmu lupa hari ulang tahunmu.'], ['Disappointed', 'Kecewa']),
  sc('EI15', 'friends', 'medium', ['A friend borrowed money months ago and hasn’t paid it back, yet keeps buying new things.', 'Temanmu meminjam uang berbulan-bulan lalu dan belum mengembalikannya, tapi terus membeli barang baru.'], ['Annoyed but reluctant to ask', 'Kesal tapi sungkan menagih']),
  sc('EI16', 'friends', 'medium', ['You accidentally read a chat where friends say really nice things about you.', 'Kamu tidak sengaja membaca chat teman-teman yang memujimu.'], ['Embarrassed but pleased', 'Malu tapi senang']),
  sc('EI17', 'friends', 'hard', ['Two of your best friends have a fight and both want you on their side.', 'Dua sahabatmu bertengkar dan masing-masing memintamu memihak.'], ['Torn and uneasy', 'Serba salah dan tidak nyaman']),
  sc('EI18', 'friends', 'hard', ['Your best friend moves to another city to chase their dream.', 'Sahabatmu pindah ke kota lain untuk mengejar mimpinya.'], ['Proud but already missing them', 'Bangga tapi merasa kehilangan']),
  // Family
  sc('EI19', 'family', 'easy', ['Far from home, you smell food that reminds you of your mother’s cooking.', 'Saat jauh dari rumah, kamu mencium aroma masakan yang mirip masakan ibumu.'], ['Homesick', 'Rindu rumah']),
  sc('EI20', 'family', 'easy', ['Your younger sibling borrowed your favourite shirt without asking and stained it.', 'Adikmu memakai baju favoritmu tanpa izin dan membuatnya kotor.'], ['Irritated', 'Jengkel']),
  sc('EI21', 'family', 'medium', ['At a family gathering, relatives keep asking “when will you graduate?” and “when will you marry?”', 'Saat kumpul keluarga besar, kerabat terus bertanya "kapan lulus?" dan "kapan nikah?"'], ['Uncomfortable but smiling', 'Risih tapi tetap tersenyum']),
  sc('EI22', 'family', 'medium', ['Your parents compare you with a more successful cousin.', 'Orang tuamu membandingkanmu dengan sepupu yang lebih sukses.'], ['Hurt', 'Tersinggung']),
  sc('EI23', 'family', 'hard', ['Your parents finally let you choose your own major, but they look disappointed.', 'Orang tuamu akhirnya mengizinkanmu memilih jurusan sendiri, tapi mereka terlihat kecewa.'], ['Relieved but sad', 'Lega tapi sedih']),
  sc('EI24', 'family', 'hard', ['You live on your own, far from your family, for the first time.', 'Untuk pertama kalinya kamu tinggal sendiri, jauh dari keluarga.'], ['Free but lonely', 'Merasa bebas tapi kesepian']),
  // Crushes & romance
  sc('EI25', 'romance', 'easy', ['Your crush replies to your message quickly and at length.', 'Gebetanmu membalas chatmu dengan cepat dan panjang.'], ['Giddy', 'Berbunga-bunga']),
  sc('EI26', 'romance', 'easy', ['Your crush still hasn’t replied to your message from yesterday.', 'Chatmu ke gebetan sejak kemarin belum juga dibalas.'], ['Anxious', 'Cemas']),
  sc('EI27', 'romance', 'medium', ['Your ex invites you to their engagement party.', 'Mantanmu mengundangmu ke acara pertunangannya.'], ['Awkward and conflicted', 'Canggung dan serba salah']),
  sc('EI28', 'romance', 'medium', ['A friend catches you staring at your crush.', 'Temanmu memergokimu sedang memandangi gebetanmu.'], ['Embarrassed', 'Malu']),
  sc('EI29', 'romance', 'hard', ['Your best friend confesses they like you, but you don’t feel the same way.', 'Sahabatmu menyatakan perasaan padamu, tapi kamu tidak merasakan hal yang sama.'], ['Flattered but confused', 'Tersanjung tapi bingung']),
  sc('EI30', 'romance', 'hard', ['Your crush starts dating one of your friends.', 'Gebetanmu ternyata jadian dengan temanmu sendiri.'], ['Heartbroken but acting fine', 'Patah hati tapi pura-pura baik-baik saja']),
  // Everyday life
  sc('EI31', 'daily', 'easy', ['Your food delivery arrives and it’s the wrong order.', 'Pesanan makananmu datang dan ternyata salah.'], ['Annoyed', 'Kesal']),
  sc('EI32', 'daily', 'easy', ['You find money in the pocket of an old pair of trousers.', 'Kamu menemukan uang di saku celana lama.'], ['Pleasantly surprised', 'Senang dan kaget']),
  sc('EI33', 'daily', 'medium', ['You’re stuck in heavy traffic and about to be late for something important.', 'Kamu terjebak macet parah padahal hampir telat ke acara penting.'], ['Panicking but resigned', 'Panik tapi pasrah']),
  sc('EI34', 'daily', 'medium', ['Something expensive you just bought goes on 50% sale the next day.', 'Barang mahal yang baru kamu beli ternyata diskon 50% keesokan harinya.'], ['Regretful', 'Menyesal']),
  sc('EI35', 'daily', 'hard', ['A stranger compliments your style, then turns out to be selling something.', 'Orang asing memuji gayamu, lalu ternyata dia menawarkan produk.'], ['Flattered, then let down', 'Tersanjung, lalu kecewa']),
  sc('EI36', 'daily', 'hard', ['You win a raffle, but the prize must be collected in a city far away.', 'Kamu memenangkan undian, tapi hadiahnya harus diambil di kota yang jauh.'], ['Excited but hassled', 'Gembira tapi repot']),
];
