import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';
import { useAudio } from '@/hooks/useAudio';
import { Sparkles, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

interface Statement {
  id: number;
  statement: string;
  axis: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  direction: 'positive' | 'negative';
}

interface GameState {
  screen: 'language' | 'playing' | 'result';
  language: 'en' | 'id' | null;
  currentIndex: number;
  // Track signed scores for each primary axis (E, S, T, J)
  // Positive = primary trait, Negative = opposite trait
  axisScores: {
    E: number;  // Positive = E, Negative = I
    S: number;  // Positive = S, Negative = N
    T: number;  // Positive = T, Negative = F
    J: number;  // Positive = J, Negative = P
  };
  answers: { value: number; axis: Statement['axis']; direction: string; weight: number; signedWeight: number }[];
}

interface MBTIResultData {
  type: string;
  percentages: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  preferenceClarity: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
  data: {
    title: string;
    core: string;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  };
}

interface MBTIOracleGameProps {
  onComplete?: (result: MBTIResultData) => void;
  onBack?: () => void;
}

// Likert to Weight mapping: 1=-2, 2=-1, 3=0, 4=1, 5=2
const LIKERT_TO_WEIGHT: Record<number, number> = {
  1: -2,
  2: -1,
  3: 0,
  4: 1,
  5: 2,
};

const LIKERT_OPTIONS = [
  { value: 1, label: { en: 'Strongly Disagree', id: 'Sangat Tidak Setuju' } },
  { value: 2, label: { en: 'Disagree', id: 'Tidak Setuju' } },
  { value: 3, label: { en: 'Neutral', id: 'Netral' } },
  { value: 4, label: { en: 'Agree', id: 'Setuju' } },
  { value: 5, label: { en: 'Strongly Agree', id: 'Sangat Setuju' } },
];

const MBTI_DATA: Record<string, { title: string; core: string; strengths: string[]; weaknesses: string[]; advice: string }> = {
  'INTJ': { title: 'The Architect', core: 'Imaginative and strategic thinkers, with a plan for everything.', strengths: ['Strategic Thinking', 'Independent Mind', 'High Standards', 'Analytical', 'Driven'], weaknesses: ['Overly Critical', 'Impatient', 'Emotionally Reserved', 'Perfectionist'], advice: 'Trust your strategic vision, but remember to value the perspectives of others.' },
  'INTP': { title: 'The Logician', core: 'Innovative inventors with an unquenchable thirst for knowledge.', strengths: ['Analytical Thinking', 'Creativity', 'Open-Minded', 'Objective', 'Theoretical'], weaknesses: ['Socially Awkward', 'Absent-Minded', 'Difficulty Expressing', 'Procrastination'], advice: 'Share your brilliant ideas with the world.' },
  'ENTJ': { title: 'The Commander', core: 'Bold, imaginative, and strong-willed leaders, always finding a way forward.', strengths: ['Natural Leader', 'Efficient', 'Strategic', 'Confident', 'Decisive'], weaknesses: ['Intolerant', 'Impatient', 'Aggressive', 'Arrogant'], advice: 'Lead with empathy as well as efficiency.' },
  'ENTP': { title: 'The Debater', core: 'Smart and curious thinkers who cannot resist an intellectual challenge.', strengths: ['Quick Thinker', 'Inventive', 'Enthusiastic', 'Verbal Skill', 'Creative'], weaknesses: ['Argumentative', 'Disorganized', 'Insensitive', 'Easily Bored'], advice: 'Channel your brilliant debates into constructive dialogue.' },
  'INFJ': { title: 'The Advocate', core: 'Quiet and mystical, yet very inspiring and tireless idealists.', strengths: ['Insightful', 'Principled', 'Passionate', 'Altruistic', 'Creative'], weaknesses: ['Sensitive', 'Perfectionist', 'Reserved', 'Hard to Please'], advice: 'Your vision of a better world is needed.' },
  'INFP': { title: 'The Mediator', core: 'Poetic, kind and altruistic people, always eager to help a good cause.', strengths: ['Empathetic', 'Creative', 'Idealistic', 'Passionate', 'Curious'], weaknesses: ['Self-Critical', 'Overly Idealistic', 'Unpractical', 'Emotionally Vulnerable'], advice: 'Your ideals are beautiful, but balance dreams with practical steps.' },
  'ENFJ': { title: 'The Protagonist', core: 'Charismatic and inspiring leaders, able to mesmerize their listeners.', strengths: ['Charismatic', 'Reliable', 'Natural Leader', 'Generous', 'Cooperative'], weaknesses: ['Overly Idealistic', 'Overbearing', 'Self-Sacrificing', 'Manipulative'], advice: 'Lead others to their own truth.' },
  'ENFP': { title: 'The Campaigner', core: 'Enthusiastic and creative free spirits, who can always find a reason to smile.', strengths: ['Fun', 'Enthusiastic', 'Spontaneous', 'Inventive', 'Affectionate'], weaknesses: ['Unfocused', 'Overly Optimistic', 'Poor Routine', 'Difficulty Concentrate'], advice: 'Channel your enthusiasm into projects that matter.' },
  'ISTJ': { title: 'The Logistician', core: 'Practical and fact-minded individuals, whose reliability cannot be doubted.', strengths: ['Reliable', 'Practical', 'Honest', 'Detail-Oriented', 'Responsible'], weaknesses: ['Inflexible', 'Reserved', 'Judgmental', 'By the Book'], advice: 'Your reliability is your strength.' },
  'ISFJ': { title: 'The Defender', core: 'Very dedicated and warm protectors, always ready to defend their loved ones.', strengths: ['Devoted', 'Warm', 'Reliable', 'Observant', 'Caring'], weaknesses: ['Self-Sacrificing', 'Repressed', 'Overburdened', 'Passive'], advice: 'Let others support you as much as you support them.' },
  'ESTJ': { title: 'The Executive', core: 'Excellent administrators, unsurpassd at managing things — or people.', strengths: ['Organized', 'Direct', 'Confident', 'Responsible', 'Traditional'], weaknesses: ['Inflexible', 'Uncompromising', 'Impatient', 'Insensitive'], advice: 'Remember that not everyone shares your need for structure.' },
  'ESFJ': { title: 'The Consul', core: 'Extraordinarily caring, social and popular people, always eager to help.', strengths: ['Social', 'Cooperative', 'Practical', 'Empathetic', 'Reliable'], weaknesses: ['Overly Caring', 'Insecure', 'Self-Sacrificing', 'Approval-Seeking'], advice: 'Trust that you are enough as you are.' },
  'ISTP': { title: 'The Virtuoso', core: 'Bold and practical experimenters, masters of all kinds of tools.', strengths: ['Practical', 'Spontaneous', 'Logical', 'Handy', 'Versatile'], weaknesses: ['Reserved', 'Stubborn', 'Insensitive', 'Risk-Taking'], advice: 'Balance your love of action with reflection.' },
  'ISFP': { title: 'The Adventurer', core: 'Flexible and charming artists, always ready to explore and experience something new.', strengths: ['Artistic', 'Adaptable', 'Charming', 'Observant', 'Enthusiastic'], weaknesses: ['Unpredictable', 'Indecisive', 'Easily Stressed', 'Self-Isolating'], advice: 'Share your unique perspective.' },
  'ESTP': { title: 'The Entrepreneur', core: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge.', strengths: ['Energetic', 'Pragmatic', 'Risk-Taker', 'Social', 'Direct'], weaknesses: ['Impatient', 'Unstructured', 'Insensitive', 'Dislike Commitment'], advice: 'Channel your boldness into meaningful pursuits.' },
  'ESFP': { title: 'The Entertainer', core: 'Spontaneous, energetic and enthusiastic people — life is never boring around them.', strengths: ['Fun', 'Enthusiastic', 'Spontaneous', 'Observant', 'Performing'], weaknesses: ['Unfocused', 'Sensitive', 'Unstructured', 'Attention-Seeking'], advice: 'Honor your own emotional journey.' },
};

// ENGLISH STATEMENTS
const ENGLISH_STATEMENTS: Statement[] = [
  // E vs I (15 statements)
  { id: 1, statement: "I feel energized when I'm in the middle of a crowd and easily get along with new people.", axis: "E", direction: "positive" },
  { id: 2, statement: "I prefer spending time alone reading or thinking rather than socializing.", axis: "E", direction: "negative" },
  { id: 3, statement: "I enjoy sharing stories and experiences directly with friends after activities are done.", axis: "E", direction: "positive" },
  { id: 4, statement: "I get my best ideas when I'm alone in quietness, not during group discussions.", axis: "E", direction: "negative" },
  { id: 5, statement: "I don't hesitate to start a conversation with someone I haven't met before.", axis: "E", direction: "positive" },
  { id: 6, statement: "Long social activities make me tired and I need time to recover.", axis: "E", direction: "negative" },
  { id: 7, statement: "I understand things more easily when discussing them directly with others.", axis: "E", direction: "positive" },
  { id: 8, statement: "I need alone time in my room to recharge my energy after a long day.", axis: "E", direction: "negative" },
  { id: 9, statement: "I like being the center of attention and speaking in front of many people.", axis: "E", direction: "positive" },
  { id: 10, statement: "I'm more comfortable working on tasks alone than in a large group.", axis: "E", direction: "negative" },
  { id: 11, statement: "I gain energy from social interaction and feel bored if I'm alone too long.", axis: "E", direction: "positive" },
  { id: 12, statement: "I prefer working in a quiet space without interruptions from others.", axis: "E", direction: "negative" },
  { id: 13, statement: "I enjoy organizing events and inviting many people to gather.", axis: "E", direction: "positive" },
  { id: 14, statement: "I often contemplate and analyze my own thoughts before expressing them.", axis: "E", direction: "negative" },
  { id: 15, statement: "I make friends easily and have a wide circle of acquaintances.", axis: "E", direction: "positive" },

  // S vs N (15 statements)
  { id: 16, statement: "I trust facts and real experiences that I can see and touch.", axis: "S", direction: "positive" },
  { id: 17, statement: "I often notice hidden patterns and future possibilities.", axis: "S", direction: "negative" },
  { id: 18, statement: "I focus on concrete details and practical information in the present.", axis: "S", direction: "positive" },
  { id: 19, statement: "I often rely on my intuition and gut feelings when making decisions.", axis: "S", direction: "negative" },
  { id: 20, statement: "I prefer following methods that have been proven to work rather than trying new ways.", axis: "S", direction: "positive" },
  { id: 21, statement: "I enjoy thinking about abstract concepts and complex theories.", axis: "S", direction: "negative" },
  { id: 22, statement: "I value tangible results like awards or measurable achievements.", axis: "S", direction: "positive" },
  { id: 23, statement: "I'm interested in symbolic meanings and hidden messages behind events.", axis: "S", direction: "negative" },
  { id: 24, statement: "I focus on problems right in front of me and solve them step by step.", axis: "S", direction: "positive" },
  { id: 25, statement: "I like imagining various possibilities and scenarios that might happen.", axis: "S", direction: "negative" },
  { id: 26, statement: "I learn from past experiences and apply them to current situations.", axis: "S", direction: "positive" },
  { id: 27, statement: "I enjoy exploring new ideas that have never been tried before.", axis: "S", direction: "negative" },
  { id: 28, statement: "I notice small changes around me like temperature or other people's moods.", axis: "S", direction: "positive" },
  { id: 29, statement: "I often think about the long-term implications of a decision.", axis: "S", direction: "negative" },
  { id: 30, statement: "I prefer clear and specific information rather than vague explanations.", axis: "S", direction: "positive" },

  // T vs F (15 statements)
  { id: 31, statement: "I make decisions based on logic and objective analysis, even if it might hurt feelings.", axis: "T", direction: "positive" },
  { id: 32, statement: "I consider the emotional impact of my decisions on others before acting.", axis: "T", direction: "negative" },
  { id: 33, statement: "Truth and justice are more important to me than harmonizing everyone's feelings.", axis: "T", direction: "positive" },
  { id: 34, statement: "I prefer finding solutions that make everyone feel comfortable and valued.", axis: "T", direction: "negative" },
  { id: 35, statement: "I evaluate situations based on facts and data, not momentary emotions.", axis: "T", direction: "positive" },
  { id: 36, statement: "I easily sense other people's emotions and adjust myself to help them.", axis: "T", direction: "negative" },
  { id: 37, statement: "I value competence and work results more than personal relationships.", axis: "T", direction: "positive" },
  { id: 38, statement: "I would do anything to help a friend in trouble, even if it inconveniences me.", axis: "T", direction: "negative" },
  { id: 39, statement: "I believe constructive criticism is important for improvement, even if sometimes harsh.", axis: "T", direction: "positive" },
  { id: 40, statement: "I avoid conflict and try to understand everyone's point of view.", axis: "T", direction: "negative" },
  { id: 41, statement: "I tend to criticize directly when I see mistakes, without beating around the bush.", axis: "T", direction: "positive" },
  { id: 42, statement: "I choose my words carefully so as not to hurt other people's feelings.", axis: "T", direction: "negative" },
  { id: 43, statement: "I prioritize efficiency and end results over an enjoyable process.", axis: "T", direction: "positive" },
  { id: 44, statement: "I value sincere and deep relationships with a few close friends.", axis: "T", direction: "negative" },
  { id: 45, statement: "I measure success based on achieving targets, not how happy my team is.", axis: "T", direction: "positive" },

  // J vs P (15 statements)
  { id: 46, statement: "I like to plan everything thoroughly and follow a strict schedule.", axis: "J", direction: "positive" },
  { id: 47, statement: "I prefer to be flexible and adjust plans according to the situation.", axis: "J", direction: "negative" },
  { id: 48, statement: "I feel uncomfortable if my tasks are not neatly organized.", axis: "J", direction: "positive" },
  { id: 49, statement: "I like to keep my options open and not rush to decide.", axis: "J", direction: "negative" },
  { id: 50, statement: "I always finish tasks on time and don't like procrastinating.", axis: "J", direction: "positive" },
  { id: 51, statement: "I enjoy surprises and spontaneous opportunities that come up suddenly.", axis: "J", direction: "negative" },
  { id: 52, statement: "I have consistent daily routines and find it hard to adapt to sudden changes.", axis: "J", direction: "positive" },
  { id: 53, statement: "I prefer to go with the flow and see where the day takes me.", axis: "J", direction: "negative" },
  { id: 54, statement: "I make decisions quickly and don't like spending too long considering choices.", axis: "J", direction: "positive" },
  { id: 55, statement: "I like to gather as much information as possible before making a final decision.", axis: "J", direction: "negative" },
  { id: 56, statement: "I make to-do lists and feel satisfied checking them off one by one.", axis: "J", direction: "positive" },
  { id: 57, statement: "I work better under pressure and urgent deadlines.", axis: "J", direction: "negative" },
  { id: 58, statement: "I feel guilty leaving a project before it's perfectly finished.", axis: "J", direction: "positive" },
  { id: 59, statement: "I often work on several projects at once and switch according to my interest.", axis: "J", direction: "negative" },
  { id: 60, statement: "I believe structure and rules are important to achieve goals effectively.", axis: "J", direction: "positive" }
];

// INDONESIAN STATEMENTS
const INDONESIAN_STATEMENTS: Statement[] = [
  // E vs I (15 statements)
  { id: 1, statement: "Aku merasa bersemangat saat berada di tengah keramaian dan mudah akrab dengan orang baru.", axis: "E", direction: "positive" },
  { id: 2, statement: "Aku lebih suka menghabiskan waktu sendiri untuk membaca atau berpikir daripada bersosialisasi.", axis: "E", direction: "negative" },
  { id: 3, statement: "Aku suka berbagi cerita dan pengalaman langsung dengan teman-teman setelah kegiatan selesai.", axis: "E", direction: "positive" },
  { id: 4, statement: "Aku mendapatkan ide-ide terbaik ketika aku sendirian dalam ketenangan, bukan saat diskusi kelompok.", axis: "E", direction: "negative" },
  { id: 5, statement: "Aku tidak ragu untuk memulai percakapan dengan orang yang belum kukenal.", axis: "E", direction: "positive" },
  { id: 6, statement: " Kegiatan sosial yang panjang membuatku lelah dan perlu waktu untuk memulihkan diri.", axis: "E", direction: "negative" },
  { id: 7, statement: "Aku lebih mudah memahami sesuatu ketika mendiskusikannya langsung dengan orang lain.", axis: "E", direction: "positive" },
  { id: 8, statement: "Aku membutuhkan waktu sendiri di kamar untuk mengisi ulang energi setelah hari yang panjang.", axis: "E", direction: "negative" },
  { id: 9, statement: "Aku suka menjadi pusat perhatian dan berbicara di depan banyak orang.", axis: "E", direction: "positive" },
  { id: 10, statement: "Aku lebih nyaman mengerjakan tugas sendirian daripada dalam kelompok besar.", axis: "E", direction: "negative" },
  { id: 11, statement: "Aku mendapatkan energi dari interaksi sosial dan merasa bosan jika terlalu lama sendirian.", axis: "E", direction: "positive" },
  { id: 12, statement: "Aku lebih suka bekerja di ruang yang tenang tanpa gangguan dari orang lain.", axis: "E", direction: "negative" },
  { id: 13, statement: "Aku suka mengorganisir acara dan mengajak banyak orang berkumpul.", axis: "E", direction: "positive" },
  { id: 14, statement: "Aku sering merenung dan menganalisis pikiranku sendiri sebelum mengungkapkannya.", axis: "E", direction: "negative" },
  { id: 15, statement: "Aku mudah bergaul dan memiliki lingkaran pertemanan yang luas.", axis: "E", direction: "positive" },

  // S vs N (15 statements)
  { id: 16, statement: "Aku lebih percaya pada fakta dan pengalaman nyata yang bisa kulihat dan sentuh.", axis: "S", direction: "positive" },
  { id: 17, statement: "Aku sering memperhatikan pola-pola tersembunyi dan kemungkinan-kemungkinan di masa depan.", axis: "S", direction: "negative" },
  { id: 18, statement: "Aku fokus pada detail konkret dan informasi yang praktis saat ini.", axis: "S", direction: "positive" },
  { id: 19, statement: "Aku sering mengandalkan intuisi dan firasatku dalam mengambil keputusan.", axis: "S", direction: "negative" },
  { id: 20, statement: "Aku lebih suka mengikuti metode yang sudah terbukti berhasil daripada mencoba cara baru.", axis: "S", direction: "positive" },
  { id: 21, statement: "Aku suka memikirkan konsep abstrak dan teori-teori yang kompleks.", axis: "S", direction: "negative" },
  { id: 22, statement: "Aku menghargai hasil nyata seperti penghargaan atau pencapaian yang terukur.", axis: "S", direction: "positive" },
  { id: 23, statement: "Aku tertarik pada makna simbolis dan pesan tersembunyi di balik suatu peristiwa.", axis: "S", direction: "negative" },
  { id: 24, statement: "Aku fokus pada masalah yang ada di depan mata dan menyelesaikannya langkah demi langkah.", axis: "S", direction: "positive" },
  { id: 25, statement: "Aku suka membayangkan berbagai kemungkinan dan skenario yang mungkin terjadi.", axis: "S", direction: "negative" },
  { id: 26, statement: "Aku belajar dari pengalaman masa lalu dan menerapkannya pada situasi saat ini.", axis: "S", direction: "positive" },
  { id: 27, statement: "Aku suka mengeksplorasi ide-ide baru yang belum pernah dicoba sebelumnya.", axis: "S", direction: "negative" },
  { id: 28, statement: "Aku memperhatikan perubahan kecil di sekitarku seperti suhu atau suasana hati orang lain.", axis: "S", direction: "positive" },
  { id: 29, statement: "Aku sering memikirkan implikasi jangka panjang dari sebuah keputusan.", axis: "S", direction: "negative" },
  { id: 30, statement: "Aku lebih suka informasi yang jelas dan spesifik daripada penjelasan yang samar-samar.", axis: "S", direction: "positive" },

  // T vs F (15 statements)
  { id: 31, statement: "Aku membuat keputusan berdasarkan logika dan analisis objektif, meskipun mungkin menyakiti perasaan.", axis: "T", direction: "positive" },
  { id: 32, statement: "Aku mempertimbangkan dampak emosional keputusanku pada orang lain sebelum bertindak.", axis: "T", direction: "negative" },
  { id: 33, statement: "Kebenaran dan keadilan lebih penting bagiku daripada mengharmoniskan perasaan semua orang.", axis: "T", direction: "positive" },
  { id: 34, statement: "Aku lebih suka mencari solusi yang membuat semua orang merasa nyaman dan dihargai.", axis: "T", direction: "negative" },
  { id: 35, statement: "Aku mengevaluasi situasi berdasarkan fakta dan data, bukan emosi sesaat.", axis: "T", direction: "positive" },
  { id: 36, statement: "Aku mudah merasakan emosi orang lain dan menyesuaikan diri untuk membantu mereka.", axis: "T", direction: "negative" },
  { id: 37, statement: "Aku lebih menghargai kompetensi dan hasil kerja daripada hubungan personal.", axis: "T", direction: "positive" },
  { id: 38, statement: "Aku akan melakukan apa pun untuk membantu teman dalam kesulitan, bahkan jika itu merepotkanku.", axis: "T", direction: "negative" },
  { id: 39, statement: "Aku percaya bahwa kritik yang membangun penting untuk perbaikan, meski terkadang keras.", axis: "T", direction: "positive" },
  { id: 40, statement: "Aku menghindari konflik dan mencoba memahami sudut pandang semua pihak.", axis: "T", direction: "negative" },
  { id: 41, statement: "Aku cenderung mengkritik secara langsung ketika melihat kesalahan, tanpa basa-basi.", axis: "T", direction: "positive" },
  { id: 42, statement: "Aku memilih kata-kata dengan hati-hati agar tidak melukai perasaan orang lain.", axis: "T", direction: "negative" },
  { id: 43, statement: "Aku lebih mementingkan efisiensi dan hasil akhir daripada proses yang menyenangkan.", axis: "T", direction: "positive" },
  { id: 44, statement: "Aku menghargai hubungan yang tulus dan mendalam dengan beberapa teman dekat.", axis: "T", direction: "negative" },
  { id: 45, statement: "Aku mengukur kesuksesan berdasarkan pencapaian target, bukan seberapa bahagia tim saya.", axis: "T", direction: "positive" },

  // J vs P (15 statements)
  { id: 46, statement: "Aku suka merencanakan segala sesuatu dengan matang dan mengikuti jadwal yang ketat.", axis: "J", direction: "positive" },
  { id: 47, statement: "Aku lebih suka bersikap fleksibel dan menyesuaikan rencana sesuai situasi.", axis: "J", direction: "negative" },
  { id: 48, statement: "Aku merasa tidak nyaman jika tugas-tugasku tidak tertata rapi dan terorganisir.", axis: "J", direction: "positive" },
  { id: 49, statement: "Aku suka menjaga pilihan tetap terbuka dan tidak terburu-buru memutuskan.", axis: "J", direction: "negative" },
  { id: 50, statement: "Aku selalu menyelesaikan tugas tepat waktu dan tidak suka menunda-nunda.", axis: "J", direction: "positive" },
  { id: 51, statement: "Aku menikmati kejutan dan kesempatan spontan yang muncul tiba-tiba.", axis: "J", direction: "negative" },
  { id: 52, statement: "Aku memiliki rutinitas harian yang konsisten dan sulit beradaptasi dengan perubahan mendadak.", axis: "J", direction: "positive" },
  { id: 53, statement: "Aku lebih suka mengikuti alur dan melihat kemana hari itu membawaku.", axis: "J", direction: "negative" },
  { id: 54, statement: "Aku cepat mengambil keputusan dan tidak suka berlama-lama mempertimbangkan pilihan.", axis: "J", direction: "positive" },
  { id: 55, statement: "Aku suka mengumpulkan informasi sebanyak mungkin sebelum membuat keputusan final.", axis: "J", direction: "negative" },
  { id: 56, statement: "Aku membuat daftar tugas dan merasa puas saat mencoretinya satu per satu.", axis: "J", direction: "positive" },
  { id: 57, statement: "Aku bekerja lebih baik di bawah tekanan dan tenggat waktu yang mendesak.", axis: "J", direction: "negative" },
  { id: 58, statement: "Aku merasa bersalah jika meninggalkan proyek sebelum selesai sempurna.", axis: "J", direction: "positive" },
  { id: 59, statement: "Aku sering mengerjakan beberapa proyek sekaligus dan beralih sesuai minatku.", axis: "J", direction: "negative" },
  { id: 60, statement: "Aku percaya bahwa struktur dan aturan penting untuk mencapai tujuan dengan efektif.", axis: "J", direction: "positive" }
];

export function MBTIOracleGame({ onComplete, onBack }: MBTIOracleGameProps) {
  const { addExp, isMaxLevel } = useGamification();
  const [gameState, setGameState] = useState<GameState>({
    screen: 'language',
    language: null,
    currentIndex: 0,
    axisScores: { E: 0, S: 0, T: 0, J: 0 },
    answers: [],
  });

  // Winner sound effect
  const { play: playWinner } = useAudio('/bg song/winner_sound.wav', { volume: 0.6 });

  const statements = gameState.language === 'id' ? INDONESIAN_STATEMENTS : ENGLISH_STATEMENTS;
  const currentStatement = statements[gameState.currentIndex];
  const totalQuestions = statements.length;

  // Map axis to primary axis (E, S, T, J) and determine if it should add or subtract
  const getAxisInfo = (axis: Statement['axis']): { primaryAxis: keyof GameState['axisScores']; isPrimary: boolean } => {
    switch (axis) {
      case 'E':
      case 'I':
        return { primaryAxis: 'E', isPrimary: axis === 'E' };
      case 'S':
      case 'N':
        return { primaryAxis: 'S', isPrimary: axis === 'S' };
      case 'T':
      case 'F':
        return { primaryAxis: 'T', isPrimary: axis === 'T' };
      case 'J':
      case 'P':
        return { primaryAxis: 'J', isPrimary: axis === 'J' };
      default:
        return { primaryAxis: 'E', isPrimary: true };
    }
  };

  /**
   * FIXED MBTI CALCULATION
   * Uses proper signed scoring with direction handling
   * Formula: Percentage = ((Score / 30) * 50) + 50
   * Score can be negative (opposite trait) or positive (primary trait)
   */
  const calculateResult = useCallback((axisScores: GameState['axisScores']): MBTIResultData => {
    // Determine type based on sign of each axis score
    const type = (
      (axisScores.E >= 0 ? 'E' : 'I') +
      (axisScores.S >= 0 ? 'S' : 'N') +
      (axisScores.T >= 0 ? 'T' : 'F') +
      (axisScores.J >= 0 ? 'J' : 'P')
    );

    // Calculate percentages using: ((Score / 30) * 50) + 50
    // Score range: -30 to +30
    // Result range: 0% to 100%
    const calculatePercentage = (score: number): number => {
      return ((score / 30) * 50) + 50;
    };

    return {
      type,
      percentages: {
        E: calculatePercentage(axisScores.E),
        I: calculatePercentage(-axisScores.E),
        S: calculatePercentage(axisScores.S),
        N: calculatePercentage(-axisScores.S),
        T: calculatePercentage(axisScores.T),
        F: calculatePercentage(-axisScores.T),
        J: calculatePercentage(axisScores.J),
        P: calculatePercentage(-axisScores.J),
      },
      preferenceClarity: {
        EI: Math.abs(axisScores.E),
        SN: Math.abs(axisScores.S),
        TF: Math.abs(axisScores.T),
        JP: Math.abs(axisScores.J),
      },
      data: MBTI_DATA[type] || MBTI_DATA['INTJ'],
    };
  }, []);

  const handleAnswer = (likertValue: number) => {
    if (!currentStatement) return;
    
    // Get base weight from Likert scale
    let weight = LIKERT_TO_WEIGHT[likertValue];
    
    // Reverse weight if direction is negative
    if (currentStatement.direction === 'negative') {
      weight = -weight;
    }
    
    // Get axis info to determine which primary axis to modify
    const { primaryAxis, isPrimary } = getAxisInfo(currentStatement.axis);
    
    // Apply weight to primary axis (add if primary, subtract if opposite)
    const signedWeight = isPrimary ? weight : -weight;
    
    const newAxisScores = {
      ...gameState.axisScores,
      [primaryAxis]: gameState.axisScores[primaryAxis] + signedWeight,
    };
    
    // Store answer details
    const newAnswers = [...gameState.answers, { 
      value: likertValue, 
      axis: currentStatement.axis, 
      direction: currentStatement.direction,
      weight: weight,
      signedWeight: signedWeight,
    }];
    
    const newIndex = gameState.currentIndex + 1;
    
    if (newIndex >= totalQuestions) {
      playWinner();
      addExp(50);
      const resultData = calculateResult(newAxisScores);
      if (onComplete) {
        onComplete(resultData);
      }
    } else {
      setGameState(prev => ({
        ...prev,
        axisScores: newAxisScores,
        answers: newAnswers,
        currentIndex: newIndex,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (gameState.currentIndex > 0) {
      const prevAnswer = gameState.answers[gameState.currentIndex - 1];
      if (!prevAnswer) return;
      
      const { primaryAxis } = getAxisInfo(prevAnswer.axis);
      
      const newAxisScores = {
        ...gameState.axisScores,
        [primaryAxis]: gameState.axisScores[primaryAxis] - prevAnswer.signedWeight,
      };
      
      const newAnswers = gameState.answers.slice(0, -1);
      
      setGameState(prev => ({
        ...prev,
        axisScores: newAxisScores,
        answers: newAnswers,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  };

  const handleRestart = () => {
    setGameState({
      screen: 'language',
      language: null,
      currentIndex: 0,
      axisScores: { E: 0, S: 0, T: 0, J: 0 },
      answers: [],
    });
  };

  const handleLanguageSelect = (lang: 'en' | 'id') => {
    setGameState(prev => ({ ...prev, screen: 'playing', language: lang }));
  };

  // Language Selection Screen with enhanced animations
  if (gameState.screen === 'language') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0806] flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-purple-900/10 to-amber-900/20" />
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -20,
                opacity: 0,
              }}
              animate={{ 
                y: window.innerHeight + 20,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ 
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
          {/* Torch light effects */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity },
              }} 
              className="inline-block mb-4"
            >
              <Sparkles className="w-16 h-16 text-amber-500" />
            </motion.div>
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-amber-500 mb-2 drop-shadow-lg" 
              style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '2px 2px 0px #000' }}
            >
              THE ORACLE'S TAVERN
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-amber-200/60 text-sm" 
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              MBTI Destiny Awaits
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1510] border-4 border-amber-600 p-6 relative shadow-2xl"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-amber-100/80 text-center mb-6 text-sm" 
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              "Welcome, traveler. The ancient spirits await your presence. Choose your tongue to begin the ritual..."
            </motion.p>
            
            <div className="flex flex-col gap-4">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleLanguageSelect('en')} 
                className="w-full py-4 bg-amber-700/30 border-2 border-amber-500 text-amber-400 font-bold hover:bg-amber-600/40 transition-all"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.7rem' }}
              >
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENGLISH
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleLanguageSelect('id')} 
                className="w-full py-4 bg-purple-700/30 border-2 border-purple-500 text-purple-400 font-bold hover:bg-purple-600/40 transition-all"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.7rem' }}
              >
                🇮🇩 BAHASA INDONESIA
              </motion.button>
            </div>
          </motion.div>
          
          {isMaxLevel && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-700 rounded-lg border border-amber-400/50">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="text-amber-100 font-bold text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>MAX LEVEL</span>
              </span>
            </motion.div>
          )}

          {/* Back Button */}
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="absolute top-4 left-4 z-50 p-3 bg-black/50 border-2 border-amber-500/50 hover:bg-amber-500/20 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  const progress = totalQuestions > 0 ? ((gameState.currentIndex + 1) / totalQuestions) * 100 : 0;
  
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0806] flex flex-col overflow-hidden"
         style={{ backgroundImage: 'radial-gradient(circle at center, #1a1510 0%, #0a0806 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -10,
              opacity: 0,
            }}
            animate={{ 
              y: window.innerHeight + 10,
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1a1510]/90 border-b-4 border-amber-700 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-amber-900/50 rounded border border-amber-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </button>
          )}
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span className="text-amber-500 font-bold text-sm md:text-base" 
                style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '1px 1px 0px #000' }}>
            ORACLE'S TAVERN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-200/60 text-xs md:text-sm" style={{ fontFamily: 'Courier New, monospace' }}>
            {gameState.currentIndex + 1} / {totalQuestions}
          </span>
          <button onClick={handleRestart} className="p-2 hover:bg-amber-900/50 rounded border border-amber-700/50 transition-colors">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-black/50 border-b-2 border-amber-900/50 relative z-10">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${progress}%` }} 
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStatement?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="max-w-3xl w-full"
          >
            {/* Question Card */}
            <div className="bg-[#1a1510] border-4 border-amber-700 p-6 md:p-10 relative mb-8 shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-500" />
              
              <div className="text-amber-500/70 text-xs mb-4 tracking-widest" 
                   style={{ fontFamily: '"Press Start 2P", cursive' }}>
                ⚔️ QUESTION {gameState.currentIndex + 1} OF {totalQuestions}
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="text-amber-100 text-lg md:text-2xl text-center leading-relaxed font-medium"
                style={{ fontFamily: 'Courier New, monospace', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                "{currentStatement?.statement}"
              </motion.p>
            </div>

            {/* Likert Scale */}
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {LIKERT_OPTIONS.map((option) => (
                <motion.button 
                  key={option.value}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)' }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => handleAnswer(option.value)} 
                  className="py-4 md:py-6 px-2 bg-[#0a0806] border-2 border-amber-700/50 text-amber-200 text-xs md:text-sm hover:bg-amber-900/40 hover:border-amber-500 transition-all flex flex-col items-center gap-2 group"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  <span className="block text-amber-500 text-lg md:text-xl font-bold group-hover:text-amber-400 transition-colors">
                    {option.value}
                  </span>
                  <span className="hidden md:block text-[0.6rem] leading-tight text-center text-amber-300/70 group-hover:text-amber-200">
                    {option.label[gameState.language!]}
                  </span>
                  <span className="md:hidden text-[0.5rem] text-amber-400/50">
                    {LIKERT_TO_WEIGHT[option.value] > 0 ? '+' : ''}{LIKERT_TO_WEIGHT[option.value]}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between mt-3 text-xs text-amber-400/50 px-2">
              <span style={{ fontFamily: 'Courier New, monospace' }}>
                {gameState.language === 'en' ? '← Strongly Disagree' : '← Sangat Tidak Setuju'}
              </span>
              <span style={{ fontFamily: 'Courier New, monospace' }}>
                {gameState.language === 'en' ? 'Strongly Agree →' : 'Sangat Setuju →'}
              </span>
            </div>

            {/* Back Button */}
            {gameState.currentIndex > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePreviousQuestion}
                className="w-full mt-6 py-3 bg-purple-900/30 border-2 border-purple-600/50 text-purple-400 text-xs flex items-center justify-center gap-2 hover:bg-purple-800/40 transition-all rounded"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                <ArrowLeft className="w-4 h-4" />
                REVERSE PREVIOUS MOVE
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
