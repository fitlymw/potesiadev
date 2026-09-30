/**
 * PersonaCore personality types (EN + ID), written in plain language.
 *
 * Originally generated from archetypes-master.txt; names and descriptions have
 * since been rewritten to read like a psychological test report rather than a
 * game, so this file is now the source of truth. The ARCH-xx codes and the
 * trait formulas (`targets`) are unchanged: 1 = High, -1 = Low, 0 = Moderate.
 * Traits not listed in a formula are ignored when matching.
 */
import type { Trait } from '@/lib/personality/bfi';

type Localized = { en: string; id: string };

export interface Archetype {
  id: string;
  targets: Partial<Record<Trait, -1 | 0 | 1>>;
  name: Localized;
  summary: Localized;
  social: Localized;
  workplace: Localized;
  driver: Localized;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'ARCH-01',
    targets: { E: 1, O: -1, N: 1 },
    name: { en: 'The Cautious Protector', id: 'Pelindung yang Waspada' },
    summary: {
      en: "You're active and enjoy being around people, but you feel safest with methods that have already proven to work. You're quick to notice when something is off, and under stress you become more watchful and look for reassurance from the people close to you.",
      id: 'Kamu aktif dan senang berada di antara orang lain, tapi lebih nyaman dengan cara-cara yang sudah terbukti. Kamu cepat sadar kalau ada yang tidak beres, dan saat tertekan kamu jadi lebih waspada dan mencari dukungan dari orang terdekat.',
    },
    social: {
      en: "You're loyal to a familiar circle of friends and like giving practical advice based on experience. Unfamiliar or unpredictable social situations can make you uneasy.",
      id: 'Kamu setia pada lingkaran pertemanan yang sudah lama kamu kenal dan suka memberi saran praktis berdasarkan pengalaman. Situasi sosial yang asing atau sulit ditebak bisa membuatmu gelisah.',
    },
    workplace: {
      en: "You're reliable when urgent problems come up that have clear procedures. Sudden, unexplained changes stress you out, so you do best where rules and roles are clear.",
      id: 'Kamu bisa diandalkan saat ada masalah mendesak yang prosedurnya jelas. Perubahan mendadak tanpa penjelasan membuatmu stres, jadi kamu paling nyaman di lingkungan dengan aturan dan peran yang jelas.',
    },
    driver: {
      en: 'Feeling safe. You want your surroundings to be stable and under control.',
      id: 'Rasa aman. Kamu ingin lingkungan di sekitarmu stabil dan terkendali.',
    },
  },
  {
    id: 'ARCH-02',
    targets: { E: -1, C: 1, A: 1 },
    name: { en: 'The Dependable Supporter', id: 'Pendukung yang Bisa Diandalkan' },
    summary: {
      en: "You're calm, thorough, and caring. You prefer helping behind the scenes rather than being in the spotlight, and people know they can count on you to get things done well.",
      id: 'Kamu tenang, teliti, dan peduli. Kamu lebih suka membantu di balik layar daripada tampil di depan, dan orang lain tahu mereka bisa mengandalkanmu untuk menyelesaikan sesuatu dengan baik.',
    },
    social: {
      en: 'You show you care through actions rather than words. You remember small details about people and often help before being asked.',
      id: 'Kamu menunjukkan kepedulian lewat tindakan, bukan lewat banyak bicara. Kamu ingat detail kecil tentang orang lain dan sering membantu sebelum diminta.',
    },
    workplace: {
      en: 'Your work is neat, consistent, and rarely has mistakes. You thrive in supportive teams, but your effort can go unnoticed because you rarely promote yourself.',
      id: 'Pekerjaanmu rapi, konsisten, dan jarang ada kesalahan. Kamu nyaman di tim yang saling mendukung, tapi kerja kerasmu kadang tidak terlihat karena kamu jarang menonjolkan diri.',
    },
    driver: {
      en: 'Being useful to others and keeping things running smoothly.',
      id: 'Menjadi berguna bagi orang lain dan menjaga semuanya berjalan lancar.',
    },
  },
  {
    id: 'ARCH-03',
    targets: { O: 1, N: 1, C: -1 },
    name: { en: 'The Emotional Creative', id: 'Kreatif yang Emosional' },
    summary: {
      en: "You have a strong imagination and deep feelings. Your ideas are often original, but your mood and focus can go up and down, so you work best when you're genuinely inspired.",
      id: 'Kamu punya imajinasi yang kuat dan perasaan yang dalam. Idemu sering unik, tapi suasana hati dan fokusmu bisa naik-turun, jadi kamu bekerja paling baik saat benar-benar sedang tertarik.',
    },
    social: {
      en: "You're expressive and honest about how you feel. You click with people who understand your emotional and creative side, but rigid environments can wear you down.",
      id: 'Kamu ekspresif dan jujur soal perasaanmu. Kamu cocok dengan orang yang memahami sisi emosional dan kreatifmu, tapi lingkungan yang kaku bisa membuatmu lelah.',
    },
    workplace: {
      en: 'You shine in creative work and solving problems in new ways. Tight deadlines and routine tasks can feel heavy, so flexible schedules and reminders help you.',
      id: 'Kamu unggul di pekerjaan kreatif dan dalam memecahkan masalah dengan cara baru. Tenggat yang ketat dan tugas rutin bisa terasa berat, jadi jadwal yang fleksibel dan pengingat sangat membantumu.',
    },
    driver: {
      en: 'Expressing yourself and creating something meaningful.',
      id: 'Mengekspresikan diri dan menciptakan sesuatu yang bermakna.',
    },
  },
  {
    id: 'ARCH-04',
    targets: { C: 1, O: 1, E: -1 },
    name: { en: 'The Strategic Planner', id: 'Perencana Strategis' },
    summary: {
      en: "You like thinking about the big picture and turning it into a clear plan. You're independent, focused, and prefer working quietly rather than in a crowd.",
      id: 'Kamu suka memikirkan gambaran besar lalu menyusunnya jadi rencana yang rapi. Kamu mandiri, fokus, dan lebih nyaman bekerja dengan tenang daripada di tengah keramaian.',
    },
    social: {
      en: 'You keep a small circle of close friends and enjoy deep conversations. You may seem quiet until the topic interests you.',
      id: 'Kamu punya sedikit teman tapi dekat, dan menikmati obrolan yang mendalam. Kamu mungkin terlihat pendiam sampai topiknya menarik bagimu.',
    },
    workplace: {
      en: "You're suited to roles that involve planning, analysis, or designing systems. You dislike long meetings and interruptions that break your focus.",
      id: 'Kamu cocok untuk peran yang butuh perencanaan, analisis, atau merancang sistem. Kamu kurang suka rapat panjang dan gangguan yang memecah fokus.',
    },
    driver: {
      en: 'Building things that are well designed and work effectively.',
      id: 'Membuat sesuatu yang dirancang dengan baik dan berjalan efektif.',
    },
  },
  {
    id: 'ARCH-05',
    targets: { O: 1, A: 1, E: 1 },
    name: { en: 'The Caring Motivator', id: 'Penggerak yang Peduli' },
    summary: {
      en: "You're warm, open-minded, and energetic. You enjoy helping others grow and are often the one who lifts up your group.",
      id: 'Kamu hangat, terbuka, dan bersemangat. Kamu senang membantu orang lain berkembang dan sering menjadi penyemangat di kelompokmu.',
    },
    social: {
      en: 'You connect easily with anyone and are genuinely curious about people. Because you want everyone to be happy, you sometimes forget your own needs.',
      id: 'Kamu mudah akrab dengan siapa saja dan tulus ingin mengenal orang lain. Karena ingin semua orang senang, kamu kadang lupa memperhatikan kebutuhanmu sendiri.',
    },
    workplace: {
      en: 'You fit roles that involve people, such as teaching, mentoring, or leading a team. You can get overwhelmed if you say yes to too many requests.',
      id: 'Kamu cocok di peran yang melibatkan banyak orang, seperti mengajar, membimbing, atau memimpin tim. Kamu bisa kewalahan kalau terlalu sering mengiyakan permintaan.',
    },
    driver: {
      en: 'Making a positive difference for the people around you.',
      id: 'Membawa perubahan positif bagi orang-orang di sekitarmu.',
    },
  },
  {
    id: 'ARCH-06',
    targets: { N: -1, C: 1, E: -1 },
    name: { en: 'The Steady Worker', id: 'Pekerja yang Tenang' },
    summary: {
      en: "You're calm, disciplined, and hard to rattle. You'd rather get work done than talk about it, and you stay clear-headed when others start to stress.",
      id: 'Kamu tenang, disiplin, dan tidak mudah panik. Kamu lebih suka langsung bekerja daripada banyak bicara, dan tetap bisa berpikir jernih saat orang lain mulai stres.',
    },
    social: {
      en: "You're low-key and dislike drama. People feel safe around you, although you can come across as not very expressive.",
      id: 'Kamu kalem dan tidak suka drama. Orang merasa aman di dekatmu, meski kamu kadang terlihat kurang ekspresif.',
    },
    workplace: {
      en: "You're dependable for tasks that need precision and consistency, including in emergencies. You prefer clear instructions over small talk.",
      id: 'Kamu bisa diandalkan untuk tugas yang butuh ketelitian dan konsistensi, termasuk saat keadaan darurat. Kamu lebih suka instruksi yang jelas daripada basa-basi.',
    },
    driver: {
      en: 'Doing the job well and keeping things under control.',
      id: 'Menyelesaikan pekerjaan dengan baik dan menjaga semuanya tetap terkendali.',
    },
  },
  {
    id: 'ARCH-07',
    targets: { E: 1, N: 1, A: -1 },
    name: { en: 'The Competitive Communicator', id: 'Komunikator yang Kompetitif' },
    summary: {
      en: "You're energetic, persuasive, and like to win. You react quickly and speak your mind, but your emotions can run high when you feel pressured or challenged.",
      id: 'Kamu energik, pandai meyakinkan orang, dan suka menang. Kamu cepat bereaksi dan berani menyampaikan pendapat, tapi emosimu bisa ikut naik saat merasa tertekan atau ditantang.',
    },
    social: {
      en: 'You easily draw attention and convince people. In arguments, you can sound too harsh or defensive without meaning to.',
      id: 'Kamu mudah menarik perhatian dan meyakinkan orang lain. Saat berdebat, kamu bisa terdengar terlalu keras atau defensif tanpa bermaksud begitu.',
    },
    workplace: {
      en: 'You fit roles that involve negotiating, selling, or presenting. Targets and competition motivate you, but you need to learn to handle stress and criticism.',
      id: 'Kamu cocok di peran yang butuh negosiasi, penjualan, atau presentasi. Target dan persaingan membuatmu termotivasi, tapi kamu perlu belajar mengelola stres dan kritik.',
    },
    driver: {
      en: 'Being recognized, having influence, and winning.',
      id: 'Diakui, punya pengaruh, dan meraih kemenangan.',
    },
  },
  {
    id: 'ARCH-08',
    targets: { O: 1, E: -1, N: -1 },
    name: { en: 'The Calm Thinker', id: 'Pemikir yang Tenang' },
    summary: {
      en: "You're reflective, curious about many things, and stay calm in most situations. You enjoy time alone to think and learn.",
      id: 'Kamu suka merenung, penasaran pada banyak hal, dan tetap tenang dalam berbagai situasi. Kamu menikmati waktu sendiri untuk berpikir dan belajar.',
    },
    social: {
      en: "You're a good listener and often offer perspectives others hadn't considered. You need personal space and don't enjoy big, noisy crowds.",
      id: 'Kamu pendengar yang baik dan sering memberi sudut pandang yang tidak terpikirkan orang lain. Kamu butuh ruang pribadi dan kurang suka keramaian yang berlebihan.',
    },
    workplace: {
      en: "You're suited to research, writing, design, or work that needs deep thinking. You're most productive when given freedom in how you work.",
      id: 'Kamu cocok untuk riset, menulis, desain, atau pekerjaan yang butuh pemikiran mendalam. Kamu paling produktif saat diberi kebebasan mengatur cara kerjamu.',
    },
    driver: {
      en: 'Understanding things deeply.',
      id: 'Memahami sesuatu secara mendalam.',
    },
  },
  {
    id: 'ARCH-09',
    targets: { A: 1, N: -1, E: 0 },
    name: { en: 'The Peacemaker', id: 'Pembawa Damai' },
    summary: {
      en: "You're friendly, patient, and calm. You get along with many kinds of people and are often the one who mediates when conflicts come up.",
      id: 'Kamu ramah, sabar, dan tenang. Kamu bisa bergaul dengan banyak tipe orang dan sering menjadi penengah saat ada konflik.',
    },
    social: {
      en: 'People feel comfortable opening up to you. You keep the peace, but sometimes hold back your own opinions to avoid disagreements.',
      id: 'Orang merasa nyaman bercerita kepadamu. Kamu menjaga suasana tetap damai, tapi kadang menahan pendapatmu sendiri supaya tidak terjadi perselisihan.',
    },
    workplace: {
      en: 'You fit roles that involve teamwork, service, or bridging different groups. You make a team feel united and supportive.',
      id: 'Kamu cocok di peran yang butuh kerja sama, pelayanan, atau menjembatani banyak pihak. Kamu membuat tim terasa solid dan saling mendukung.',
    },
    driver: {
      en: 'Harmonious relationships and an environment where everyone feels comfortable.',
      id: 'Hubungan yang harmonis dan lingkungan yang nyaman untuk semua orang.',
    },
  },
  {
    id: 'ARCH-10',
    targets: { O: -1, C: 1, N: 1 },
    name: { en: 'The Careful Realist', id: 'Realis yang Berhati-hati' },
    summary: {
      en: "You're practical, thorough, and like to prepare for the worst. You handle worry by making clear plans and rules.",
      id: 'Kamu praktis, teliti, dan suka bersiap untuk kemungkinan terburuk. Kamu mengatasi rasa khawatir dengan membuat rencana dan aturan yang jelas.',
    },
    social: {
      en: 'You prefer concrete, to-the-point conversations. Your advice is realistic, even if it sometimes sounds pessimistic.',
      id: 'Kamu lebih suka obrolan yang konkret dan langsung ke intinya. Saranmu realistis, walau kadang terdengar pesimis.',
    },
    workplace: {
      en: 'You fit fields that need accuracy and risk control, such as administration, finance, or quality control. Sudden changes can make you anxious.',
      id: 'Kamu cocok di bidang yang butuh ketelitian dan pengendalian risiko, seperti administrasi, keuangan, atau quality control. Perubahan mendadak bisa membuatmu cemas.',
    },
    driver: {
      en: 'Preventing mistakes and feeling prepared for anything.',
      id: 'Mencegah kesalahan dan merasa siap menghadapi apa pun.',
    },
  },
  {
    id: 'ARCH-11',
    targets: { E: 1, O: 1, C: -1 },
    name: { en: 'The Spontaneous Adventurer', id: 'Petualang yang Spontan' },
    summary: {
      en: "You're enthusiastic, love new things, and aren't afraid to try. You'd rather jump in than spend a long time planning.",
      id: 'Kamu bersemangat, suka hal baru, dan berani mencoba. Kamu lebih senang langsung bertindak daripada merencanakan terlalu lama.',
    },
    social: {
      en: "You're a fun friend who often gets people to do spontaneous things. You get bored quickly with dull routines.",
      id: 'Kamu teman yang seru dan sering mengajak orang melakukan hal-hal spontan. Kamu cepat bosan dengan rutinitas yang monoton.',
    },
    workplace: {
      en: 'You shine in fast-changing, dynamic environments. A system or an organized partner helps you actually finish your ideas.',
      id: 'Kamu unggul di lingkungan yang dinamis dan cepat berubah. Sistem atau partner yang teratur membantumu benar-benar menyelesaikan ide-idemu.',
    },
    driver: {
      en: 'New experiences and the freedom to explore.',
      id: 'Pengalaman baru dan kebebasan untuk bereksplorasi.',
    },
  },
  {
    id: 'ARCH-12',
    targets: { A: 1, C: 1, O: -1 },
    name: { en: 'The Consistent Helper', id: 'Penolong yang Konsisten' },
    summary: {
      en: "You're kind, responsible, and consistent. You prefer proven ways of doing things and like making sure the people around you are taken care of.",
      id: 'Kamu baik hati, bertanggung jawab, dan konsisten. Kamu lebih suka cara yang sudah terbukti dan senang memastikan orang-orang di sekitarmu terurus.',
    },
    social: {
      en: "You're loyal and dependable for family and friends. You show love through practical, everyday help.",
      id: 'Kamu setia dan bisa diandalkan oleh keluarga maupun teman. Kamu menunjukkan kasih sayang lewat bantuan nyata sehari-hari.',
    },
    workplace: {
      en: 'You fit service, administration, healthcare, or education roles. You work neatly but feel uncomfortable when processes keep changing.',
      id: 'Kamu cocok di bidang pelayanan, administrasi, kesehatan, atau pendidikan. Kamu bekerja rapi, tapi kurang nyaman kalau cara kerja terus berubah.',
    },
    driver: {
      en: 'Being a steady source of support for others.',
      id: 'Menjadi tempat bergantung yang stabil bagi orang lain.',
    },
  },
  {
    id: 'ARCH-13',
    targets: { O: 1, A: -1, C: 1 },
    name: { en: 'The Critical Analyst', id: 'Analis yang Kritis' },
    summary: {
      en: "You're sharp, thorough, and critical. You like analyzing things in detail and don't accept claims without evidence.",
      id: 'Kamu cerdas, teliti, dan kritis. Kamu suka menganalisis sesuatu sampai detail dan tidak mudah percaya tanpa bukti.',
    },
    social: {
      en: "You're honest and get straight to the point. People value your input, but your delivery can feel too sharp.",
      id: 'Kamu jujur dan langsung ke inti masalah. Orang menghargai pendapatmu, tapi cara penyampaianmu kadang terasa terlalu tajam.',
    },
    workplace: {
      en: 'You fit analysis, research, engineering, or evaluation roles. You hold high standards and quickly spot weaknesses in a plan.',
      id: 'Kamu cocok di bidang analisis, riset, teknik, atau evaluasi. Kamu memegang standar tinggi dan cepat melihat kelemahan dalam sebuah rencana.',
    },
    driver: {
      en: 'Finding the best and most accurate way to do things.',
      id: 'Menemukan cara terbaik dan paling tepat untuk melakukan sesuatu.',
    },
  },
  {
    id: 'ARCH-14',
    targets: { E: -1, N: -1, O: 0 },
    name: { en: 'The Calm Independent', id: 'Mandiri yang Tenang' },
    summary: {
      en: "You're calm, independent, and comfortable in your own company. You don't need a crowd to feel happy and rarely get carried away by emotions.",
      id: 'Kamu tenang, mandiri, dan nyaman dengan dirimu sendiri. Kamu tidak butuh keramaian untuk merasa bahagia dan jarang terbawa emosi.',
    },
    social: {
      en: "You have a few close friends and value personal space. You're easygoing and not easily pulled into drama.",
      id: 'Kamu punya sedikit teman dekat dan menghargai ruang pribadi. Kamu santai dan tidak mudah terseret drama di sekitarmu.',
    },
    workplace: {
      en: "You work well independently and don't panic under pressure. You prefer being trusted over being closely supervised.",
      id: 'Kamu bekerja baik secara mandiri dan tidak mudah panik saat ada tekanan. Kamu lebih suka diberi kepercayaan daripada terus diawasi.',
    },
    driver: {
      en: 'Peace of mind and the freedom to live your own way.',
      id: 'Ketenangan dan kebebasan menjalani hidup dengan caramu sendiri.',
    },
  },
  {
    id: 'ARCH-15',
    targets: { O: 1, E: 1, N: 1, A: 1 },
    name: { en: 'The Passionate Changemaker', id: 'Pejuang Perubahan' },
    summary: {
      en: "You're passionate, caring, and idealistic. You feel things strongly and want to stand up for what you believe is right.",
      id: 'Kamu penuh semangat, peduli, dan punya idealisme tinggi. Kamu merasakan banyak hal dengan kuat dan ingin memperjuangkan apa yang menurutmu benar.',
    },
    social: {
      en: "You inspire people and get them involved easily. Because you care so much, you can get disappointed or emotionally drained when things don't go as hoped.",
      id: 'Kamu mudah menginspirasi dan mengajak orang lain ikut bergerak. Karena sangat peduli, kamu mudah kecewa atau lelah secara emosi saat sesuatu tidak berjalan sesuai harapan.',
    },
    workplace: {
      en: 'You fit social organizations, advocacy, community work, or creative fields with a mission. You need to set boundaries to avoid burnout.',
      id: 'Kamu cocok di organisasi sosial, advokasi, komunitas, atau bidang kreatif yang punya misi. Kamu perlu menjaga batas supaya tidak burnout.',
    },
    driver: {
      en: 'Making the world around you fairer and better.',
      id: 'Membuat dunia di sekitarmu menjadi lebih adil dan lebih baik.',
    },
  },
];
