/**
 * PersonaCore archetype catalog.
 * Generated from archetypes-master.txt (EN + ID). `targets` encode each
 * "Primary Formula": 1 = High, -1 = Low, 0 = Moderate. Traits not listed in a
 * formula are ignored when matching.
 */
import type { Trait } from '@/lib/personality/bfi';

type Localized = { en: string; id: string };

export interface Archetype {
  id: string;
  targets: Partial<Record<Trait, -1 | 0 | 1>>;
  name: Localized;
  formula: Localized;
  summary: Localized;
  social: Localized;
  workplace: Localized;
  driver: Localized;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "ARCH-01",
    targets: {
      E: 1,
      O: -1,
      N: 1
    },
    name: {
      en: "The Vigilant Guardian",
      id: "Sang Penjaga Waspada"
    },
    formula: {
      en: "High E + Low O + High N (Low Stability)",
      id: "E Tinggi + O Rendah + N Tinggi (Stabilitas Rendah)"
    },
    summary: {
      en: "The Vigilant Guardian is a paradox of outward energy and internal caution. Their high extraversion drives them to engage actively with their environment, yet their low openness keeps them anchored to proven methods and familiar territories. This creates a person who is socially present but cognitively conservative—quick to react to threats due to their neurotic sensitivity, but resistant to novel solutions. Under stress, they become hypervigilant, scanning for dangers while seeking social reassurance. Their mind operates as a protective radar system, constantly comparing present stimuli against a narrow database of past experiences to detect anomalies.",
      id: "Sang Penjaga Waspada adalah paradoks dari energi eksternal dan kehati-hatian internal. Extraversion tinggi mendorong mereka untuk aktif berinteraksi dengan lingkungan, namun keterbukaan rendah membuat mereka tertancap pada metode teruji dan teritori familiar. Ini menciptakan pribadi yang hadir secara sosial namun konservatif secara kognitif—cepat bereaksi terhadap ancaman karena sensitivitas neurotik mereka, namun resisten terhadap solusi baru. Dalam stres, mereka menjadi hipervigilan, memindai bahaya sambil mencari jaminan sosial. Pikiran mereka beroperasi seperti radar protektif, terus-menerus membandingkan stimuli saat ini dengan database pengalaman masa lalu yang sempit untuk mendeteksi anomali."
    },
    social: {
      en: "They dominate conversations with practical concerns and past anecdotes, often redirecting abstract discussions to concrete, immediate issues. They form tight-knit circles based on loyalty and shared history, becoming anxious in diverse or unpredictable social settings. Their communication is directive and protective—they advise others based on \"what has always worked\" and may become agitated when suggestions challenge traditional frameworks.",
      id: "Mereka mendominasi percakapan dengan kekhawatiran praktis dan anekdot masa lalu, sering mengalihkan diskusi abstrak ke isu konkret dan segera. Mereka membentuk lingkaran erat berdasarkan loyalitas dan sejarah bersama, menjadi cemas dalam pengaturan sosial yang beragam atau tak terduga. Komunikasi mereka bersifat direktif dan protektif—memberi nasihat berdasarkan \"apa yang selalu berhasil\" dan mungkin menjadi gelisah ketika saran menantang kerangka tradisional."
    },
    workplace: {
      en: "Excels in crisis management roles requiring rapid response within established protocols. They meet deadlines through sheer nervous energy and social accountability, often checking in frequently with colleagues. However, they struggle with innovation projects, experiencing genuine distress when workflows change without warning. They prefer structured hierarchies where roles are clearly defined and authority is respected.",
      id: "Unggul dalam peran manajemen krisis yang memerlukan respons cepat dalam protokol yang mapan. Mereka memenuhi tenggat waktu melalui energi gugup dan akuntabilitas sosial, sering memeriksa rekan kerja secara berkala. Namun, mereka kesulitan dengan proyek inovasi, mengalami stres nyata ketika alur kerja berubah tanpa peringatan. Mereka lebih suka hierarki terstruktur di mana peran jelas didefinisikan dan otoritas dihormati."
    },
    driver: {
      en: "Security through control. They are motivated by the need to maintain stability in their social and physical environment, driven by an underlying fear of chaos and the unknown.",
      id: "Keamanan melalui kontrol. Mereka termotivasi oleh kebutuhan untuk mempertahankan stabilitas dalam lingkungan sosial dan fisik mereka, didorong oleh ketakutan mendasar terhadap kekacauan dan yang tidak diketahui."
    }
  },
  {
    id: "ARCH-02",
    targets: {
      E: -1,
      C: 1,
      A: 1
    },
    name: {
      en: "The Reliable Supporter",
      id: "Sang Pendukung Handal"
    },
    formula: {
      en: "Low E + High C + High A",
      id: "E Rendah + C Tinggi + A Tinggi"
    },
    summary: {
      en: "The Reliable Supporter represents the organizational backbone of any social system. Their low extraversion manifests not as disinterest, but as a preference for depth over breadth in relationships— they observe before acting, processing social dynamics with careful precision. Combined with high conscientiousness, this creates a methodical helper who delivers consistent quality without seeking recognition. Their high agreeableness ensures their thoroughness is always in service of others' needs. Under pressure, they retreat inward to perfect their work rather than seek social ventilation, often becoming the \"silent fixer\" who resolves problems before they escalate.",
      id: "Sang Pendukung Handal mewakili tulang punggung organisasi dari setiap sistem sosial. Extraversion rendah mereka bukanlah ketidaktertarikan, melainkan preferensi untuk kedalaman daripada keluasan dalam hubungan—mengamati sebelum bertindak, memproses dinamika sosial dengan kehati-hatian. Dikombinasikan dengan konscientiousness tinggi, ini menciptakan pembantu metodis yang memberikan kualitas konsisten tanpa mencari pengakuan. Agreeableness tinggi memastikan ketelitian mereka selalu dalam pelayanan kebutuhan orang lain. Dalam tekanan, mereka mundur ke dalam untuk menyempurnakan pekerjaan daripada mencari ventilasi sosial, sering menjadi \"perbaik diam-diam\" yang menyelesaikan masalah sebelum membesar."
    },
    social: {
      en: "They communicate through acts of service rather than verbal dominance, remembering details others forget and anticipating needs before they are voiced. In groups, they facilitate rather than lead, ensuring everyone is heard while maintaining harmony. They may appear reserved initially but reveal profound loyalty once trust is established. Conflict causes them genuine discomfort, leading them to mediate tensions through practical compromises.",
      id: "Mereka berkomunikasi melalui tindakan layanan daripada dominasi verbal, mengingat detail yang orang lain lupa dan mengantisipasi kebutuhan sebelum diutarakan. Dalam kelompok, mereka memfasilitasi daripada memimpin, memastikan semua orang didengar sambil menjaga harmoni. Mereka mungkin tampak tertutup awalnya namun mengungkapkan loyalitas mendalam setelah kepercayaan terjalin. Konflik menyebabkan ketidaknyamanan nyata, membuat mereka menengahi ketegangan melalui kompromi praktis."
    },
    workplace: {
      en: "The embodiment of \"slow and steady wins the race.\" They produce error-free work through systematic double-checking, often becoming the go-to person for quality control. They thrive in roles requiring sustained attention to detail—accounting, editing, logistics, healthcare support. Deadlines are met through early starts and buffer time, never last-minute rushes. They resist multitasking, preferring to complete one task perfectly before moving to the next.",
      id: "Personifikasi dari \"perlahan tapi pasti menang.\" Mereka menghasilkan pekerjaan bebas kesalahan melalui pengecekan sistematis ganda, sering menjadi orang yang diandalkan untuk kontrol kualitas. Mereka berkembang dalam peran yang memerlukan perhatian berkelanjutan terhadap detail—akuntansi, editing, logistik, dukungan kesehatan. Tenggat waktu dipenuhi melalui awal yang cepat dan waktu penyangga, bukan terburu-buru menit terakhir. Mereka resisten terhadap multitasking, lebih suka menyelesaikan satu tugas dengan sempurna sebelum beralih ke berikutnya."
    },
    driver: {
      en: "Integrity through service. They are motivated by the internal satisfaction of knowing they have upheld their commitments and genuinely helped others, finding meaning in being indispensable yet unassuming.",
      id: "Integritas melalui pelayanan. Mereka termotivasi oleh kepuasan internal mengetahui bahwa mereka telah memenuhi komitmen dan benar-benar membantu orang lain, menemukan makna dalam menjadi penting namun sederhana."
    }
  },
  {
    id: "ARCH-03",
    targets: {
      O: 1,
      N: 1,
      C: -1
    },
    name: {
      en: "The Chaotic Creative",
      id: "Sang Kreatif Kacau"
    },
    formula: {
      en: "High O + High N (Low Stability) + Low C",
      id: "O Tinggi + N Tinggi (Stabilitas Rendah) + C Rendah"
    },
    summary: {
      en: "The Chaotic Creative exists in a state of perpetual cognitive turbulence—where imagination and anxiety collide to produce both brilliant insights and paralyzing doubt. Their high openness floods them with novel associations and aesthetic sensitivities, while their neuroticism amplifies every creative risk into a potential catastrophe. The absence of conscientiousness means their rich internal world rarely translates into finished products; they begin masterpieces but abandon them when anxiety peaks or when new inspiration strikes. Under stress, they spiral into creative blocks or frantic, disorganized productivity. Their identity is fluid, shifting between grandiose artistic visions and crushing self-criticism.",
      id: "Sang Kreatif Kacau hidup dalam keadaan turbulensi kognitif yang terus-menerus—di mana imajinasi dan kecemasan bertabrakan untuk menghasilkan wawasan brilian dan keraguan melumpuhkan. Keterbukaan tinggi membanjiri mereka dengan asosiasi novel dan sensitivitas estetika, sementara neurotisisme memperkuat setiap risiko kreatif menjadi potensi bencana. Absennya konscientiousness berarti dunia internal yang kaya jarang diterjemahkan ke dalam produk jadi; mereka memulai mahakarya namun meninggalkannya ketika kecemasan memuncak atau ketika inspirasi baru datang. Dalam stres, mereka berputar dalam blok kreatif atau produktivitas panik yang tidak terorganisir. Identitas mereka fluida, bergeser antara visi artistik grandios dan kritik diri yang menghancurkan."
    },
    social: {
      en: "They communicate in intense bursts—either passionate monologues about their latest obsession or withdrawn silence when overwhelmed. Relationships are marked by intensity and inconsistency; they idealize new connections then withdraw when vulnerability feels threatening. They seek \"muse\" relationships that fuel their creativity but struggle with mundane social maintenance. Others often experience them as fascinating but exhausting, brilliant but unreliable.",
      id: "Mereka berkomunikasi dalam ledakan intens—baik monolog penuh gairah tentang obsesi terbaru atau keheningan yang menarik diri ketika kewalahan. Hubungan ditandai oleh intensitas dan inkonsistensi; mereka mengidealkan koneksi baru kemudian menarik diri ketika kerentanan terasa mengancam. Mereka mencari hubungan \"muse\" yang memicu kreativitas namun kesulitan dengan pemeliharaan sosial yang membosankan. Orang lain sering mengalami mereka sebagai menarik namun melelahkan, brilian namun tidak dapat diandalkan."
    },
    workplace: {
      en: "They generate innovative concepts that others must implement, often leaving trails of half-completed projects. They resist deadlines as \"creativity killers,\" experiencing genuine cognitive distress when forced to produce on schedule. Best suited for brainstorming roles or artistic positions with minimal administrative burden. They may thrive in startup environments where chaos is normalized, but struggle as organizations mature and demand consistency.",
      id: "Mereka menghasilkan konsep inovatif yang orang lain harus implementasikan, sering meninggalkan jejak proyek setengah jadi. Mereka menolak tenggat waktu sebagai \"pembunuh kreativitas,\" mengalami stres kognitif nyata ketika dipaksa menghasilkan sesuai jadwal. Paling cocok untuk peran brainstorming atau posisi artistik dengan beban administratif minimal. Mereka mungkin berkembang dalam lingkungan startup di mana kekacauan dinormalisasi, namun kesulitan saat organisasi matang dan menuntut konsistensi."
    },
    driver: {
      en: "Authentic expression through transformation. They are motivated by the need to process their intense internal experiences into external form, seeking to make sense of their emotional chaos through creative acts.",
      id: "Ekspresi autentik melalui transformasi. Mereka termotivasi oleh kebutuhan untuk memproses pengalaman internal yang intens ke dalam bentuk eksternal, mencoba memahami kekacauan emosional mereka melalui tindakan kreatif."
    }
  },
  {
    id: "ARCH-04",
    targets: {
      C: 1,
      O: 1,
      E: -1
    },
    name: {
      en: "The Strategic Architect",
      id: "Sang Arsitek Strategis"
    },
    formula: {
      en: "High C + High O + Low E",
      id: "C Tinggi + O Tinggi + E Rendah"
    },
    summary: {
      en: "The Strategic Architect combines visionary thinking with disciplined execution, creating master plans that others eventually follow. Their high openness provides the conceptual framework for innovation, while their high conscientiousness ensures these visions are built on solid, actionable foundations. Low extraversion means they develop these strategies in solitude, preferring to present fully-formed solutions rather than brainstorm socially. They experience the world as a system to be optimized, viewing emotions—including their own—as variables in a larger equation. Under stress, they retreat into analysis, becoming more systematic as situations become more chaotic.",
      id: "Sang Arsitek Strategis menggabungkan pemikiran visioner dengan disiplin eksekusi, menciptakan master plan yang akhirnya diikuti orang lain. Keterbukaan tinggi menyediakan kerangka konseptual untuk inovasi, sementara konscientiousness tinggi memastikan visi-visi ini dibangun di atas fondasi solid yang dapat ditindaklanjuti. Extraversion rendah berarti mereka mengembangkan strategi ini dalam kesendirian, lebih suka menyajikan solusi yang sudah matang daripada brainstorming secara sosial. Mereka mengalami dunia sebagai sistem yang harus dioptimalkan, memandang emosi—termasuk emosi mereka sendiri—sebagai variabel dalam persamaan yang lebih besar. Dalam stres, mereka mundur ke analisis, menjadi lebih sistematis saat situasi menjadi lebih kacau."
    },
    social: {
      en: "They communicate in structured, logical presentations, often appearing cold because they prioritize ideas over emotional rapport. They observe social dynamics as data patterns rather than lived experiences, which can make them effective but detached leaders. They form few but intellectually intense relationships based on shared competence. Social small talk feels inefficient; they prefer conversations with clear objectives and measurable outcomes.",
      id: "Mereka berkomunikasi dalam presentasi terstruktur dan logis, sering tampak dingin karena mereka memprioritaskan ide daripada kedekatan emosional. Mereka mengamati dinamika sosial sebagai pola data daripada pengalaman yang dijalani, yang dapat membuat mereka menjadi pemimpin efektif namun terpisah. Mereka membentuk beberapa hubungan namun intens secara intelektual berdasarkan kompetensi bersama. Obrolan sosial kecil terasa tidak efisien; mereka lebih suka percakapan dengan tujuan jelas dan hasil yang terukur."
    },
    workplace: {
      en: "They are the master planners who design systems that outlast their tenure. They excel in strategic roles—urban planning, software architecture, financial modeling, research direction. They document everything, creating institutional knowledge that survives personnel changes. They meet deadlines through ruthless prioritization and buffer management, often delivering early with comprehensive risk assessments attached. They struggle in roles requiring rapid social adaptation or emotional labor.",
      id: "Mereka adalah perencana ulang yang merancang sistem yang bertahan lebih lama dari masa jabatan mereka. Mereka unggul dalam peran strategis—perencanaan kota, arsitektur perangkat lunak, pemodelan keuangan, arahan penelitian. Mereka mendokumentasikan segalanya, menciptakan pengetahuan institusional yang bertahan perubahan personel. Mereka memenuhi tenggat waktu melalui prioritisasi tanpa ampun dan manajemen penyangga, sering mengirim lebih awal dengan penilaian risiko komprehensif terlampir. Mereka kesulitan dalam peran yang memerlukan adaptasi sosial cepat atau kerja emosional."
    },
    driver: {
      en: "Order through understanding. They are motivated by the need to impose logical structure on complexity, finding satisfaction in creating systems that function flawlessly independent of human unpredictability.",
      id: "Keteraturan melalui pemahaman. Mereka termotivasi oleh kebutuhan untuk memberikan struktur logis pada kompleksitas, menemukan kepuasan dalam menciptakan sistem yang berfungsi sempurna terlepas dari ketidakpastian manusia."
    }
  },
  {
    id: "ARCH-05",
    targets: {
      O: 1,
      A: 1,
      E: 1
    },
    name: {
      en: "The Empathic Visionary",
      id: "Sang Visioner Empatik"
    },
    formula: {
      en: "High O + High A + High E",
      id: "O Tinggi + A Tinggi + E Tinggi"
    },
    summary: {
      en: "The Empathic Visionary channels creative energy into human connection, making abstract concepts emotionally accessible to others. Their high openness generates novel ideas, while their high agreeableness ensures these ideas serve collective wellbeing rather than personal glory. High extraversion transforms them into charismatic advocates who can enroll others in their visions. They experience reality as malleable through relationships—believing that the right combination of creativity and compassion can solve any problem. Under stress, they seek collaborative solutions, becoming more socially active when anxious rather than withdrawing.",
      id: "Sang Visioner Empatik menyalurkan energi kreatif ke dalam koneksi manusia, membuat konsep abstrak menjadi dapat diakses secara emosional oleh orang lain. Keterbukaan tinggi menghasilkan ide-ide baru, sementara agreeableness tinggi memastikan ide-ide ini melayani kesejahteraan kolektif daripada kejayaan pribadi. Extraversion tinggi mengubah mereka menjadi advokat karismatik yang dapat mendaftarkan orang lain dalam visi mereka. Mereka mengalami realitas sebagai sesuatu yang dapat dibentuk melalui hubungan—percaya bahwa kombinasi kreativitas dan kompasian yang tepat dapat menyelesaikan masalah apa pun. Dalam stres, mereka mencari solusi kolaboratif, menjadi lebih aktif secara sosial ketika cemas daripada menarik diri."
    },
    social: {
      en: "They are natural facilitators who read group energy and adjust their communication to elevate others. They ask probing questions that help people articulate their own insights, then celebrate these contributions publicly. They build diverse networks based on shared values rather than status, often bridging disparate social groups. Their enthusiasm can overwhelm introverts, but their genuine care usually compensates for their intensity.",
      id: "Mereka adalah fasilitator alami yang membaca energi kelompok dan menyesuaikan komunikasi mereka untuk mengangkat orang lain. Mereka mengajukan pertanyaan mendalam yang membantu orang mengartikulasikan wawasan mereka sendiri, kemudian merayakan kontribusi ini secara publik. Mereka membangun jaringan beragam berdasarkan nilai bersama daripada status, sering menjembatani kelompok sosial yang berbeda. Antusiasme mereka dapat membuat introvert kewalahan, namun kepedulian tulus mereka biasanya mengompensasi intensitas mereka."
    },
    workplace: {
      en: "They excel in roles requiring innovation plus stakeholder management—design thinking facilitation, social entrepreneurship, organizational development, creative direction. They transform sterile meetings into collaborative sessions and can sell unconventional ideas to risk-averse executives through emotional intelligence. They may struggle with solitary analytical work or bureaucratic resistance to change. Deadlines are met through team mobilization rather than individual overtime.",
      id: "Mereka unggul dalam peran yang memerlukan inovasi plus manajemen pemangku kepentingan—fasilitasi design thinking, kewirausahaan sosial, pengembangan organisasi, arahan kreatif. Mereka mengubah pertemuan kaku menjadi sesi kolaboratif dan dapat menjual ide-ide tidak konvensional ke eksekutif yang menghindari risiko melalui kecerdasan emosional. Mereka mungkin kesulitan dengan pekerjaan analitis menyendiri atau resistensi birokratik terhadap perubahan. Tenggat waktu dipenuhi melalui mobilisasi tim daripada lembur individual."
    },
    driver: {
      en: "Progress through connection. They are motivated by the belief that human potential is unlocked through creative collaboration, finding purpose in helping others see possibilities they couldn't imagine alone.",
      id: "Kemajuan melalui koneksi. Mereka termotivasi oleh keyakinan bahwa potensi manusia dibuka melalui kolaborasi kreatif, menemukan tujuan dalam membantu orang lain melihat kemungkinan yang tidak bisa mereka bayangkan sendiri."
    }
  },
  {
    id: "ARCH-06",
    targets: {
      N: -1,
      C: 1,
      E: -1
    },
    name: {
      en: "The Stoic Operator",
      id: "Sang Operator Stoik"
    },
    formula: {
      en: "Low N (High Stability) + High C + Low E",
      id: "N Rendah (Stabilitas Tinggi) + C Tinggi + E Rendah"
    },
    summary: {
      en: "The Stoic Operator is the unflappable executor who maintains performance regardless of external chaos. Their emotional stability provides a baseline of calm that never wavers, while their high conscientiousness channels this steadiness into relentless productivity. Low extraversion means they accomplish this without fanfare or social validation— they are the engines that never overheat and never demand attention. They experience stress as information rather than emotion, processing pressure through action rather than reaction. Their worldview is fundamentally practical: problems exist to be solved, emotions are data points, and drama is inefficient.",
      id: "Sang Operator Stoik adalah pelaksana yang tidak dapat digoyahkan yang mempertahankan kinerja terlepas dari kekacauan eksternal. Stabilitas emosional mereka menyediakan garis dasar ketenangan yang tidak pernah goyah, sementara konscientiousness tinggi menyalurkan ketenangan ini ke dalam produktivitas tanpa henti. Extraversion rendah berarti mereka mencapai ini tanpa sensasi atau validasi sosial—mereka adalah mesin yang tidak pernah overheat dan tidak pernah menuntut perhatian. Mereka mengalami stres sebagai informasi daripada emosi, memproses tekanan melalui tindakan daripada reaksi. Pandangan dunia mereka secara fundamental praktis: masalah ada untuk diselesaikan, emosi adalah titik data, dan drama tidak efisien."
    },
    social: {
      en: "They communicate minimally but precisely, often appearing robotic to those seeking emotional engagement. They listen more than speak, absorbing information without the need to validate speakers through visible reactions. Relationships are built on reliability rather than intimacy—others know they will be there without needing constant confirmation. They are uncomfortable with emotional displays, responding to tears or anger with practical assistance rather than empathy.",
      id: "Mereka berkomunikasi minimal namun tepat, sering tampak robotik bagi mereka yang mencari keterlibatan emosional. Mereka lebih banyak mendengarkan daripada berbicara, menyerap informasi tanpa kebutuhan untuk memvalidasi pembicara melalui reaksi yang terlihat. Hubungan dibangun atas keandalan daripada kedekatan—orang lain tahu mereka akan ada tanpa memerlukan konfirmasi konstan. Mereka tidak nyaman dengan tampilan emosional, merespons air mata atau kemarahan dengan bantuan praktis daripada empati."
    },
    workplace: {
      en: "The ultimate crisis responder—they become more focused as situations become more dire. They excel in high-stakes, high-stress roles: emergency medicine, military operations, financial trading, technical maintenance. They meet impossible deadlines through emotionless prioritization, often working through weekends without complaint or burnout. They resist roles requiring \"buy-in\" or \"vision casting,\" preferring clear objectives and autonomy. They may be undervalued because they don't advocate for themselves.",
      id: "Responder krisis pamungkas—mereka menjadi lebih fokus saat situasi menjadi lebih genting. Mereka unggul dalam peran taruhan tinggi, stres tinggi: kedokteran darurat, operasi militer, perdagangan keuangan, pemeliharaan teknis. Mereka memenuhi tenggat waktu yang mustahil melalui prioritisasi tanpa emosi, sering bekerja di akhir pekan tanpa keluhan atau kelelahan. Mereka resisten terhadap peran yang memerlukan \"buy-in\" atau \"vision casting,\" lebih suka tujuan jelas dan otonomi. Mereka mungkin diremehkan karena tidak mengadvokasi diri mereka sendiri."
    },
    driver: {
      en: "Competence through endurance. They are motivated by the internal metric of tasks completed correctly, finding meaning in being the reliable constant that others depend on without acknowledging.",
      id: "Kompetensi melalui ketahanan. Mereka termotivasi oleh metrik internal tugas yang diselesaikan dengan benar, menemukan makna dalam menjadi konstan yang dapat diandalkan yang orang lain andalkan tanpa mengakui."
    }
  },
  {
    id: "ARCH-07",
    targets: {
      E: 1,
      N: 1,
      A: -1
    },
    name: {
      en: "The Dynamic Persuader",
      id: "Sang Pendinamis Karismatik"
    },
    formula: {
      en: "High E + High N (Low Stability) + Low A",
      id: "E Tinggi + N Tinggi (Stabilitas Rendah) + A Rendah"
    },
    summary: {
      en: "The Dynamic Persuader is a force of volatile charisma—capable of mobilizing crowds while leaving interpersonal destruction in their wake. Their high extraversion provides the social energy to dominate rooms, while their neuroticism fuels an urgent, anxious need to be seen and validated. Low agreeableness means they pursue this validation without concern for collateral damage, viewing others as instruments for their goals. They experience life as a constant performance where they must win to survive. Under stress, they become more aggressive and more charming simultaneously—escalating manipulation as their anxiety increases.",
      id: "Sang Pendinamis Karismatik adalah kekuatan karisma yang mudah berubah—mampu memobilisasi kerumunan sambil meninggalkan kehancuran interpersonal di belakang mereka. Extraversion tinggi menyediakan energi sosial untuk mendominasi ruangan, sementara neurotisisme memicu kebutuhan gugup yang mendesak untuk dilihat dan divalidasi. Agreeableness rendah berarti mereka mengejar validasi ini tanpa kepedulian terhadap kerusakan kolateral, memandang orang lain sebagai instrumen untuk tujuan mereka. Mereka mengalami hidup sebagai pertunjukan konstan di mana mereka harus menang untuk bertahan hidup. Dalam stres, mereka menjadi lebih agresif dan lebih menawan secara bersamaan—mengintensifkan manipulasi saat kecemasan mereka meningkat."
    },
    social: {
      en: "They are magnetic storytellers who remember details specifically to use them later for influence. They create intense, transactional relationships based on mutual advantage rather than mutual care. They are skilled at reading vulnerabilities and exploiting them, often leaving others feeling simultaneously special and used. Conflict energizes them—they view arguments as winnable competitions and social friction as opportunities to demonstrate dominance.",
      id: "Mereka adalah pendongeng magnetik yang mengingat detail secara spesifik untuk menggunakannya nanti untuk pengaruh. Mereka menciptakan hubungan intens dan transaksional berdasarkan keuntungan timbal balik daripada kepedulian timbal balik. Mereka terampil dalam membaca kerentanan dan mengeksploitasinya, sering membuat orang lain merasa secara bersamaan istimewa dan digunakan. Konflik memberi mereka energi—mereka memandang argumen sebagai kompetisi yang bisa dimenangkan dan gesekan sosial sebagai kesempatan untuk menunjukkan dominasi."
    },
    workplace: {
      en: "They excel in zero-sum environments where individual performance is visibly rewarded—sales, litigation, politics, competitive fundraising. They meet deadlines through social pressure on others rather than personal effort, often delegating aggressively while taking credit. They thrive in chaotic environments where their ability to \"work the room\" outpaces systematic competitors. They struggle in collaborative cultures or roles requiring genuine mentorship. Their teams often experience high turnover due to burnout.",
      id: "Mereka unggul dalam lingkungan zero-sum di mana kinerja individual diberi hadiah secara terlihat—penjualan, litigasi, politik, penggalangan dana kompetitif. Mereka memenuhi tenggat waktu melalui tekanan sosial pada orang lain daripada usaha pribadi, sering mendelegasikan agresif sambil mengambil kredit. Mereka berkembang dalam lingkungan kacau di mana kemampuan mereka untuk \"mengolah ruangan\" mengungguli pesaing sistematis. Mereka kesulitan dalam budaya kolaboratif atau peran yang memerlukan mentorship tulus. Tim mereka sering mengalami turnover tinggi karena kelelahan."
    },
    driver: {
      en: "Validation through victory. They are motivated by the need to prove their worth through visible success, driven by an underlying terror of being forgotten or deemed insignificant.",
      id: "Validasi melalui kemenangan. Mereka termotivasi oleh kebutuhan untuk membuktikan nilai mereka melalui kesuksesan yang terlihat, didorong oleh teror mendasar akan dilupakan atau dianggap tidak signifikan."
    }
  },
  {
    id: "ARCH-08",
    targets: {
      O: 1,
      E: -1,
      N: -1
    },
    name: {
      en: "The Contemplative Sage",
      id: "Sang Bijak Kontemplatif"
    },
    formula: {
      en: "High O + Low E + Low N (High Stability)",
      id: "O Tinggi + E Rendah + N Rendah (Stabilitas Tinggi)"
    },
    summary: {
      en: "The Contemplative Sage observes the world with serene curiosity, processing complexity without the need to control or engage socially. Their high openness creates a rich internal landscape of ideas and possibilities, while their low extraversion and high stability allow them to explore this landscape without distraction or urgency. They are the scholars who study for understanding rather than application, the philosophers who question without anxiety. They experience time differently—comfortable with prolonged uncertainty and slow insight accumulation. Under stress, they retreat deeper into reflection, finding calm in intellectual distance from immediate pressures.",
      id: "Sang Bijak Kontemplatif mengamati dunia dengan rasa ingin tahu yang tenang, memproses kompleksitas tanpa kebutuhan untuk mengontrol atau terlibat secara sosial. Keterbukaan tinggi menciptakan lanskap internal yang kaya dari ide dan kemungkinan, sementara extraversion rendah dan stabilitas tinggi memungkinkan mereka untuk menjelajahi lanskap ini tanpa gangguan atau urgensi. Mereka adalah cendekiawan yang belajar untuk pemahaman daripada aplikasi, filsuf yang mempertanyakan tanpa kecemasan. Mereka mengalami waktu secara berbeda—nyaman dengan ketidakpastian yang berkepanjangan dan akumulasi wawasan yang lambat. Dalam stres, mereka mundur lebih dalam ke refleksi, menemukan ketenangan dalam jarak intelektual dari tekanan segera."
    },
    social: {
      en: "They communicate in measured, thoughtful responses that often arrive after the conversation has moved on—offering insights that reframe previous discussions. They form relationships based on intellectual resonance, often maintaining years-long correspondences with fellow thinkers. They are uncomfortable with social performance or rapid emotional disclosure, preferring parallel processing alongside others rather than direct engagement. They are often perceived as wise but distant, brilliant but inaccessible.",
      id: "Mereka berkomunikasi dalam respons yang terukur dan penuh pemikiran yang sering datang setelah percakapan telah bergerak—menawarkan wawasan yang membingkai ulang diskusi sebelumnya. Mereka membentuk hubungan berdasarkan resonansi intelektual, sering mempertahankan korespondensi bertahun-tahun dengan sesama pemikir. Mereka tidak nyaman dengan pertunjukan sosial atau pengungkapan emosional yang cepat, lebih suka pemrosesan paralel di samping orang lain daripada keterlibatan langsung. Mereka sering dianggap bijak namun jauh, brilian namun tidak dapat diakses."
    },
    workplace: {
      en: "They excel in roles valuing depth over speed—research, archival work, theoretical modeling, long-term forecasting. They produce work of exceptional quality given adequate time, but struggle with agile methodologies or rapid iteration cycles. They resist artificial deadlines, experiencing genuine cognitive dissonance when asked to produce insights on schedule. They thrive in institutions that protect \"thinking time\"—universities, research institutes, specialized libraries. They may be marginalized in fast-paced corporate cultures.",
      id: "Mereka unggul dalam peran yang menghargai kedalaman daripada kecepatan—penelitian, kerja arsip, pemodelan teoretis, peramalan jangka panjang. Mereka menghasilkan pekerjaan dengan kualitas luar biasa diberi waktu yang cukup, namun kesulitan dengan metodologi agile atau siklus iterasi yang cepat. Mereka menolak tenggat waktu buatan, mengalami disonansi kognitif nyata ketika diminta untuk menghasilkan wawasan sesuai jadwal. Mereka berkembang dalam institusi yang melindungi \"waktu berpikir\"—universitas, lembaga penelitian, perpustakaan khusus. Mereka mungkin termarginalkan dalam budaya korporat yang bergerak cepat."
    },
    driver: {
      en: "Understanding through patience. They are motivated by the pursuit of truth for its own sake, finding meaning in the gradual accumulation of knowledge that may not yield practical results for decades.",
      id: "Pemahaman melalui kesabaran. Mereka termotivasi oleh pengejaran kebenaran demi dirinya sendiri, menemukan makna dalam akumulasi bertahap pengetahuan yang mungkin tidak menghasilkan hasil praktis selama beberapa dekade."
    }
  },
  {
    id: "ARCH-09",
    targets: {
      A: 1,
      N: -1,
      E: 0
    },
    name: {
      en: "The Harmonious Diplomat",
      id: "Sang Diplomat Harmonis"
    },
    formula: {
      en: "High A + Low N (High Stability) + Moderate E",
      id: "A Tinggi + N Rendah (Stabilitas Tinggi) + E Sedang"
    },
    summary: {
      en: "The Harmonious Diplomat moves through social ecosystems preserving peace through genuine goodwill rather than strategic calculation. Their high agreeableness creates authentic concern for others' wellbeing, while their emotional stability ensures this concern doesn't become anxious people-pleasing. Moderate extraversion allows them to engage socially without dominating—present enough to facilitate, reserved enough to observe. They experience conflict as genuine pain rather than manageable inconvenience, making them natural peacekeepers. Under stress, they become more connecting rather than more withdrawn, seeking to heal fractures they perceive in their environment.",
      id: "Sang Diplomat Harmonis bergerak melalui ekosistem sosial melestarikan perdamaian melalui niat baik yang tulus daripada perhitungan strategis. Agreeableness tinggi menciptakan kepedulian otentik untuk kesejahteraan orang lain, sementara stabilitas emosional memastikan kepedulian ini tidak menjadi people-pleasing yang cemas. Extraversion sedang memungkinkan mereka untuk terlibat secara sosial tanpa mendominasi—cukup hadir untuk memfasilitasi, cukup terpesona untuk mengamati. Mereka mengalami konflik sebagai rasa sakit yang tulus daripada ketidaknyamanan yang dapat dikelola, membuat mereka menjadi penjaga perdamaian alami. Dalam stres, mereka menjadi lebih menghubungkan daripada lebih menarik diri, mencoba menyembuhkan retakan yang mereka rasakan dalam lingkungan mereka."
    },
    social: {
      en: "They are the social glue who remembers birthdays, checks in after difficult meetings, and notices when someone is withdrawn. They communicate through validation and affirmation, often restating others' points to ensure they feel heard. They build wide networks of genuine affection, maintaining relationships across decades and life changes. They struggle to deliver difficult feedback, often softening truth to the point of uselessness. Their presence lowers group anxiety, creating psychological safety through example.",
      id: "Mereka adalah perekat sosial yang mengingat ulang tahun, memeriksa setelah pertemuan yang sulit, dan memperhatikan ketika seseorang menarik diri. Mereka berkomunikasi melalui validasi dan afirmasi, sering mengulangi poin orang lain untuk memastikan mereka merasa didengar. Mereka membangun jaringan luas kasih tulus, mempertahankan hubungan di seluruh dekade dan perubahan hidup. Mereka kesulitan memberikan umpan balik yang sulit, sering melunakkan kebenaran sampai pada titik tidak berguna. Kehadiran mereka menurunkan kecemasan kelompok, menciptakan keamanan psikologis melalui contoh."
    },
    workplace: {
      en: "They excel in roles requiring trust-building across difference—human resources, mediation, customer success, community management. They transform toxic team cultures through consistent, low-key modeling of respect. They meet deadlines through collaborative support rather than individual heroics, often staying late to help struggling colleagues. They struggle in competitive environments or roles requiring hard negotiations. They may be exploited by less scrupulous colleagues who recognize their difficulty saying \"no.\"",
      id: "Mereka unggul dalam peran yang memerlukan pembangunan kepercayaan di seluruh perbedaan—sumber daya manusia, mediasi, kesuksesan pelanggan, manajemen komunitas. Mereka mengubah budaya tim yang toksik melalui pemodelan konsisten dan rendah hati dari rasa hormat. Mereka memenuhi tenggat waktu melalui dukungan kolaboratif daripada heroisme individual, sering tinggal larut untuk membantu rekan yang kesulitan. Mereka kesulitan dalam lingkungan kompetitif atau peran yang memerlukan negosiasi keras. Mereka mungkin dieksploitasi oleh rekan yang kurang bermoral yang mengenali kesulitan mereka mengatakan \"tidak.\""
    },
    driver: {
      en: "Unity through care. They are motivated by the need to create environments where people feel safe and valued, finding purpose in the emotional wellbeing of their communities.",
      id: "Persatuan melalui kepedulian. Mereka termotivasi oleh kebutuhan untuk menciptakan lingkungan di mana orang merasa aman dan dihargai, menemukan tujuan dalam kesejahteraan emosional komunitas mereka."
    }
  },
  {
    id: "ARCH-10",
    targets: {
      O: -1,
      C: 1,
      N: 1
    },
    name: {
      en: "The Pragmatic Realist",
      id: "Sang Realis Pragmatis"
    },
    formula: {
      en: "Low O + High C + High N (Low Stability)",
      id: "O Rendah + C Tinggi + N Tinggi (Stabilitas Rendah)"
    },
    summary: {
      en: "The Pragmatic Realist is a paradox of methodical anxiety—someone who manages fear through rigorous structure. Their low openness keeps them focused on proven, tangible solutions, while their high conscientiousness ensures these solutions are implemented with precision. High neuroticism means this precision is driven by worry rather than satisfaction, creating a person who checks locks three times not because they enjoy security, but because they fear consequences. They experience the world as inherently risky, with order being the only defense against chaos. Under stress, they tighten systems further, often creating rigid protocols that others find suffocating.",
      id: "Sang Realis Pragmatis adalah paradoks dari kecemasan yang metodis—seseorang yang mengelola ketakutan melalui struktur yang ketat. Keterbukaan rendah membuat mereka fokus pada solusi terbukti dan nyata, sementara konscientiousness tinggi memastikan solusi ini diimplementasikan dengan presisi. Neurotisisme tinggi berarti presisi ini didorong oleh kekhawatiran daripada kepuasan, menciptakan pribadi yang memeriksa kunci tiga kali bukan karena mereka menikmati keamanan, tetapi karena mereka takut konsekuensi. Mereka mengalami dunia sebagai secara inheren berisiko, dengan ketertiban sebagai satu-satunya pertahanan terhadap kekacauan. Dalam stres, mereka mengencangkan sistem lebih jauh, sering menciptakan protokol kaku yang orang lain temukan menyesakkan."
    },
    social: {
      en: "They communicate through specific, actionable details, becoming frustrated with abstract or speculative conversations. They form relationships based on reliability testing—observing who follows through before investing emotionally. They are often the \"worried parent\" figure in friend groups, anticipating dangers others ignore. They struggle with spontaneity, experiencing genuine distress when plans change unexpectedly. Their advice is always practical but often pessimistic, focusing on what could go wrong.",
      id: "Mereka berkomunikasi melalui detail spesifik dan dapat ditindaklanjuti, menjadi frustrasi dengan percakapan abstrak atau spekulatif. Mereka membentuk hubungan berdasarkan pengujian keandalan—mengamati siapa yang menindaklanjuti sebelum berinvestasi secara emosional. Mereka sering menjadi figur \"orang tua yang khawatir\" dalam kelompok teman, mengantisipasi bahaya yang orang lain abaikan. Mereka kesulitan dengan spontanitas, mengalami stres nyata ketika rencana berubah secara tak terduga. Nasihat mereka selalu praktis namun sering pesimis, fokus pada apa yang bisa salah."
    },
    workplace: {
      en: "They are the risk managers and compliance officers who prevent disasters through obsessive preparation. They excel in roles requiring zero-error tolerance—aviation safety, financial auditing, regulatory compliance, quality assurance. They meet deadlines through early starts and multiple backup plans, often delivering with extensive documentation of risk mitigation. They struggle in innovative environments or \"move fast and break things\" cultures. They may be perceived as obstructionist when they raise concerns others prefer to ignore.",
      id: "Mereka adalah manajer risiko dan petugas kepatuhan yang mencegah bencana melalui persiapan yang obsesif. Mereka unggul dalam peran yang memerlukan toleransi kesalahan nol—keselamatan penerbangan, audit keuangan, kepatuhan regulasi, jaminan kualitas. Mereka memenuhi tenggat waktu melalui awal yang cepat dan banyak rencana cadangan, sering mengirim dengan dokumentasi ekstensif dari mitigasi risiko. Mereka kesulitan dalam lingkungan inovatif atau budaya \"bergerak cepat dan merusak sesuatu.\" Mereka mungkin dianggap sebagai penghambat ketika mereka mengangkat kekhawatiran yang orang lain lebih suka abaikan."
    },
    driver: {
      en: "Safety through diligence. They are motivated by the need to prevent negative outcomes, finding meaning in being the careful voice that saves others from their own optimism.",
      id: "Keamanan melalui ketekunan. Mereka termotivasi oleh kebutuhan untuk mencegah hasil negatif, menemukan makna dalam menjadi suara hati-hati yang menyelamatkan orang lain dari optimisme mereka sendiri."
    }
  },
  {
    id: "ARCH-11",
    targets: {
      E: 1,
      O: 1,
      C: -1
    },
    name: {
      en: "The Bold Explorer",
      id: "Sang Penjelajah Berani"
    },
    formula: {
      en: "High E + High O + Low C",
      id: "E Tinggi + O Tinggi + C Rendah"
    },
    summary: {
      en: "The Bold Explorer charges into the unknown with infectious enthusiasm and minimal preparation. Their high extraversion turns novelty into social adventure, while their high openness ensures they are genuinely excited by uncertainty rather than merely tolerating it. Low conscientiousness means they prioritize experience over completion—starting journeys without maps and abandoning projects when they cease to stimulate. They experience life as a series of doors to be opened, with the opening being more important than what lies beyond. Under stress, they seek new stimuli rather than resolving existing problems, often creating additional chaos through impulsive decisions.",
      id: "Sang Penjelajah Berani menyerbu ke dalam yang tidak diketahui dengan antusiasme menular dan persiapan minimal. Extraversion tinggi mengubah hal baru menjadi petualangan sosial, sementara keterbukaan tinggi memastikan mereka benar-benar bersemangat dengan ketidakpastian daripada sekadar mentolerirnya. Konscientiousness rendah berarti mereka memprioritaskan pengalaman daripada penyelesaian—memulai perjalanan tanpa peta dan meninggalkan proyek ketika berhenti merangsang. Mereka mengalami hidup sebagai serangkaian pintu yang harus dibuka, dengan pembukaan menjadi lebih penting daripada apa yang ada di baliknya. Dalam stres, mereka mencari stimuli baru daripada menyelesaikan masalah yang ada, sering menciptakan kekacauan tambahan melalui keputusan impulsif."
    },
    social: {
      en: "They are the friends who suggest spontaneous road trips and the colleagues who propose radical pivots in meetings. They communicate through infectious excitement, enrolling others in their latest obsession before moving to the next. They form intense, short-duration connections based on shared adventures, often leaving maintainers behind as they pursue new horizons. They struggle with emotional maintenance, disappearing from relationships during mundane periods and reappearing when drama resumes.",
      id: "Mereka adalah teman yang menyarankan perjalanan mendadak dan rekan kerja yang mengusulkan pivot radikal dalam pertemuan. Mereka berkomunikasi melalui kegembiraan menular, mendaftarkan orang lain dalam obsesi terbaru mereka sebelum pindah ke berikutnya. Mereka membentuk koneksi intens dengan durasi singkat berdasarkan petualangan bersama, sering meninggalkan pemelihara di belakang saat mereka mengejar cakrawala baru. Mereka kesulitan dengan pemeliharaan emosional, menghilang dari hubungan selama periode membosankan dan muncul kembali ketika drama berlanjut."
    },
    workplace: {
      en: "They excel in roles requiring rapid adaptation and pivoting—startup founding, investigative journalism, crisis response, business development. They generate breakthrough ideas by combining unrelated concepts, but resist the follow-through required to implement them. They miss deadlines through distraction rather than incapacity, often having started ten projects while others finished one. They thrive in environments that value \"fail fast\" learning over polished delivery. They may be perceived as irresponsible by colleagues who must clean up their abandoned initiatives.",
      id: "Mereka unggul dalam peran yang memerlukan adaptasi cepat dan pivot—pendirian startup, jurnalisme investigatif, respons krisis, pengembangan bisnis. Mereka menghasilkan ide terobosan dengan menggabungkan konsep yang tidak terkait, namun menolak tindak lanjut yang diperlukan untuk mengimplementasikannya. Mereka melewatkan tenggat waktu melalui gangguan daripada ketidakmampuan, sering memulai sepuluh proyek sementara orang lain menyelesaikan satu. Mereka berkembang dalam lingkungan yang menghargai pembelajaran \"gagal cepat\" daripada pengiriman yang dipoles. Mereka mungkin dianggap tidak bertanggung jawab oleh rekan yang harus membersihkan inisiatif yang mereka tinggalkan."
    },
    driver: {
      en: "Novelty through action. They are motivated by the need to continuously expand their experience frontier, finding meaning in the breadth of life lived rather than the depth of any single commitment.",
      id: "Kebaruan melalui tindakan. Mereka termotivasi oleh kebutuhan untuk terus memperluas batas pengalaman mereka, menemukan makna dalam keluasan hidup yang dijalani daripada kedalaman komitmen tunggal apa pun."
    }
  },
  {
    id: "ARCH-12",
    targets: {
      A: 1,
      C: 1,
      O: -1
    },
    name: {
      en: "The Nurturing Anchor",
      id: "Sang Jangkar Penyayang"
    },
    formula: {
      en: "High A + High C + Low O",
      id: "A Tinggi + C Tinggi + O Rendah"
    },
    summary: {
      en: "The Nurturing Anchor provides stability through caring consistency, grounding others in reliable support without demanding innovation or change. Their high agreeableness creates genuine investment in others' growth, while their high conscientiousness ensures this investment manifests as tangible, ongoing assistance. Low openness means they support others within established frameworks—helping people succeed in the system as it exists rather than imagining alternative systems. They experience relationships as long-term commitments to be maintained through daily effort. Under stress, they increase their caretaking, often neglecting self-care to preserve others' stability.",
      id: "Sang Jangkar Penyayang menyediakan stabilitas melalui konsistensi yang peduli, menopang orang lain dalam dukungan yang dapat diandalkan tanpa menuntut inovasi atau perubahan. Agreeableness tinggi menciptakan investasi tulus dalam pertumbuhan orang lain, sementara konscientiousness tinggi memastikan investasi ini terwujud sebagai bantuan nyata dan berkelanjutan. Keterbukaan rendah berarti mereka mendukung orang lain dalam kerangka yang mapan—membantu orang sukses dalam sistem seperti adanya daripada membayangkan sistem alternatif. Mereka mengalami hubungan sebagai komitmen jangka panjang yang harus dipertahankan melalui upaya harian. Dalam stres, mereka meningkatkan perawatan mereka, sering mengabaikan perawatan diri untuk melestarikan stabilitas orang lain."
    },
    social: {
      en: "They are the friends who remember your medication schedule and the colleagues who bring soup when you're sick. They communicate through consistent presence rather than dramatic interventions, checking in regularly without requiring crisis. They form lifelong bonds based on mutual support through ordinary difficulties, often becoming the \"aunt\" or \"uncle\" figure to younger generations. They struggle with boundary setting, experiencing guilt when they cannot meet others' needs. They may enable dependency by making it too easy for others to avoid self-sufficiency.",
      id: "Mereka adalah teman yang mengingat jadwal obat Anda dan rekan kerja yang membawa sup ketika Anda sakit. Mereka berkomunikasi melalui kehadiran konsisten daripada intervensi dramatis, memeriksa secara teratur tanpa memerlukan krisis. Mereka membentuk ikatan seumur hidup berdasarkan dukungan timbal balik melalui kesulitan biasa, sering menjadi figur \"bibi\" atau \"paman\" untuk generasi yang lebih muda. Mereka kesulitan dengan penentuan batas, mengalami rasa bersalah ketika mereka tidak dapat memenuhi kebutuhan orang lain. Mereka mungkin membuat ketergantungan dengan membuatnya terlalu mudah bagi orang lain untuk menghindari kemandirian."
    },
    workplace: {
      en: "They excel in roles requiring sustained care within established systems—nursing, teaching, social work, administrative support, elder care. They create institutional memory through their longevity, knowing where everything is and how everyone prefers to work. They meet deadlines through steady, unspectacular effort, often staying late to ensure others' work is supported. They struggle in environments that value innovation over maintenance or efficiency over care. They may be undervalued because their contributions are invisible when functioning correctly.",
      id: "Mereka unggul dalam peran yang memerlukan perawatan berkelanjutan dalam sistem yang mapan—perawatan keperawatan, pengajaran, pekerjaan sosial, dukungan administratif, perawatan lansia. Mereka menciptakan memori institusional melalui longevity mereka, mengetahui di mana semuanya berada dan bagaimana setiap orang lebih suka bekerja. Mereka memenuhi tenggat waktu melalui upaya stabil yang tidak spektakuler, sering tinggal larut untuk memastikan pekerjaan orang lain didukung. Mereka kesulitan dalam lingkungan yang menghargai inovasi daripada pemeliharaan atau efisiensi daripada perawatan. Mereka mungkin diremehkan karena kontribusi mereka tidak terlihat ketika berfungsi dengan benar."
    },
    driver: {
      en: "Stability through service. They are motivated by the need to be the reliable foundation that others can build upon, finding meaning in the gradual, cumulative impact of consistent care.",
      id: "Stabilitas melalui pelayanan. Mereka termotivasi oleh kebutuhan untuk menjadi fondasi yang dapat diandalkan yang dapat dibangun oleh orang lain, menemukan makna dalam dampak bertahap dan kumulatif dari perawatan yang konsisten."
    }
  },
  {
    id: "ARCH-13",
    targets: {
      O: 1,
      A: -1,
      C: 1
    },
    name: {
      en: "The Analytical Critic",
      id: "Sang Kritis Analitis"
    },
    formula: {
      en: "High O + Low A + High C",
      id: "O Tinggi + A Rendah + C Tinggi"
    },
    summary: {
      en: "The Analytical Critic combines creative ideation with ruthless standards, seeing possibilities that others miss and the flaws in those possibilities that others ignore. Their high openness generates alternatives to existing systems, while their low agreeableness allows them to articulate these alternatives without social cushioning. High conscientiousness means their critiques are grounded in detailed analysis rather than mere contrarianism. They experience the world as a series of suboptimal solutions requiring correction. Under stress, they become more critical and more productive simultaneously, channeling anxiety into systematic dismantling of inadequate approaches.",
      id: "Sang Kritis Analitis menggabungkan ideasi kreatif dengan standar yang kejam, melihat kemungkinan yang orang lain lewatkan dan kekurangan dalam kemungkinan itu yang orang lain abaikan. Keterbukaan tinggi menghasilkan alternatif untuk sistem yang ada, sementara agreeableness rendah memungkinkan mereka mengartikulasikan alternatif ini tanpa peredam sosial. Konscientiousness tinggi berarti kritik mereka didasarkan pada analisis detail daripada kontrarianisme semata. Mereka mengalami dunia sebagai serangkaian solusi suboptimal yang memerlukan koreksi. Dalam stres, mereka menjadi lebih kritis dan lebih produktif secara bersamaan, menyalurkan kecemasan ke dalam pembongkaran sistematis dari pendekatan yang tidak memadai."
    },
    social: {
      en: "They communicate through precise, often devastating analysis that improves ideas while damaging relationships. They form connections based on intellectual respect—valuing those who can defend their positions and dismissing those who rely on charm or authority. They are often the \"devil's advocate\" who prevents groupthink but is rarely invited to celebrations. They struggle with emotional validation, viewing comfort as dishonesty when problems exist. They may be intellectually admired and personally avoided.",
      id: "Mereka berkomunikasi melalui analisis yang tepat dan sering menghancurkan yang meningkatkan ide sambil merusak hubungan. Mereka membentuk koneksi berdasarkan rasa hormat intelektual—menghargai mereka yang dapat mempertahankan posisi mereka dan meremehkan mereka yang mengandalkan pesona atau otoritas. Mereka sering menjadi \"pengacara setan\" yang mencegah groupthink namun jarang diundang ke perayaan. Mereka kesulitan dengan validasi emosional, memandang kenyamanan sebagai ketidakjujuran ketika masalah ada. Mereka mungkin dikagumi secara intelektual dan dihindari secara pribadi."
    },
    workplace: {
      en: "They excel in roles requiring quality control and strategic improvement—editing, code review, management consulting, forensic analysis. They prevent disasters by identifying weaknesses before implementation, often saving organizations from their own optimism. They meet deadlines through perfectionist effort, often missing initial timelines but delivering superior final products. They struggle in collaborative brainstorming or roles requiring diplomatic delivery of feedback. They may be marginalized in consensus-driven cultures despite their contributions.",
      id: "Mereka unggul dalam peran yang memerlukan kontrol kualitas dan perbaikan strategis—editing, review kode, konsultasi manajemen, analisis forensik. Mereka mencegah bencana dengan mengidentifikasi kelemahan sebelum implementasi, sering menyelamatkan organisasi dari optimisme mereka sendiri. Mereka memenuhi tenggat waktu melalui upaya perfeksionis, sering melewatkan tenggat waktu awal namun mengirimkan produk akhir yang unggul. Mereka kesulitan dalam brainstorming kolaboratif atau peran yang memerlukan pengiriman umpan balik yang diplomatis. Mereka mungkin termarginalkan dalam budaya yang didorong oleh konsensus terlepas dari kontribusi mereka."
    },
    driver: {
      en: "Excellence through scrutiny. They are motivated by the need to optimize systems to their theoretical maximum, finding meaning in the elimination of error regardless of social cost.",
      id: "Keunggulan melalui pengawasan. Mereka termotivasi oleh kebutuhan untuk mengoptimalkan sistem ke maksimum teoritis mereka, menemukan makna dalam eliminasi kesalahan terlepas dari biaya sosial."
    }
  },
  {
    id: "ARCH-14",
    targets: {
      E: -1,
      N: -1,
      O: 0
    },
    name: {
      en: "The Serene Independent",
      id: "Sang Independen Serene"
    },
    formula: {
      en: "Low E + Low N (High Stability) + Moderate O",
      id: "E Rendah + N Rendah (Stabilitas Tinggi) + O Sedang"
    },
    summary: {
      en: "The Serene Independent maintains psychological autonomy through emotional self-sufficiency and moderate intellectual curiosity. Their low extraversion and high stability create a self-contained contentment that doesn't require social validation or external stimulation. Moderate openness provides enough interest to prevent stagnation without creating restless seeking. They experience life as fundamentally manageable—a series of personal choices rather than social obligations or existential crises. Under stress, they withdraw to self-sufficiency, often appearing unchanged while others panic. They are the emotional adults in immature environments.",
      id: "Sang Independen Serene menjaga otonomi psikologis melalui kemandirian emosional dan rasa ingin tahu intelektual yang sedang. Extraversion rendah dan stabilitas tinggi menciptakan kepuasan diri yang mandiri yang tidak memerlukan validasi sosial atau stimulasi eksternal. Keterbukaan sedang memberikan cukup minat untuk mencegah stagnasi tanpa menciptakan pencarian yang gelisah. Mereka mengalami hidup sebagai secara fundamental dapat dikelola—serangkaian pilihan pribadi daripada kewajiban sosial atau krisis eksistensial. Dalam stres, mereka mundur ke kemandirian diri, sering tampak tidak berubah sementara orang lain panik. Mereka adalah orang dewasa emosional dalam lingkungan yang belum matang."
    },
    social: {
      en: "They communicate when they have something to say and remain silent otherwise, without anxiety about either state. They form relationships based on mutual independence—valuing connections that don't demand constant maintenance. They are often the \"wise friend\" who offers perspective without drama, present in crises but not absorbed by them. They struggle to understand why others make their lives so complicated, sometimes offering \"just solve it\" advice that ignores emotional complexity. They may be perceived as cold by those who equate care with emotional display.",
      id: "Mereka berkomunikasi ketika mereka memiliki sesuatu untuk dikatakan dan tetap diam sebaliknya, tanpa kecemasan tentang keadaan mana pun. Mereka membentuk hubungan berdasarkan kemandirian timbal balik—menghargai koneksi yang tidak menuntut pemeliharaan konstan. Mereka sering menjadi \"teman bijak\" yang menawarkan perspektif tanpa drama, hadir dalam krisis namun tidak terserap olehnya. Mereka kesulitan memahami mengapa orang lain membuat hidup mereka begitu rumit, kadang-kadang menawarkan nasihat \"selesaikan saja\" yang mengabaikan kompleksitas emosional. Mereka mungkin dianggap dingin oleh mereka yang menyamakan perawatan dengan tampilan emosional."
    },
    workplace: {
      en: "They excel in roles requiring autonomous judgment without social oversight—remote work, solo research, independent contracting, specialized craftsmanship. They produce consistent output without management intervention, often exceeding expectations quietly. They meet deadlines through steady, unremarkable progress, rarely requiring extensions or delivering early. They struggle in team-based collaborative environments or roles requiring emotional labor and stakeholder management. They may be overlooked for advancement because they don't advocate for themselves or build political alliances.",
      id: "Mereka unggul dalam peran yang memerlukan penilaian otonom tanpa pengawasan sosial—kerja jarak jauh, penelitian mandiri, kontrak independen, kerajinan khusus. Mereka menghasilkan output konsisten tanpa intervensi manajemen, sering melebihi ekspektasi secara diam-diam. Mereka memenuhi tenggat waktu melalui kemajian stabil yang tidak mencolok, jarang memerlukan perpanjangan atau mengirim lebih awal. Mereka kesulitan dalam lingkungan kolaboratif berbasis tim atau peran yang memerlukan kerja emosional dan manajemen pemangku kepentingan. Mereka mungkin terlewatkan untuk kemajuan karena mereka tidak mengadvokasi diri mereka sendiri atau membangun aliansi politik."
    },
    driver: {
      en: "Autonomy through equilibrium. They are motivated by the need to maintain internal balance regardless of external circumstances, finding meaning in self-directed competence.",
      id: "Otonomi melalui keseimbangan. Mereka termotivasi oleh kebutuhan untuk menjaga keseimbangan internal terlepas dari keadaan eksternal, menemukan makna dalam kompetensi yang diarahkan-sendiri."
    }
  },
  {
    id: "ARCH-15",
    targets: {
      O: 1,
      E: 1,
      N: 1,
      A: 1
    },
    name: {
      en: "The Passionate Reformer",
      id: "Sang Reformis Bersemangat"
    },
    formula: {
      en: "High O + High E + High N (Low Stability) + High A",
      id: "O Tinggi + E Tinggi + N Tinggi (Stabilitas Rendah) + A Tinggi"
    },
    summary: {
      en: "The Passionate Reformer is driven by a volatile combination of visionary idealism and anxious urgency—seeing a better world and unable to rest until it arrives. Their high openness generates transformative visions, while their high extraversion compels them to recruit others to these visions. High neuroticism creates genuine distress at current injustices, preventing the detached patience of pure idealists. High agreeableness ensures their reform efforts are rooted in compassion for the vulnerable rather than personal glory. They experience reality as unbearably misaligned with possibility, creating chronic activist burnout. Under stress, they escalate both their efforts and their despair, often collapsing after major campaigns.",
      id: "Sang Reformis Bersemangat didorong oleh kombinasi mudah berubah dari idealisme visioner dan urgensi cemas—melihat dunia yang lebih baik dan tidak dapat beristirahat sampai tiba. Keterbukaan tinggi menghasilkan visi transformatif, sementara extraversion tinggi memaksa mereka untuk merekrut orang lain ke visi ini. Neurotisisme tinggi menciptakan stres nyata pada ketidakadilan saat ini, mencegah kesabaran detas dari para idealis murni. Agreeableness tinggi memastikan upaya reform mereka berakar pada belas kasihan bagi yang rentan daripada kejayaan pribadi. Mereka mengalami realitas sebagai tidak tertahankan tidak selaras dengan kemungkinan, menciptakan burnout aktivis kronis. Dalam stres, mereka meningkatkan upaya dan keputusasaan mereka secara bersamaan, sering pingsan setelah kampanye besar."
    },
    social: {
      en: "They communicate through urgent moral framing, converting casual conversations into consciousness-raising sessions. They form intense, mission-driven relationships based on shared values, often struggling with those who \"don't care enough.\" They are the friends who send articles about injustice at midnight and organize interventions for collective problems. They struggle with mundane maintenance, often neglecting personal relationships while saving strangers. They may be perceived as exhausting or inspiring, rarely neutral.",
      id: "Mereka berkomunikasi melalui pengambilan kerangka moral yang mendesak, mengubah percakapan kasual menjadi sesi kesadaran. Mereka membentuk hubungan intens yang didorong oleh misi berdasarkan nilai bersama, sering kesulitan dengan mereka yang \"tidak cukup peduli.\" Mereka adalah teman yang mengirim artikel tentang ketidakadilan di tengah malam dan mengorganisir intervensi untuk masalah kolektif. Mereka kesulitan dengan pemeliharaan membosankan, sering mengabaikan hubungan pribadi sambil menyelamatkan orang asing. Mereka mungkin dianggap melelahkan atau menginspirasi, jarang netral."
    },
    workplace: {
      en: "They excel in mission-driven environments requiring evangelical commitment—nonprofit leadership, advocacy, social entrepreneurship, investigative journalism. They transform organizational cultures through sheer moral force, often dragging reluctant institutions toward their values. They meet deadlines through crisis energy, often working in unsustainable sprints before recovery periods. They struggle in neutral corporate environments or roles requiring procedural patience. They may experience chronic burnout from the gap between their ideals and achievable outcomes.",
      id: "Mereka unggul dalam lingkungan yang didorong oleh misi yang memerlukan komitmen evangelis—kepemimpinan nirlaba, advokasi, kewirausahaan sosial, jurnalisme investigatif. Mereka mengubah budaya organisasi melalui kekuatan moral semata, sering menyeret institusi yang enggan menuju nilai-nilai mereka. Mereka memenuhi tenggat waktu melalui energi krisis, sering bekerja dalam sprint yang tidak berkelanjutan sebelum periode pemulihan. Mereka kesulitan dalam lingkungan korporat netral atau peran yang memerlukan kesabaran prosedural. Mereka mungkin mengalami burnout kronis dari kesenjangan antara ideal mereka dan hasil yang dapat dicapai."
    },
    driver: {
      en: "Justice through urgency. They are motivated by the need to close the gap between what is and what should be, finding meaning in being the conscience that refuses to let others rest comfortable with injustice.",
      id: "Keadilan melalui urgensi. Mereka termotivasi oleh kebutuhan untuk menutup kesenjangan antara apa yang ada dan apa yang seharusnya, menemukan makna dalam menjadi hati nurani yang menolak membiarkan orang lain beristirahat nyaman dengan ketidakadilan."
    }
  }
];
