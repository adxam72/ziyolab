# Arxitektura

Modulli Next.js App Router monolit. Server komponentlari ma’lumot o‘qiydi, route handlers mutatsiyalarni bajaradi. Zod validatsiya, serverdagi auth/role/scope.

Browser -> Next.js -> Prisma node-postgres adapter -> PostgreSQL/pgvector.
AI: faculty scope -> Gemini query embedding -> parametrli cosine SQL -> manbalar -> generateContent -> DB chat history.

Local: diskka saqlanadigan PGlite PostgreSQL wire server 127.0.0.1:54329. Production: Supabase PostgreSQL va pgvector. Vercel runtime DATABASE_URL transaction pooler (6543), Prisma migratsiyalari DIRECT_URL session pooler (5432) orqali ishlaydi. Local baza fayllari Vercelga yuklanmaydi.

Auth: scrypt+salt, SHA256 token hash bazada, cookie 7 kun, logoutda revoke. Origin APP_URL bilan tekshiriladi. Talaba o‘z ma’lumotlari, teacher o‘z guruhlari, supervisor biriktirilgan loyihalar, admin fakultet doirasi. Javob kalitlari test tugaguncha serverda qoladi.

POST /api/auth/register: ism/email/parol/tasdiq validatsiyasi, origin va IP/email rate limit, server belgilagan fakultet, faqat STUDENT. User va Session bir tranzaksiyada yaratiladi. Unique email parallel dublikatni rad etadi; client rol, fakultet yoki guruh bera olmaydi. Guruhsiz talaba shaxsiy ta’lim modullaridan foydalanadi, guruhni administrator biriktiradi.

AI: faqat server GEMINI_API_KEY, environment model nomlari, manbali RAG, hujjat buyruqlari ishonchsiz data. Kalit bo‘lmasa 503, soxta javob yo‘q. Shaxsiy identifikatorlar promptga yuborilmaydi.

Vercel Node runtime, dynamic authenticated routes, buildda DB query yo‘q, migration release oldidan. Production DATABASE_URL, DIRECT_URL, APP_URL va Gemini konfiguratsiyasi kerak. 2026-10-08 foydalanuvchi Supabase va Vercel deployni so‘radi; cloud amallari natijasi RELEASE_STATUS.md da yoziladi.

Supabase public sxemasidagi 18 ilova jadvalida RLS yoqiladi va anon/authenticated/PUBLIC huquqlari bekor qilinadi. Brauzer Supabase Data APIga bevosita murojaat qilmaydi. Ishonchli server ulanishi jadval egasi yoki maxsus backend roli orqali ishlaydi; foydalanuvchi va fakultet ruxsati Next.js serverida tekshiriladi.

Manbalar: https://nextjs.org/docs/app , https://www.prisma.io/docs/orm , https://pglite.dev/docs/pglite-socket , https://pglite.dev/extensions/ , https://ai.google.dev/gemini-api/docs/embeddings , https://ai.google.dev/gemini-api/docs/text-generation , https://vercel.com/docs/deployments .
