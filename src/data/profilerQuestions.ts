/**
 * The Profiler question bank (EN + ID).
 *
 * Questions are deliberately light: every answer is revealed with its owner's
 * name at the end of the round, so nothing here should embarrass anyone or
 * invite a confession of wrongdoing. Every multiple-choice option is a
 * reasonable, non-judged answer.
 */

type Localized = { en: string; id: string };

export type ProfilerQuestion =
  | { id: string; kind: 'choice'; text: Localized; options: Localized[] }
  | { id: string; kind: 'text'; text: Localized; placeholder: Localized };

export const TEXT_ANSWER_MAX = 60;

const choice = (id: string, text: [string, string], options: [string, string][]): ProfilerQuestion => ({
  id,
  kind: 'choice',
  text: { en: text[0], id: text[1] },
  options: options.map(([en, idText]) => ({ en, id: idText })),
});

const open = (id: string, text: [string, string], placeholder: [string, string]): ProfilerQuestion => ({
  id,
  kind: 'text',
  text: { en: text[0], id: text[1] },
  placeholder: { en: placeholder[0], id: placeholder[1] },
});

export const PROFILER_QUESTIONS: ProfilerQuestion[] = [
  choice('PF01', ['You suddenly receive 10 million rupiah. What do you do first?', 'Tiba-tiba kamu dapat uang 10 juta. Apa yang pertama kamu lakukan?'], [
    ['Save or invest it', 'Menabung atau investasi'], ['Go on a trip', 'Pergi liburan'], ['Buy something I’ve wanted for ages', 'Beli barang impian'], ['Treat family and friends', 'Traktir keluarga dan teman'],
  ]),
  choice('PF02', ['A friend cooks something that doesn’t taste great and asks what you think. You…', 'Temanmu memasak makanan yang rasanya kurang enak dan bertanya pendapatmu. Kamu…'], [
    ['Tell the truth, gently', 'Jujur, tapi halus'], ['Say it’s delicious', 'Bilang enak'], ['Suggest a small fix to the recipe', 'Kasih saran perbaikan resep'], ['Change the subject', 'Mengalihkan topik'],
  ]),
  choice('PF03', ['At a gathering full of new people, you usually…', 'Di acara kumpul dengan banyak orang baru, biasanya kamu…'], [
    ['Introduce myself first', 'Mengajak kenalan duluan'], ['Stick close to someone I know', 'Menempel ke teman yang sudah dikenal'], ['Listen more than I talk', 'Lebih banyak mendengarkan'], ['Check my phone', 'Sibuk dengan HP'],
  ]),
  choice('PF04', ['Pick a superpower:', 'Pilih satu kekuatan super:'], [
    ['Teleportation', 'Teleportasi'], ['Reading minds', 'Membaca pikiran'], ['Stopping time', 'Menghentikan waktu'], ['Never needing sleep', 'Tidak perlu tidur'],
  ]),
  choice('PF05', ['In a group project, your usual role is…', 'Dalam tugas kelompok, peranmu biasanya…'], [
    ['The leader', 'Pemimpin'], ['The detail person', 'Pengerja detail'], ['The peacemaker', 'Penengah'], ['The mood booster', 'Penyemangat dan penghibur'],
  ]),
  choice('PF06', ['You overslept and are 30 minutes late to meet a friend. You…', 'Kamu ketiduran dan telat 30 menit janjian dengan teman. Kamu…'], [
    ['Admit I overslept', 'Jujur bilang ketiduran'], ['Apologise without explaining', 'Minta maaf tanpa banyak alasan'], ['Offer to pay for their drink', 'Menawarkan traktir sebagai permintaan maaf'], ['Joke about it to lighten the mood', 'Bercanda supaya suasana cair'],
  ]),
  choice('PF07', ['Your ideal weekend:', 'Akhir pekan idealmu:'], [
    ['Lazing around at home', 'Rebahan di rumah'], ['Hanging out with a big group', 'Nongkrong ramai-ramai'], ['Getting out into nature', 'Jalan-jalan ke alam'], ['Working on a side project', 'Mengerjakan proyek sampingan'],
  ]),
  choice('PF08', ['Just before a friend submits their work, you spot a small mistake. You…', 'Sebelum temanmu mengumpulkan tugas, kamu melihat ada kesalahan kecil. Kamu…'], [
    ['Tell them straight away', 'Langsung bilang'], ['Ask if they want a second pair of eyes', 'Tanya dulu apakah dia mau dibantu cek'], ['Let it go — it’s small', 'Biarkan saja, kesalahannya kecil'], ['Fix it together with them', 'Memperbaikinya bersama'],
  ]),
  choice('PF09', ['When you’re stressed, you’re most likely to…', 'Saat stres, kamu paling mungkin…'], [
    ['Talk to a friend', 'Cerita ke teman'], ['Eat something', 'Makan'], ['Sleep', 'Tidur'], ['Keep busy or exercise', 'Menyibukkan diri atau olahraga'],
  ]),
  choice('PF10', ['If you could go back in time, you would…', 'Kalau bisa kembali ke masa lalu, kamu akan…'], [
    ['Change one decision', 'Mengubah satu keputusan'], ['Relive a happy moment', 'Mengulang momen bahagia'], ['Give my younger self some advice', 'Memberi nasihat ke diriku yang lebih muda'], ['Not go back at all', 'Tidak mau kembali'],
  ]),
  choice('PF11', ['You get your dream job, but it means moving far from family. You…', 'Kamu mendapat pekerjaan impian, tapi harus pindah jauh dari keluarga. Kamu…'], [
    ['Take it immediately', 'Langsung ambil'], ['Take it for a few years', 'Ambil untuk beberapa tahun'], ['Negotiate to work remotely', 'Negosiasi kerja jarak jauh'], ['Turn it down', 'Menolaknya'],
  ]),
  choice('PF12', ['You find a wallet with money and an ID card on the street. You…', 'Kamu menemukan dompet berisi uang dan KTP di jalan. Kamu…'], [
    ['Contact the owner using the ID', 'Menghubungi pemiliknya lewat KTP'], ['Hand it to the police or security', 'Menyerahkannya ke polisi atau satpam'], ['Post it on social media', 'Mengunggahnya di media sosial'], ['Leave it at the nearest shop', 'Menitipkannya ke toko terdekat'],
  ]),
  choice('PF13', ['The movie you’re most likely to watch tonight:', 'Film yang paling mungkin kamu tonton malam ini:'], [
    ['Comedy', 'Komedi'], ['Horror', 'Horor'], ['Romance', 'Romantis'], ['Documentary', 'Dokumenter'],
  ]),
  choice('PF14', ['A group chat is buzzing with gossip. You…', 'Grup chat sedang ramai membahas gosip. Kamu…'], [
    ['Join in', 'Ikut nimbrung'], ['Read quietly', 'Membaca diam-diam'], ['Mute the chat', 'Membisukan grup'], ['Steer the topic elsewhere', 'Mengalihkan topik'],
  ]),
  choice('PF15', ['Which matters more to you in a friend?', 'Mana yang lebih penting dari seorang teman?'], [
    ['Honesty', 'Kejujuran'], ['Loyalty', 'Kesetiaan'], ['A good sense of humour', 'Selera humor'], ['Being there when needed', 'Selalu ada saat dibutuhkan'],
  ]),
  choice('PF16', ['You win a free holiday. Where do you go?', 'Kamu memenangkan liburan gratis. Ke mana kamu pergi?'], [
    ['A beach', 'Pantai'], ['The mountains', 'Pegunungan'], ['A big city abroad', 'Kota besar di luar negeri'], ['Back to my hometown', 'Pulang kampung'],
  ]),
  choice('PF17', ['Your phone battery hits 5%. You…', 'Baterai HP-mu tinggal 5%. Kamu…'], [
    ['Panic and look for a charger', 'Panik mencari charger'], ['Turn on battery saver and carry on', 'Nyalakan hemat baterai lalu lanjut'], ['Let it die — it’s fine', 'Biarkan mati, tidak apa-apa'], ['Borrow someone’s power bank', 'Pinjam power bank teman'],
  ]),
  choice('PF18', ['When you have to make a big decision, you…', 'Saat harus mengambil keputusan besar, kamu…'], [
    ['Make a list of pros and cons', 'Membuat daftar untung-rugi'], ['Ask lots of people for advice', 'Minta pendapat banyak orang'], ['Follow my gut', 'Mengikuti firasat'], ['Sleep on it for a few days', 'Menunggu beberapa hari dulu'],
  ]),
  choice('PF19', ['Pick the pet you’d most like to have:', 'Pilih hewan peliharaan yang paling ingin kamu punya:'], [
    ['A cat', 'Kucing'], ['A dog', 'Anjing'], ['Fish', 'Ikan'], ['None, thanks', 'Tidak mau pelihara'],
  ]),
  choice('PF20', ['At a karaoke night, you…', 'Saat karaoke bersama teman, kamu…'], [
    ['Grab the mic first', 'Pegang mic duluan'], ['Sing only in a group', 'Hanya mau nyanyi bareng'], ['Cheer everyone on', 'Jadi penyemangat'], ['Choose the songs', 'Jadi pemilih lagu'],
  ]),
  open('PF21', ['If your life were a movie right now, what would it be called?', 'Kalau hidupmu saat ini dijadikan film, apa judulnya?'], ['A movie title', 'Judul film']),
  open('PF22', ['One word that sums up your week:', 'Satu kata yang menggambarkan minggu ini untukmu:'], ['One word', 'Satu kata']),
  open('PF23', ['What would your last meal be?', 'Kalau hanya bisa makan satu hidangan terakhir, apa itu?'], ['A dish', 'Nama makanan']),
  open('PF24', ['A small thing that always makes you happy:', 'Satu hal kecil yang selalu bikin kamu senang:'], ['Something small', 'Hal kecil']),
  open('PF25', ['With one completely free week, you would…', 'Kalau punya satu minggu penuh tanpa kewajiban, kamu akan…'], ['Your plan', 'Rencanamu']),
  open('PF26', ['A song that could be the soundtrack of your life right now:', 'Lagu yang cocok jadi soundtrack hidupmu saat ini:'], ['Song title', 'Judul lagu']),
  open('PF27', ['If you were an animal, which one would you be?', 'Kalau kamu jadi hewan, kamu akan jadi hewan apa?'], ['An animal', 'Nama hewan']),
  open('PF28', ['The best advice you’ve ever received (short):', 'Nasihat terbaik yang pernah kamu terima (singkat):'], ['Short advice', 'Nasihat singkat']),
  open('PF29', ['A skill you wish you could learn instantly:', 'Keahlian yang ingin langsung kamu kuasai:'], ['A skill', 'Keahlian']),
  open('PF30', ['Your go-to comfort food:', 'Makanan andalan saat sedang sedih atau lelah:'], ['A food', 'Nama makanan']),
];
