# ZiyoLab — ILMDAN NATIJAGA

Startup.pptx asosida yaratilgan o‘zbekcha ta’lim MVPsi. Talablar va texnik takliflar PRODUCT_REQUIREMENTS.md da ajratilgan.

## Ishga tushirish

Node.js 24 va npm talab qilinadi. Loyihada Next.js, Prisma va PostgreSQL uchun portativ local baza mavjud.

1. npm ci
2. .env.example ni .env ga nusxalang. GEMINI_API_KEY ni faqat shu lokal fayl yoki hosting secret orqali kiriting.
3. Alohida terminalda: npm run db:local
4. npm run db:migrate
5. npm run db:seed
6. npm run dev yoki npm run build va npm start

Manzil: http://localhost:3000/kirish . Local administrator kirishi .data/access.txt ichida. Tasodifiy parol birinchi seedda yaratiladi; hech qanday standart parol ishlatilmaydi. Administrator Boshqaruv sahifasida haqiqiy pilot talaba, o‘qituvchi va rahbar akkauntlarini yaratadi. Teacher uchun tanlangan guruh monitoringi, student uchun guruh a’zoligi o‘rnatiladi.

Local xizmatlarni production builddan so‘ng yashirin oynada ishga tushirish: ./START.ps1 . Xizmatlar faqat 127.0.0.1 da tinglaydi, loglar .data ichida. DB diskda .data/postgres katalogida saqlanadi. Bu PostgreSQL/PGlite, JSON yoki in-memory demo emas; PGlite production uchun ishlatilmaydi.

## Modullar

Mustaqil ro‘yxatdan o‘tish: `/royxatdan-otish`. Ism, email va kamida 12 belgili parol/tasdiq bilan talaba akkaunti yaratiladi va avtomatik kiriladi. Fakultet serverdagi REGISTRATION_FACULTY_ID orqali belgilanadi (default pilot-faculty); guruhni administrator biriktiradi. Client rol/fakultet tanlay olmaydi. Takroriy email, parallel dublikat va ortiqcha urinish himoyasi bor. Emailga egalik tasdig‘i uchun tashqi pochta integratsiyasi hali qo‘shilmagan.

- Shaxsiy bilim pasporti: baholanmagan holat, 7 ko‘nikma, eng so‘nggi natija va diagnostika tarixi.
- 21 savolli diagnostika: server grading, xato izohi, tranzaksiyali pasport va individual reja.
- O‘quv yo‘li: ko‘nikmaga mos material va persistent progress; guruh topshiriqlariga javob.
- O‘qituvchi: o‘z guruhining bilim xaritasi, muammolari, topshiriqlar, javoblar va baholash.
- Bilim bazasi: material yaratish, Gemini embedding orqali indekslash, pgvector RAG.
- AI yordamchi: faqat indekslangan va fakultetga ruxsatli manbalar, citations va persistent chat. Kalitsiz 503, mos manbasiz 422. Soxta AI javobi yo‘q.
- Ilmiy faoliyat: savol/usul/rahbar, bosqich, yakuniy natija va rahbar izohi.
- Portfolio: natijalar, xavfsiz http/https havolalar va yakunlangan tadqiqotlar.

## Environment

Foydalanuvchining yangi tanlovi: AI mahalliyda ishlaydi, ommaviy Vercel versiyasi AI kalitisiz joylashtiriladi. Vercel environmentda `AI_ENABLED=false` belgilanadi. Mahalliy `.env`dagi Gemini kaliti saqlanadi. Ro‘yxatdan o‘tish, diagnostika, bilim pasporti, o‘quv yo‘li va boshqa modullar haqiqiy Supabase bazasi bilan ishlaydi.

DATABASE_URL: runtime PostgreSQL ulanishi. DIRECT_URL: Prisma migratsiya ulanishi. Supabase runtime transaction pooler (6543), migratsiya session pooler (5432). APP_URL: bitta canonical origin; productionda https.
GEMINI_API_KEY: serverda maxfiy kalit. NEXT_PUBLIC_ prefiksi ishlatilmaydi.
GEMINI_MODEL: mavjud Gemini generation modeli. GEMINI_EMBEDDING_MODEL: embedding modeli, dimension 768. Model o‘zgarsa materiallar qayta indekslanadi.

## Testlar

npm run typecheck
npm run lint
npm test
npm run test:database-transfer
npm run test:registration (baza va app ishlayotgan bo‘lishi kerak)
npm run test:ai:live (faqat alohida local/test muhitida, real Gemini so‘rovlari va kvota ishlatadi)
npm run test:integration (baza va app ishlayotgan bo‘lishi kerak)
npm run test:e2e (baza, app va Microsoft Edge talab qilinadi)

Integration va browser testlar tasodifiy, alohida vaqtinchalik akkaunt/fakultet yaratadi va tozalaydi. Production DBda testlarni ishga tushirmang. Unit testlar server grading, buzilgan javob, xesh va scope chegaralarini tekshiradi.

## Production PostgreSQL va Vercel

Foydalanuvchi tanlovi: Supabase PostgreSQL + pgvector va Vercel. Alohida ZiyoLab Supabase loyihasi, pooler URLlar, RLS migratsiyasi va yozuvlarni ko‘chirish tartibi [docs/SUPABASE_VERCEL.md](docs/SUPABASE_VERCEL.md) da. Local URL Vercelda rad etiladi.
Production schema uchun npm run db:migrate . Akkaunt yaratish: NEW_USER_EMAIL, NEW_USER_NAME, NEW_USER_PASSWORD, NEW_USER_ROLE, NEW_USER_FACULTY environment orqali npm run user:create . Production seed avtomatik bajarilmaydi.
Vercelda loyiha Next.js sifatida, environment DATABASE_URL/DIRECT_URL/APP_URL/GEMINI_API_KEY/model nomlari bilan sozlanadi. vercel.json va CI workflow tayyor. Nom `ziyolab`, mo‘ljallangan team `adxam72s-projects`. Cloud amallari va ruxsat holati RELEASE_STATUS.md da; live deploy tasdiqlanmaguncha URL e’lon qilinmaydi. GitHub remote hali yo‘q.

## Chegaralar

Rasmiy universitet SSO va native Android MVPga kirmagan; SSO provayder ma’lumotlari talab qilinadi. Boshlang‘ich savol/materiallar pedagog tasdig‘iga muhtoj. AI live test Gemini kalitisiz bajarilmaydi. Mahalliy pilot hali 100–300 real talabada validatsiya qilinmagan. Xavfsizlik mexanizmlari testlangan, mustaqil security audit o‘rnini bosmaydi.
