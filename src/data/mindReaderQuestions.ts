/**
 * Mind Reader question bank (EN + ID).
 * Every question is a 1–10 self-rating with labelled ends. Wording is neutral
 * (no "good" end) so the Target is not pushed toward a socially desirable answer.
 */

type Localized = { en: string; id: string };

export type MindReaderCategory = 'social' | 'emotion' | 'work' | 'decision' | 'relationship' | 'lifestyle';

export interface MindReaderQuestion {
  id: string;
  category: MindReaderCategory;
  text: Localized;
  /** Label for 1 */
  low: Localized;
  /** Label for 10 */
  high: Localized;
}

export const CATEGORY_LABEL: Record<MindReaderCategory, Localized> = {
  social: { en: 'Social energy', id: 'Energi sosial' },
  emotion: { en: 'Emotions & stress', id: 'Emosi & stres' },
  work: { en: 'Work style', id: 'Gaya kerja' },
  decision: { en: 'Decisions & risk', id: 'Keputusan & risiko' },
  relationship: { en: 'Relationships', id: 'Hubungan' },
  lifestyle: { en: 'Lifestyle', id: 'Gaya hidup' },
};

const q = (
  id: string,
  category: MindReaderCategory,
  text: [string, string],
  low: [string, string],
  high: [string, string]
): MindReaderQuestion => ({
  id,
  category,
  text: { en: text[0], id: text[1] },
  low: { en: low[0], id: low[1] },
  high: { en: high[0], id: high[1] },
});

export const MIND_READER_QUESTIONS: MindReaderQuestion[] = [
  // Social energy
  q('MR01', 'social', ['After a busy week, how much do you want to go out with friends on the weekend?', 'Setelah seminggu sibuk, seberapa ingin kamu keluar bersama teman di akhir pekan?'], ['Staying home', 'Di rumah saja'], ['Out right away', 'Langsung keluar']),
  q('MR02', 'social', ['How comfortable are you starting a conversation with a stranger?', 'Seberapa nyaman kamu memulai obrolan dengan orang asing?'], ['Very uncomfortable', 'Sangat tidak nyaman'], ['Very comfortable', 'Sangat nyaman']),
  q('MR03', 'social', ['How active are you in group chats?', 'Seberapa aktif kamu di grup chat?'], ['Silent reader', 'Pembaca diam'], ['The loudest one', 'Paling ramai']),
  q('MR04', 'social', ['How much do you enjoy being the center of attention?', 'Seberapa suka kamu menjadi pusat perhatian?'], ['Avoid it', 'Menghindarinya'], ['Love it', 'Sangat suka']),
  q('MR05', 'social', ['How often do you feel you need time completely alone?', 'Seberapa sering kamu merasa butuh waktu benar-benar sendirian?'], ['Rarely', 'Jarang'], ['Very often', 'Sangat sering']),
  // Emotions & stress
  q('MR06', 'emotion', ['How anxious do you get when tasks pile up?', 'Seberapa cemas kamu saat tugas menumpuk?'], ['Stay relaxed', 'Tetap santai'], ['Very anxious', 'Sangat cemas']),
  q('MR07', 'emotion', ['How often do you overthink before falling asleep?', 'Seberapa sering kamu overthinking sebelum tidur?'], ['Almost never', 'Hampir tidak pernah'], ['Almost every night', 'Hampir setiap malam']),
  q('MR08', 'emotion', ["When you're annoyed, how visible is it on your face?", 'Saat sedang kesal, seberapa terlihat di wajahmu?'], ['Not visible at all', 'Tidak terlihat sama sekali'], ['Obvious right away', 'Langsung ketahuan']),
  q('MR09', 'emotion', ['How quickly do you bounce back after a failure?', 'Seberapa cepat kamu bangkit setelah mengalami kegagalan?'], ['Takes a long time', 'Butuh waktu lama'], ['Bounce back fast', 'Cepat bangkit']),
  q('MR10', 'emotion', ['How easily do you cry at a sad movie?', 'Seberapa mudah kamu menangis saat menonton film sedih?'], ['Never', 'Tidak pernah'], ['Every time', 'Selalu']),
  // Work style
  q('MR11', 'work', ['How carefully do you plan your daily schedule?', 'Seberapa rapi kamu merencanakan jadwal harianmu?'], ['Go with the flow', 'Mengalir saja'], ['Everything scheduled', 'Semua terjadwal']),
  q('MR12', 'work', ['How often do you leave work until right before the deadline?', 'Seberapa sering kamu menunda pekerjaan sampai mepet tenggat?'], ['Never', 'Tidak pernah'], ['Always', 'Selalu']),
  q('MR13', 'work', ['Do you prefer working alone or in a team?', 'Kamu lebih suka bekerja sendiri atau dalam tim?'], ['Alone', 'Sendiri'], ['In a team', 'Dalam tim']),
  q('MR14', 'work', ['How much of a perfectionist are you about your work?', 'Seberapa perfeksionis kamu terhadap hasil kerjamu?'], ['"Good enough" is fine', '"Cukup" sudah oke'], ['Must be perfect', 'Harus sempurna']),
  q('MR15', 'work', ['How much do you enjoy leading a group?', 'Seberapa suka kamu memimpin sebuah kelompok?'], ['Prefer to follow', 'Lebih suka mengikuti'], ['Love to lead', 'Sangat suka memimpin']),
  // Decisions & risk
  q('MR16', 'decision', ['How willing are you to take a big risk for a big opportunity?', 'Seberapa berani kamu mengambil risiko besar demi peluang besar?'], ['Play it safe', 'Main aman'], ['Take the risk', 'Ambil risikonya']),
  q('MR17', 'decision', ['For important decisions, do you rely more on logic or feelings?', 'Untuk keputusan penting, kamu lebih mengandalkan logika atau perasaan?'], ['Logic', 'Logika'], ['Feelings', 'Perasaan']),
  q('MR18', 'decision', ['How impulsive are you when shopping?', 'Seberapa impulsif kamu saat belanja?'], ['Think it through', 'Selalu pikir panjang'], ['Straight to checkout', 'Langsung checkout']),
  q('MR19', 'decision', ['How open are you to trying new food, places, or hobbies?', 'Seberapa terbuka kamu mencoba makanan, tempat, atau hobi baru?'], ['Stick to favorites', 'Setia pada yang biasa'], ['Always try new things', 'Selalu coba yang baru']),
  q('MR20', 'decision', ['How long does it take you to choose what to eat?', 'Seberapa lama kamu memilih mau makan apa?'], ['Decide instantly', 'Langsung memutuskan'], ['Takes forever', 'Lama sekali']),
  // Relationships
  q('MR21', 'relationship', ['How easy is it for you to say "no" to a friend’s invitation?', 'Seberapa mudah kamu bilang "tidak" pada ajakan teman?'], ['Very hard', 'Sangat sulit'], ['Very easy', 'Sangat mudah']),
  q('MR22', 'relationship', ['How easily do you forgive a friend who hurt you?', 'Seberapa mudah kamu memaafkan teman yang menyakitimu?'], ['Very hard', 'Sangat sulit'], ['Very easily', 'Sangat mudah']),
  q('MR23', 'relationship', ['How often do you share personal problems with others?', 'Seberapa sering kamu menceritakan masalah pribadi ke orang lain?'], ['Keep it to myself', 'Dipendam sendiri'], ['Always share', 'Selalu cerita']),
  q('MR24', 'relationship', ['How much do other people’s opinions of you matter to you?', 'Seberapa penting pendapat orang lain tentang dirimu?'], ['Not at all', 'Tidak penting'], ['Very much', 'Sangat penting']),
  q('MR25', 'relationship', ['When there is conflict in a group, how directly do you speak up?', 'Saat ada konflik dalam kelompok, seberapa langsung kamu bicara?'], ['Avoid it', 'Menghindar'], ['Speak up directly', 'Langsung bicara']),
  q('MR26', 'relationship', ['How competitive are you when playing games with friends?', 'Seberapa kompetitif kamu saat bermain game dengan teman?'], ['Just for fun', 'Santai saja'], ['Must win', 'Harus menang']),
  q('MR27', 'relationship', ['When a friend asks "how do I look?", how blunt is your answer?', 'Saat teman bertanya "penampilanku bagaimana?", seberapa blak-blakan jawabanmu?'], ['Always say it’s great', 'Selalu bilang bagus'], ['Totally honest', 'Jujur apa adanya']),
  // Lifestyle
  q('MR28', 'lifestyle', ['On a day off, how early do you usually wake up?', 'Saat hari libur, seberapa pagi biasanya kamu bangun?'], ['Very late', 'Siang sekali'], ['Very early', 'Pagi sekali']),
  q('MR29', 'lifestyle', ['How much do you like spicy food?', 'Seberapa suka kamu makanan pedas?'], ['Can’t handle it', 'Tidak kuat'], ['The spicier the better', 'Makin pedas makin enak']),
  q('MR30', 'lifestyle', ['How much do you enjoy horror movies?', 'Seberapa suka kamu film horor?'], ['Avoid them', 'Menghindarinya'], ['Love them', 'Sangat suka']),
  q('MR31', 'lifestyle', ['How tidy is your room right now?', 'Seberapa rapi kamarmu saat ini?'], ['Very messy', 'Sangat berantakan'], ['Very tidy', 'Sangat rapi']),
  q('MR32', 'lifestyle', ['How careful are you with money?', 'Seberapa hemat kamu mengatur uang?'], ['Spend freely', 'Boros'], ['Very frugal', 'Sangat hemat']),
  q('MR33', 'lifestyle', ['How optimistic are you about your future?', 'Seberapa optimis kamu tentang masa depanmu?'], ['Worried', 'Khawatir'], ['Very optimistic', 'Sangat optimis']),
];
