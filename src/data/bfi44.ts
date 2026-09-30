/**
 * Big Five Inventory (BFI-44) — John, Donahue & Kentle (1991); John & Srivastava (1999).
 * Item wording and scoring key follow the published instrument (free for
 * non-commercial research use). `reversed: true` items are reverse-scored (6 - answer).
 *
 * The Indonesian wording is a working translation for this app. For formal
 * research, use a validated Indonesian adaptation instead.
 */
import type { Trait } from '@/lib/personality/bfi';

export interface BfiItem {
  id: number;
  trait: Trait;
  reversed: boolean;
  text: { en: string; id: string };
}

export const BFI_STEM = {
  en: 'I see myself as someone who…',
  id: 'Saya melihat diri saya sebagai orang yang…',
};

export const BFI_ITEMS: BfiItem[] = [
  { id: 1, trait: 'E', reversed: false, text: { en: 'Is talkative', id: 'Banyak bicara' } },
  { id: 2, trait: 'A', reversed: true, text: { en: 'Tends to find fault with others', id: 'Cenderung mencari-cari kesalahan orang lain' } },
  { id: 3, trait: 'C', reversed: false, text: { en: 'Does a thorough job', id: 'Mengerjakan tugas dengan tuntas dan teliti' } },
  { id: 4, trait: 'N', reversed: false, text: { en: 'Is depressed, blue', id: 'Sering merasa murung atau sedih' } },
  { id: 5, trait: 'O', reversed: false, text: { en: 'Is original, comes up with new ideas', id: 'Orisinal, sering memunculkan ide-ide baru' } },
  { id: 6, trait: 'E', reversed: true, text: { en: 'Is reserved', id: 'Cenderung menahan diri dan tertutup' } },
  { id: 7, trait: 'A', reversed: false, text: { en: 'Is helpful and unselfish with others', id: 'Suka menolong dan tidak egois terhadap orang lain' } },
  { id: 8, trait: 'C', reversed: true, text: { en: 'Can be somewhat careless', id: 'Kadang agak ceroboh' } },
  { id: 9, trait: 'N', reversed: true, text: { en: 'Is relaxed, handles stress well', id: 'Santai dan mampu menghadapi stres dengan baik' } },
  { id: 10, trait: 'O', reversed: false, text: { en: 'Is curious about many different things', id: 'Ingin tahu tentang banyak hal yang berbeda' } },
  { id: 11, trait: 'E', reversed: false, text: { en: 'Is full of energy', id: 'Penuh energi' } },
  { id: 12, trait: 'A', reversed: true, text: { en: 'Starts quarrels with others', id: 'Suka memulai pertengkaran dengan orang lain' } },
  { id: 13, trait: 'C', reversed: false, text: { en: 'Is a reliable worker', id: 'Pekerja yang dapat diandalkan' } },
  { id: 14, trait: 'N', reversed: false, text: { en: 'Can be tense', id: 'Mudah tegang' } },
  { id: 15, trait: 'O', reversed: false, text: { en: 'Is ingenious, a deep thinker', id: 'Cerdik dan seorang pemikir yang mendalam' } },
  { id: 16, trait: 'E', reversed: false, text: { en: 'Generates a lot of enthusiasm', id: 'Mampu membangkitkan banyak antusiasme' } },
  { id: 17, trait: 'A', reversed: false, text: { en: 'Has a forgiving nature', id: 'Memiliki sifat pemaaf' } },
  { id: 18, trait: 'C', reversed: true, text: { en: 'Tends to be disorganized', id: 'Cenderung tidak teratur' } },
  { id: 19, trait: 'N', reversed: false, text: { en: 'Worries a lot', id: 'Banyak merasa khawatir' } },
  { id: 20, trait: 'O', reversed: false, text: { en: 'Has an active imagination', id: 'Memiliki imajinasi yang aktif' } },
  { id: 21, trait: 'E', reversed: true, text: { en: 'Tends to be quiet', id: 'Cenderung pendiam' } },
  { id: 22, trait: 'A', reversed: false, text: { en: 'Is generally trusting', id: 'Pada umumnya mudah memercayai orang lain' } },
  { id: 23, trait: 'C', reversed: true, text: { en: 'Tends to be lazy', id: 'Cenderung malas' } },
  { id: 24, trait: 'N', reversed: true, text: { en: 'Is emotionally stable, not easily upset', id: 'Stabil secara emosi, tidak mudah kesal' } },
  { id: 25, trait: 'O', reversed: false, text: { en: 'Is inventive', id: 'Inventif, pandai menciptakan hal baru' } },
  { id: 26, trait: 'E', reversed: false, text: { en: 'Has an assertive personality', id: 'Memiliki kepribadian yang asertif (berani menyatakan pendapat)' } },
  { id: 27, trait: 'A', reversed: true, text: { en: 'Can be cold and aloof', id: 'Bisa bersikap dingin dan menjaga jarak' } },
  { id: 28, trait: 'C', reversed: false, text: { en: 'Perseveres until the task is finished', id: 'Tekun sampai tugas selesai' } },
  { id: 29, trait: 'N', reversed: false, text: { en: 'Can be moody', id: 'Suasana hatinya mudah berubah-ubah' } },
  { id: 30, trait: 'O', reversed: false, text: { en: 'Values artistic, aesthetic experiences', id: 'Menghargai pengalaman artistik dan estetis' } },
  { id: 31, trait: 'E', reversed: true, text: { en: 'Is sometimes shy, inhibited', id: 'Kadang pemalu dan canggung' } },
  { id: 32, trait: 'A', reversed: false, text: { en: 'Is considerate and kind to almost everyone', id: 'Perhatian dan baik kepada hampir semua orang' } },
  { id: 33, trait: 'C', reversed: false, text: { en: 'Does things efficiently', id: 'Mengerjakan sesuatu secara efisien' } },
  { id: 34, trait: 'N', reversed: true, text: { en: 'Remains calm in tense situations', id: 'Tetap tenang dalam situasi yang menegangkan' } },
  { id: 35, trait: 'O', reversed: true, text: { en: 'Prefers work that is routine', id: 'Lebih menyukai pekerjaan yang rutin' } },
  { id: 36, trait: 'E', reversed: false, text: { en: 'Is outgoing, sociable', id: 'Ramah dan mudah bergaul' } },
  { id: 37, trait: 'A', reversed: true, text: { en: 'Is sometimes rude to others', id: 'Kadang bersikap kasar kepada orang lain' } },
  { id: 38, trait: 'C', reversed: false, text: { en: 'Makes plans and follows through with them', id: 'Membuat rencana dan menjalankannya sampai tuntas' } },
  { id: 39, trait: 'N', reversed: false, text: { en: 'Gets nervous easily', id: 'Mudah gugup' } },
  { id: 40, trait: 'O', reversed: false, text: { en: 'Likes to reflect, play with ideas', id: 'Suka merenung dan bermain-main dengan ide' } },
  { id: 41, trait: 'O', reversed: true, text: { en: 'Has few artistic interests', id: 'Hanya memiliki sedikit minat pada seni' } },
  { id: 42, trait: 'A', reversed: false, text: { en: 'Likes to cooperate with others', id: 'Suka bekerja sama dengan orang lain' } },
  { id: 43, trait: 'C', reversed: true, text: { en: 'Is easily distracted', id: 'Mudah teralihkan perhatiannya' } },
  { id: 44, trait: 'O', reversed: false, text: { en: 'Is sophisticated in art, music, or literature', id: 'Memiliki selera yang tinggi dalam seni, musik, atau sastra' } },
];

export const LIKERT_LABELS = {
  en: ['Disagree strongly', 'Disagree a little', 'Neither agree nor disagree', 'Agree a little', 'Agree strongly'],
  id: ['Sangat tidak setuju', 'Agak tidak setuju', 'Netral', 'Agak setuju', 'Sangat setuju'],
};
