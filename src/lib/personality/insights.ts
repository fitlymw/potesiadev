/**
 * Positive / negative trait insights for PersonaCore (pure functions, no React).
 *
 * Every insight pairs a strength with the downside that tends to come with it
 * (e.g. kind and helpful → struggles to say no). Insights come from three
 * kinds of evidence, each recorded in `basis` so the UI can show why:
 *  1. a single trait that is clearly High or Low,
 *  2. a combination of two traits,
 *  3. a pattern in the answers to specific BFI-44 statements.
 * Insights sharing a `tag` describe the same idea and are merged: the most
 * specific wording wins (answer patterns / trait combinations over a single
 * trait) and the evidence of all of them is combined.
 */
import { BFI_ITEMS } from '@/data/bfi44';
import type { BfiProfile, Trait, TraitLevel } from '@/lib/personality/bfi';

type Localized = { en: string; id: string };

export type InsightBasis = { kind: 'trait'; trait: Trait } | { kind: 'item'; itemId: number };

export interface Insight {
  tag: string;
  positive: Localized;
  negative: Localized;
  basis: InsightBasis[];
  /** Higher = stronger evidence; used for ranking. */
  strength: number;
}

type Content = Pick<Insight, 'positive' | 'negative'>;

// ==================== 1. SINGLE TRAIT ====================
// Note: N 'high' = high Neuroticism = LOW emotional stability.
const TRAIT_RULES: { trait: Trait; level: Exclude<TraitLevel, 'moderate'>; tag: string; content: Content }[] = [
  {
    trait: 'E', level: 'high', tag: 'E-high',
    content: {
      positive: { en: 'Sociable, makes friends quickly, and brings energy to a group.', id: 'Mudah bergaul, cepat akrab, dan membawa energi ke dalam kelompok.' },
      negative: { en: 'Can dominate conversations and gets restless when alone for too long.', id: 'Bisa mendominasi obrolan dan cepat gelisah kalau terlalu lama sendirian.' },
    },
  },
  {
    trait: 'E', level: 'low', tag: 'E-low',
    content: {
      positive: { en: 'A good listener who is comfortable working independently.', id: 'Pendengar yang baik dan nyaman bekerja secara mandiri.' },
      negative: { en: 'Can come across as distant, and your ideas may go unheard in groups.', id: 'Bisa dianggap dingin atau sulit didekati, dan idemu sering tidak terdengar di kelompok.' },
    },
  },
  {
    trait: 'A', level: 'high', tag: 'people-pleaser',
    content: {
      positive: { en: 'Kind, helpful, and easy for people to trust.', id: 'Baik hati, suka menolong, dan mudah dipercaya orang lain.' },
      negative: { en: 'Tends to give in to keep the peace, even when it costs you.', id: 'Cenderung mengalah demi menjaga hubungan, meskipun merugikan dirimu sendiri.' },
    },
  },
  {
    trait: 'A', level: 'low', tag: 'A-low',
    content: {
      positive: { en: 'Honest and not afraid to speak your mind, including giving criticism.', id: 'Jujur dan berani menyampaikan pendapat, termasuk memberi kritik.' },
      negative: { en: 'Can sound harsh or stubborn and get into conflicts more easily.', id: 'Bisa terdengar kasar atau keras kepala, dan lebih mudah terlibat konflik.' },
    },
  },
  {
    trait: 'C', level: 'high', tag: 'C-high',
    content: {
      positive: { en: 'Organized, responsible, and reliable at finishing tasks.', id: 'Teratur, bertanggung jawab, dan bisa diandalkan untuk menyelesaikan tugas.' },
      negative: { en: 'Can be perfectionistic and rigid when plans change.', id: 'Bisa perfeksionis dan kaku saat rencana berubah.' },
    },
  },
  {
    trait: 'C', level: 'low', tag: 'C-low',
    content: {
      positive: { en: 'Flexible and relaxed about sudden changes.', id: 'Fleksibel dan santai menghadapi perubahan mendadak.' },
      negative: { en: 'Prone to procrastinating and struggles to manage time.', id: 'Mudah menunda pekerjaan dan kurang rapi dalam mengatur waktu.' },
    },
  },
  {
    trait: 'N', level: 'high', tag: 'anxiety',
    content: {
      positive: { en: 'Sensitive to your own and others’ feelings, and alert to risks.', id: 'Peka terhadap perasaan sendiri maupun orang lain, serta waspada terhadap risiko.' },
      negative: { en: 'Worries easily, overthinks, and your mood shifts quickly under stress.', id: 'Mudah cemas, sering overthinking, dan suasana hati cepat berubah saat tertekan.' },
    },
  },
  {
    trait: 'N', level: 'low', tag: 'N-low',
    content: {
      positive: { en: 'Calm and hard to rattle under pressure.', id: 'Tenang dan tidak mudah panik di bawah tekanan.' },
      negative: { en: 'May seem indifferent to problems other people take seriously.', id: 'Bisa terlihat kurang peduli pada masalah yang dianggap serius oleh orang lain.' },
    },
  },
  {
    trait: 'O', level: 'high', tag: 'O-high',
    content: {
      positive: { en: 'Creative, curious, and open to new ideas and experiences.', id: 'Kreatif, penasaran, dan terbuka pada ide serta pengalaman baru.' },
      negative: { en: 'Bored by routine, and sometimes has more ideas than follow-through.', id: 'Mudah bosan dengan rutinitas, dan kadang punya banyak ide tanpa eksekusi.' },
    },
  },
  {
    trait: 'O', level: 'low', tag: 'O-low',
    content: {
      positive: { en: 'Practical, realistic, and consistent with proven methods.', id: 'Praktis, realistis, dan konsisten dengan cara yang sudah terbukti.' },
      negative: { en: 'Tends to resist change and feels uneasy with abstract ideas.', id: 'Cenderung menolak perubahan dan kurang nyaman dengan hal-hal yang abstrak.' },
    },
  },
];

// ==================== 2. TRAIT COMBINATIONS ====================
type Cond = [Trait, Exclude<TraitLevel, 'moderate'>];
const COMBO_RULES: { when: [Cond, Cond]; tag: string; content: Content }[] = [
  {
    when: [['A', 'high'], ['N', 'high']], tag: 'people-pleaser',
    content: {
      positive: { en: 'Deeply considerate of how other people feel.', id: 'Sangat memperhatikan perasaan orang lain.' },
      negative: { en: 'People pleaser: finds it hard to refuse requests and fears disappointing others, so often overextends.', id: 'People pleaser: sulit menolak permintaan dan takut mengecewakan orang, sehingga sering memaksakan diri.' },
    },
  },
  {
    when: [['A', 'high'], ['E', 'high']], tag: 'people-pleaser',
    content: {
      positive: { en: 'Warm, open, and easily liked by many people.', id: 'Hangat, terbuka, dan mudah disukai banyak orang.' },
      negative: { en: 'Struggles to say no to invitations or pressure, so time and energy often go to others first.', id: 'Sulit bilang "tidak" pada ajakan atau paksaan orang lain, sehingga waktu dan energimu sering habis untuk orang lain.' },
    },
  },
  {
    when: [['C', 'high'], ['N', 'high']], tag: 'perfectionism',
    content: {
      positive: { en: 'Thorough and always well prepared.', id: 'Teliti dan selalu mempersiapkan segala sesuatu dengan matang.' },
      negative: { en: 'Overthinks and is rarely satisfied with your own work.', id: 'Sering overthinking dan jarang merasa puas dengan hasil kerjamu sendiri.' },
    },
  },
  {
    when: [['O', 'high'], ['C', 'low']], tag: 'unfinished',
    content: {
      positive: { en: 'Full of ideas and interests.', id: 'Punya banyak ide dan minat.' },
      negative: { en: 'Often starts many things but struggles to finish them.', id: 'Sering memulai banyak hal tapi sulit menyelesaikannya.' },
    },
  },
  {
    when: [['E', 'high'], ['C', 'low']], tag: 'impulsive',
    content: {
      positive: { en: 'Spontaneous and up for anything.', id: 'Spontan dan seru diajak melakukan apa saja.' },
      negative: { en: 'Impulsive; sometimes decides without thinking it through.', id: 'Impulsif; kadang mengambil keputusan tanpa pertimbangan matang.' },
    },
  },
  {
    when: [['E', 'low'], ['N', 'high']], tag: 'bottling',
    content: {
      positive: { en: 'Reflective and careful before acting.', id: 'Reflektif dan berhati-hati sebelum bertindak.' },
      negative: { en: 'Tends to keep problems to yourself and hesitates to ask for help.', id: 'Cenderung memendam masalah sendiri dan sungkan meminta bantuan.' },
    },
  },
  {
    when: [['A', 'low'], ['C', 'high']], tag: 'demanding',
    content: {
      positive: { en: 'Firm and holds high standards at work.', id: 'Tegas dan punya standar tinggi dalam bekerja.' },
      negative: { en: 'Can be too demanding and impatient with others.', id: 'Bisa terlalu menuntut dan kurang sabar terhadap orang lain.' },
    },
  },
  {
    when: [['E', 'high'], ['A', 'low']], tag: 'dominant',
    content: {
      positive: { en: 'Confident and willing to take the lead.', id: 'Percaya diri dan berani memimpin.' },
      negative: { en: 'Can be overbearing and not listen enough to others.', id: 'Kadang terlalu dominan dan kurang mendengarkan pendapat orang lain.' },
    },
  },
  {
    when: [['O', 'high'], ['N', 'high']], tag: 'rumination',
    content: {
      positive: { en: 'Imaginative and emotionally rich.', id: 'Imajinatif dan kaya perasaan.' },
      negative: { en: 'Easily gets lost in your head and imagines worst-case scenarios.', id: 'Mudah larut dalam pikiran sendiri dan membayangkan skenario terburuk.' },
    },
  },
];

// ==================== 3. ANSWER PATTERNS ====================
// `agree` = answered 4–5, `disagree` = answered 1–2 on that BFI-44 statement.
type ItemCond = { id: number; agree: boolean };
const ITEM_RULES: { when: ItemCond[]; tag: string; content: Content }[] = [
  {
    // "Is helpful and unselfish" + NOT "Has an assertive personality"
    when: [{ id: 7, agree: true }, { id: 26, agree: false }], tag: 'people-pleaser',
    content: {
      positive: { en: 'Likes helping others without expecting anything back.', id: 'Senang menolong orang lain tanpa pamrih.' },
      negative: { en: 'People pleaser: finds it hard to turn down invitations or pressure because standing firm feels uncomfortable.', id: 'People pleaser: sulit menolak ajakan atau paksaan orang lain karena kurang berani bersikap tegas.' },
    },
  },
  {
    // "Is generally trusting" + "Has a forgiving nature"
    when: [{ id: 22, agree: true }, { id: 17, agree: true }], tag: 'trusting',
    content: {
      positive: { en: 'Trusting and forgiving; you see the good in people.', id: 'Mudah percaya dan pemaaf; kamu melihat sisi baik orang lain.' },
      negative: { en: 'May trust too quickly and risk being taken advantage of.', id: 'Bisa terlalu cepat percaya sehingga berisiko dimanfaatkan orang lain.' },
    },
  },
  {
    // "Worries a lot" + "Makes plans and follows through"
    when: [{ id: 19, agree: true }, { id: 38, agree: true }], tag: 'perfectionism',
    content: {
      positive: { en: 'Always has a plan and a backup plan.', id: 'Selalu punya rencana, bahkan rencana cadangan.' },
      negative: { en: 'Thinks so much about what could go wrong that starting feels hard.', id: 'Terlalu banyak memikirkan kemungkinan buruk sampai sulit untuk mulai bertindak.' },
    },
  },
  {
    // "Is curious about many things" + "Is easily distracted"
    when: [{ id: 10, agree: true }, { id: 43, agree: true }], tag: 'unfinished',
    content: {
      positive: { en: 'Curious about many different things.', id: 'Rasa ingin tahumu besar terhadap banyak hal.' },
      negative: { en: 'Your focus jumps easily to whatever is new.', id: 'Fokusmu mudah terpecah ke hal-hal baru.' },
    },
  },
  {
    // "Tends to be quiet" + "Likes to reflect, play with ideas"
    when: [{ id: 21, agree: true }, { id: 40, agree: true }], tag: 'quiet-thinker',
    content: {
      positive: { en: 'A deep thinker who thinks before speaking.', id: 'Pemikir yang mendalam dan berpikir dulu sebelum bicara.' },
      negative: { en: 'Good ideas often stay unspoken.', id: 'Ide-ide bagusmu sering tidak tersampaikan karena jarang diutarakan.' },
    },
  },
  {
    // "Has an assertive personality" + "Is sometimes rude to others"
    when: [{ id: 26, agree: true }, { id: 37, agree: true }], tag: 'blunt',
    content: {
      positive: { en: 'Bold and direct.', id: 'Berani dan lugas.' },
      negative: { en: 'The way you say things can hurt people without you noticing.', id: 'Cara bicaramu bisa melukai orang lain tanpa kamu sadari.' },
    },
  },
  {
    // "Perseveres until the task is finished" + "Can be tense"
    when: [{ id: 28, agree: true }, { id: 14, agree: true }], tag: 'overwork',
    content: {
      positive: { en: 'Persistent in finishing what you start.', id: 'Gigih menyelesaikan apa yang sudah kamu mulai.' },
      negative: { en: 'Often pushes yourself until stressed or exhausted.', id: 'Sering memaksakan diri sampai stres atau kelelahan.' },
    },
  },
];

// ==================== FALLBACK (balanced profiles) ====================
const MODERATE_RULES: Record<Trait, Content> = {
  E: {
    positive: { en: 'Can enjoy both social time and time alone.', id: 'Bisa menikmati keramaian maupun waktu sendiri.' },
    negative: { en: 'Sometimes pushes yourself to socialize when you actually need rest.', id: 'Kadang memaksakan diri ikut berkumpul padahal sebenarnya butuh istirahat.' },
  },
  A: {
    positive: { en: 'Can be kind while still standing firm when needed.', id: 'Bisa bersikap baik tapi tetap tegas saat diperlukan.' },
    negative: { en: 'Occasionally unsure when to give in and when to hold your ground.', id: 'Sesekali ragu kapan harus mengalah dan kapan harus bertahan.' },
  },
  C: {
    positive: { en: 'Fairly organized while staying flexible.', id: 'Cukup teratur tapi tetap fleksibel.' },
    negative: { en: 'Your discipline can rise and fall with your mood and interest.', id: 'Kedisiplinanmu bisa naik-turun tergantung minat dan suasana hati.' },
  },
  N: {
    positive: { en: 'Your emotions are generally under control.', id: 'Emosimu umumnya terkendali.' },
    negative: { en: 'Pressure that piles up can still make you anxious.', id: 'Tekanan yang menumpuk tetap bisa membuatmu cemas.' },
  },
  O: {
    positive: { en: 'Open to new things while staying realistic.', id: 'Terbuka pada hal baru tapi tetap realistis.' },
    negative: { en: 'Sometimes torn between trying something new and staying in your comfort zone.', id: 'Kadang bimbang antara mencoba hal baru atau tetap di zona nyaman.' },
  },
};

const COMBO_BONUS = 0.25;
const MIN_INSIGHTS = 3;

/**
 * @param answers raw 1–5 answers in BFI_ITEMS order
 * @param max     maximum number of insights returned
 */
export function deriveInsights(profile: BfiProfile, answers: number[], max = 5): Insight[] {
  const candidates: Insight[] = [];

  for (const rule of TRAIT_RULES) {
    const score = profile[rule.trait];
    if (score.level === rule.level) {
      candidates.push({ tag: rule.tag, ...rule.content, basis: [{ kind: 'trait', trait: rule.trait }], strength: Math.abs(score.z) });
    }
  }

  for (const rule of COMBO_RULES) {
    if (rule.when.every(([trait, level]) => profile[trait].level === level)) {
      const strength = Math.min(...rule.when.map(([trait]) => Math.abs(profile[trait].z))) + COMBO_BONUS;
      candidates.push({ tag: rule.tag, ...rule.content, basis: rule.when.map(([trait]) => ({ kind: 'trait', trait })), strength });
    }
  }

  const answerOf = (id: number) => answers[BFI_ITEMS.findIndex((item) => item.id === id)];
  for (const rule of ITEM_RULES) {
    const values = rule.when.map((c) => answerOf(c.id));
    const matched = rule.when.every((c, i) => (c.agree ? values[i] >= 4 : values[i] <= 2));
    if (matched) {
      // 1.0 when every answer is "a little", 1.5 when every answer is "strongly"
      const extremity = values.reduce((acc, v) => acc + Math.abs(v - 3), 0) / values.length;
      candidates.push({ tag: rule.tag, ...rule.content, basis: rule.when.map((c) => ({ kind: 'item', itemId: c.id })), strength: 0.5 + extremity / 2 });
    }
  }

  // Merge insights per tag: specific wording wins, evidence is combined,
  // and the group ranks by its strongest piece of evidence.
  const specificity = (insight: Insight) => (insight.basis.length > 1 ? 1 : 0);
  const byTag = new Map<string, Insight[]>();
  for (const insight of candidates) byTag.set(insight.tag, [...(byTag.get(insight.tag) ?? []), insight]);
  const merged = [...byTag.values()].map((group) => {
    const [best] = [...group].sort((a, b) => specificity(b) - specificity(a) || b.strength - a.strength);
    const basis: InsightBasis[] = [];
    for (const b of group.flatMap((insight) => insight.basis)) {
      if (!basis.some((x) => JSON.stringify(x) === JSON.stringify(b))) basis.push(b);
    }
    return { ...best, basis, strength: Math.max(...group.map((insight) => insight.strength)) };
  });
  const insights = merged.sort((a, b) => b.strength - a.strength).slice(0, max);

  // Balanced profiles: fill up with the moderate traits closest to standing out
  if (insights.length < MIN_INSIGHTS) {
    const moderate = (Object.keys(MODERATE_RULES) as Trait[])
      .filter((trait) => profile[trait].level === 'moderate')
      .sort((a, b) => Math.abs(profile[b].z) - Math.abs(profile[a].z));
    for (const trait of moderate) {
      if (insights.length >= MIN_INSIGHTS) break;
      insights.push({ tag: `${trait}-moderate`, ...MODERATE_RULES[trait], basis: [{ kind: 'trait', trait }], strength: 0 });
    }
  }
  return insights;
}
