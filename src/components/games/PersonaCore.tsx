import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/hooks/useAudio';
import { useGamification } from '@/context/GamificationContext';
import { ArrowLeft, Download, Activity, Target, Users, Briefcase, Heart, Cpu, Zap, Shield, Eye, Brain, Hexagon, Terminal, Loader2 } from 'lucide-react';

// ==================== CONFIGURATION ====================
// TODO: Ganti URL ini dengan Production Webhook URL dari n8n kamu nanti
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/career-assessment";

// ==================== TYPES ====================
interface Statement {
  id: number;
  statement: string;
  axis: 'E' | 'A' | 'C' | 'N' | 'O';
  direction: 'positive' | 'negative';
}

interface AcademicRecord {
  subject: string;
  score: string; // Menggunakan string untuk input form, di-parse ke number saat dikirim
}

interface GameState {
  screen: 'intro' | 'academic' | 'assessment' | 'analyzing' | 'result';
  language: 'en' | 'id';
  currentIndex: number;
  answers: { value: number; axis: string; signedWeight: number }[];
  scores: { E: number; A: number; C: number; N: number; O: number };
}

// Tipe respons yang diharapkan dari n8n
interface JobRecommendation {
  title: string;
  probability: number;
  explanation: string;
}

interface AIResult {
  top_jobs: JobRecommendation[];
  percentages: { E: number; A: number; C: number; N: number; O: number };
  emotionalStability: number;
}

// ==================== BFI-44 DATA (DIPERPENDEK UNTUK CONTOH) ====================
// MASUKKAN KEMBALI CONST ENGLISH_STATEMENTS & INDONESIAN_STATEMENTS MILIKMU DI SINI
// (Saya persingkat agar muat, tolong copy-paste array 44 pertanyaan aslimu ke sini)
const ENGLISH_STATEMENTS: Statement[] = [ { id: 1, statement: "I am someone who is talkative", axis: "E", direction: "positive" } /* ... masukkan sisanya ... */ ];
const INDONESIAN_STATEMENTS: Statement[] = [ { id: 1, statement: "Saya adalah orang yang banyak bicara", axis: "E", direction: "positive" } /* ... masukkan sisanya ... */ ];

// ==================== LIKERT SCALE ====================
const LIKERT_TO_WEIGHT: Record<number, number> = { 1: -2, 2: -1, 3: 0, 4: 1, 5: 2 };
const MAX_SCORES = { E: 16, A: 18, C: 18, N: 16, O: 20 };

// ==================== HELPER FUNCTIONS ====================
function calculatePercentage(rawScore: number, maxScore: number): number {
  const percentage = ((rawScore / maxScore) * 50) + 50;
  return Math.min(100, Math.max(0, percentage));
}

// (Fungsi GlitchText, Typewriter, GradientBar, RadarChart TETAP SAMA SEPERTI ASLIMU)
// PASTIKAN KAMU MENYALIN FUNGSI UI TERSEBUT DARI KODE LAMAMU KE SINI

// ==================== MAIN COMPONENT ====================
export function PersonaCore() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const { play: playWinner } = useAudio('/bg song/winner_sound.wav', { volume: 0.6 });
  
  const [gameState, setGameState] = useState<GameState>({
    screen: 'intro', language: 'en', currentIndex: 0, answers: [], scores: { E: 0, A: 0, C: 0, N: 0, O: 0 }
  });
  
  // State baru untuk input Akademik
  const [degree, setDegree] = useState('');
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([
    { subject: '', score: '' },
    { subject: '', score: '' },
    { subject: '', score: '' }
  ]);

  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [showExport, setShowExport] = useState(false);

  const statements = gameState.language === 'id' ? INDONESIAN_STATEMENTS : ENGLISH_STATEMENTS;
  const currentStatement = statements[gameState.currentIndex];
  const totalQuestions = statements.length;
  const progress = totalQuestions > 0 ? ((gameState.currentIndex + 1) / totalQuestions) * 100 : 0;

  // FUNGSI BARU: Mengirim data ke n8n
  const submitToAI = async (finalScores: { E: number; A: number; C: number; N: number; O: number }) => {
    setGameState(prev => ({ ...prev, screen: 'analyzing' }));
    
    const percentages = {
      E: calculatePercentage(finalScores.E, MAX_SCORES.E),
      A: calculatePercentage(finalScores.A, MAX_SCORES.A),
      C: calculatePercentage(finalScores.C, MAX_SCORES.C),
      N: calculatePercentage(finalScores.N, MAX_SCORES.N),
      O: calculatePercentage(finalScores.O, MAX_SCORES.O)
    };
    const emotionalStability = 100 - percentages.N;

    // Format JSON yang sesuai dengan draf Bab 3 kita
    const payload = {
      user_profile: {
        degree: degree,
        academic_records: academicRecords.map(r => ({ subject: r.subject, score: Number(r.score) })),
        bfi_scores: percentages
      }
    };

    try {
      // Simulasi API Call (Ganti dengan fetch sungguhan nanti)
      /*
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      */

      // DUMMY RESPONSE UNTUK TESTING UI SEBELUM N8N JALAN
      await new Promise(resolve => setTimeout(resolve, 4000)); // Simulasi loading 4 detik
      const dummyData: AIResult = {
        percentages,
        emotionalStability,
        top_jobs: [
          { title: "AI Prompt Engineer", probability: 92, explanation: "Nilai Algoritma (90) Anda menunjukkan logika yang kuat. Dipadukan dengan Openness (85%) yang tinggi, Anda sangat adaptif dalam bereksperimen dengan model bahasa baru." },
          { title: "Data Scientist", probability: 85, explanation: "Skor Conscientiousness Anda yang solid cocok untuk pembersihan data yang teliti, dan latar belakang Teknik Informatika memberikan dasar statistik yang dibutuhkan." },
          { title: "Product Manager", probability: 78, explanation: "Keseimbangan antara Extraversion dan fondasi teknis Anda membuat Anda mampu menjembatani tim developer dan stakeholder bisnis secara efektif." }
        ]
      };

      setAiResult(dummyData);
      playWinner(); 
      addExp(100);
      setGameState(prev => ({ ...prev, screen: 'result' }));

    } catch (error) {
      console.error("AI Analysis Failed:", error);
      // Handle error UI di sini
    }
  };

  const handleAnswer = useCallback((value: number) => {
    if (!currentStatement) return;
    let weight = LIKERT_TO_WEIGHT[value];
    if (currentStatement.direction === 'negative') weight = -weight;
    const axis = currentStatement.axis as keyof typeof gameState.scores;
    const newScores = { ...gameState.scores, [axis]: gameState.scores[axis] + weight };
    const newAnswers = [...gameState.answers, { value, axis, signedWeight: weight }];
    const newIndex = gameState.currentIndex + 1;

    if (newIndex >= totalQuestions) {
      // BUKAN SET RESULT LAGI, TAPI KIRIM KE AI
      submitToAI(newScores);
    } else {
      setGameState(prev => ({ ...prev, scores: newScores, answers: newAnswers, currentIndex: newIndex }));
    }
  }, [currentStatement, gameState, totalQuestions, degree, academicRecords]);

  // Handle pindah layar
  const handleLanguageSelect = (lang: 'en' | 'id') => setGameState(prev => ({ ...prev, language: lang, screen: 'academic' }));
  const handleRestart = () => { setGameState({ screen: 'intro', language: gameState.language, currentIndex: 0, answers: [], scores: { E: 0, A: 0, C: 0, N: 0, O: 0 } }); setAiResult(null); };

  // UI RENDERERS
  // (Pastikan tag <GlitchText> dan <Typewriter> kamu copy dari kode lama)

  if (gameState.screen === 'intro') {
     // ... (KODE INTRO SAMA SEPERTI MILIKMU, tapi button menunjuk ke handleLanguageSelect)
  }

  // LAYAR BARU: INPUT AKADEMIK
  if (gameState.screen === 'academic') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
         <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full p-8 border border-cyan-500/50 bg-cyan-950/20 relative z-10">
            <h2 className="text-2xl text-cyan-400 font-mono mb-6 uppercase flex items-center gap-2"><Terminal className="w-6 h-6"/> Academic Profiling</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-cyan-500/70 text-xs mb-2 font-mono">DEGREE / MAJOR</label>
                <input 
                  type="text" 
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Information Systems" 
                  className="w-full bg-black/50 border border-cyan-500/30 p-3 text-cyan-400 font-mono outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-500/70 text-xs mb-2 font-mono">TOP 3 CORE SUBJECTS (GPA / GRADE)</label>
                {academicRecords.map((record, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Subject Name" 
                      value={record.subject}
                      onChange={(e) => {
                        const newRecs = [...academicRecords];
                        newRecs[idx].subject = e.target.value;
                        setAcademicRecords(newRecs);
                      }}
                      className="flex-1 bg-black/50 border border-cyan-500/30 p-2 text-cyan-400 font-mono text-sm outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="Score (0-100)" 
                      value={record.score}
                      onChange={(e) => {
                        const newRecs = [...academicRecords];
                        newRecs[idx].score = e.target.value;
                        setAcademicRecords(newRecs);
                      }}
                      className="w-32 bg-black/50 border border-cyan-500/30 p-2 text-cyan-400 font-mono text-sm outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              disabled={!degree}
              onClick={() => setGameState(prev => ({ ...prev, screen: 'assessment' }))} 
              className="w-full py-3 bg-cyan-950 border border-cyan-500 text-cyan-400 font-mono hover:bg-cyan-900 transition-colors disabled:opacity-50"
            >
              INITIALIZE PSYCHOMETRIC TEST {'>>'}
            </button>
         </motion.div>
      </div>
    );
  }

  if (gameState.screen === 'assessment') {
     // ... (KODE ASSESSMENT BFI-44 SAMA SEPERTI MILIKMU)
  }

  // LAYAR BARU: ANALYZING (LOADING)
  if (gameState.screen === 'analyzing') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
         <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
         <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
         <h2 className="text-2xl text-cyan-400 font-mono animate-pulse uppercase">KNN Engine Processing...</h2>
         <p className="text-cyan-500/60 font-mono mt-2 text-sm text-center max-w-md">
           Synthesizing Academic Vector & BFI-44 Metrics against real-time Industry Datasets.
         </p>
      </div>
    )
  }

  // LAYAR HASIL (YANG DI-RENDER DARI N8N)
  if (gameState.screen === 'result' && aiResult) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-auto p-4 md:p-8">
         <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full fixed" /></div>
         
         <div className="max-w-5xl mx-auto w-full relative z-10 space-y-8">
            <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4">
              <h1 className="text-3xl text-cyan-400 font-mono uppercase tracking-widest">AI Career Assessment Result</h1>
              <button onClick={handleRestart} className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-mono hover:bg-cyan-900">REBOOT</button>
            </div>

            {/* SEKSI 1: TOP 3 JOBS DARI LLM */}
            <div className="space-y-4">
              <h2 className="text-xl text-cyan-500 font-mono flex items-center gap-2"><Briefcase className="w-5 h-5"/> TOP 3 RECOMMENDED ROLES</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiResult.top_jobs.map((job, idx) => (
                  <div key={idx} className="p-6 border border-cyan-500/30 bg-cyan-950/20 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                    <div className="absolute top-0 right-0 p-2 bg-cyan-900/50 text-cyan-200 font-mono text-sm border-l border-b border-cyan-500/30">
                      {job.probability}% MATCH
                    </div>
                    <h3 className="text-xl text-cyan-100 font-bold mb-4 pr-12">{job.title}</h3>
                    <p className="text-cyan-400/80 text-sm font-mono leading-relaxed">
                      {job.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEKSI 2: TRAIT DISTRIBUTION (Diambil dari kode lamamu) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
               <div className="space-y-4 border border-cyan-500/30 p-6">
                 <h2 className="text-cyan-500 font-mono uppercase text-sm mb-4">Psychometric Breakdown</h2>
                 {/* Masukkan komponen <GradientBar> kamu di sini menggunakan aiResult.percentages */}
               </div>
               <div className="border border-cyan-500/30 p-6 flex justify-center items-center h-64">
                 {/* Masukkan komponen <RadarChart> kamu di sini menggunakan aiResult.percentages */}
                 <span className="text-cyan-500 font-mono text-sm">[Radar Chart Component Here]</span>
               </div>
            </div>
         </div>
      </div>
    )
  }

  return null;
}