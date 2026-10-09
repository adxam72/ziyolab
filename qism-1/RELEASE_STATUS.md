# ZiyoLab bosqichlar holati — 2026-10-08

| Bosqich | Holat |
| --- | --- |
| Startup.pptx va 4 loyiha hujjati | O‘rganilgan, hujjatlar mavjud; manba talablari va keyingi foydalanuvchi qarorlari ajratilgan |
| ZiyoLab brendi | Kirish, desktop/mobile navigatsiya, metadata, AI prompt va paket nomi yangilangan |
| Mustaqil ro‘yxatdan o‘tish | /royxatdan-otish va /api/auth/register ishlaydi: talaba akkaunti, avtomatik session, email unique, parol/tasdiq, rate limit, server fakulteti; 18 yangi API tekshiruvi o‘tgan |
| PostgreSQL / Prisma / pgvector | Mahalliy persistent baza ishlaydi |
| Supabase moslashuvi | Transaction/session pooler environment, RLS va 18 jadval uchun Data API huquqlarini yopish migratsiyasi tayyor; localda qo‘llangan |
| Ma’lumot ko‘chirish | Bo‘sh targetga tranzaksiyali transfer; JSON, FK sikli, parol xeshi, vector(768), RLS va to‘la bazani rad etish sinovdan o‘tgan |
| Auth va ta’lim modullari | Mahalliy ishlaydi; 45 integratsion tekshiruv o‘tgan |
| Kod va build | TypeScript, lint, 18 unit test, 45 mavjud + 18 ro‘yxatdan o‘tish API tekshiruvi, 3 desktop/mobile brauzer testi va production build o‘tgan |
| Supabase cloud | adxam72's Org Free rejasi tasdiqlangan; foydalanuvchi yangi ZiyoLab loyihasini tanlagan. get_cost connector amali UNAVAILABLE; yangi loyiha yaratilmagan, cloud ulanish fayli hali yo‘q |
| Vercel hosting | ziyolab loyihasini adxam72s-projects teamda yaratish POST 403 forbidden bilan rad etilgan. CLI 63.1.0 o‘rnatilgan, whoami Logged out. Live deploy bajarilmagan |
| Gemini / RAG | gemini-3.5-flash-lite + gemini-embedding-001 ishlaydi. Foydalanuvchi build/serverni qayta ishga tushirgach 16 jonli HTTP tekshiruvi o‘tdi: indexing 200, RAG 200, 7 material / vector(768), fakultet izolyatsiyasi, manbalar, chat persistence va AI sahifasida saqlangan suhbat |
| GitHub | Local repo mavjud, remote yo‘q; push bajarilmagan |

Mahalliy manzil: http://localhost:3000/kirish. Administrator kirishi .data/access.txt ichida; mavjud akkaunt va parol saqlangan. Bu fayl Gitga yoki hostingga yuborilmaydi.

Cloudni yakunlash: yangi Supabase loyiha uchun .env.supabase.local fayliga DATABASE_URL va DIRECT_URL, Vercel uchun mo‘ljallangan teamda yaratish/deploy ruxsati yoki CLI login kerak. Tartib docs/SUPABASE_VERCEL.md da. Kalit/parollarni chatga yubormang.

Rasmiy SSO va 100–300 real talabadagi pedagogik pilot ushbu local tekshiruv bilan tasdiqlanmagan.
