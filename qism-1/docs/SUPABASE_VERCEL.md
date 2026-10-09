# ZiyoLab: Supabase va Vercel

2026-10-08 foydalanuvchi ZiyoLab nomi, Supabase bazasi va Vercel hostingni tanladi. Supabase tashkiloti: adxam72's Org (`uvdapnwemykfsqugdrnl`). Mavjud boshqa loyiha bu ilovaning bazasi sifatida ishlatilmaydi.

## Supabase tayyorlash

1. Tashkilotda alohida ZiyoLab loyihasini yarating; regionni Vercel funksiyasiga yaqin tanlang (masalan, Tokyo / hnd1). Dashboarddagi narxni tekshiring.
2. Connect panelidan transaction pooler URL (6543) va session pooler URL (5432) oling. Parolni URI formatida kodlang. TLS uchun `sslmode=require` qo‘shing.
3. `.env.supabase.local` fayliga `DATABASE_URL` va `DIRECT_URL` yozing. Fayl Gitdan chiqarilgan. Hech biri `NEXT_PUBLIC_` bo‘lmasin.
4. Cloud environment bilan `npm run db:migrate` bajaring. Bu 18 jadval, pgvector/HNSW indeks va RLSni yaratadi. Migratsiya uchun jadval egasi huquqli server ulanishi kerak. Browser uchun publishable key bu ulanish o‘rnini bosmaydi.
5. Mahalliy `.env`dagi `DATABASE_URL` manba bo‘lib qolgan holda `TARGET_DATABASE_URL`ni cloud session poolerga sozlab `npm run db:transfer` bajaring. Skript bo‘sh maqsad bazani talab qiladi; yozuvlar bitta tranzaksiyada ko‘chiriladi. Session va rate-limit yozuvlari ko‘chirilmaydi. Parol xeshlari saqlanadi, foydalanuvchilar qayta kiradi.
6. Supabase’da jadvallar soni, ko‘chirilgan yozuvlar, RLS va public API rollari huquqlarini tekshiring. Ilova to‘g‘ridan-to‘g‘ri Prisma ishlatadi, Supabase Authga migratsiya qilinmaydi. Data APIni o‘chirish mumkin.

## Vercel

Joriy foydalanuvchi talabi: hostingda `AI_ENABLED=false`, `GEMINI_API_KEY` yuborilmaydi. Mahalliy Gemini ishlashi saqlanadi. `.vercelignore` lokal secretlar, baza va cache fayllarini CLI deploydan ham chiqaradi.

Public ro‘yxatdan o‘tish uchun `REGISTRATION_FACULTY_ID` mavjud, ro‘yxatdan o‘tishga mo‘ljallangan fakultet IDsi bo‘lsin. Default `pilot-faculty`; ko‘chirishdan keyin shu fakultet saqlanadi. Foydalanuvchiga fakultet yoki guruhlar ro‘yxati berilmaydi; guruhni administrator biriktiradi.

Yangi loyiha nomi `ziyolab`, framework Next.js, install `npm ci`, build `npm run build`. Mo‘ljallangan team: `adxam72s-projects` (`team_h24y9YDIfeASpF38pBGeTtai`). Boshqa mavjud loyihalarni ishlatmang.

Hosting environment: `DATABASE_URL`, `DIRECT_URL`, `APP_URL`, `AI_ENABLED=false` va `REGISTRATION_FACULTY_ID=pilot-faculty`. Database URLlar encrypted/sensitive secret sifatida saqlansin. `GEMINI_API_KEY` faqat mahalliy `.env`da qoladi. `APP_URL` haqiqiy HTTPS production domeniga mos bo‘lsin; mutatsiyalar boshqa originni rad etadi. Preview test uchun preview originini sozlang.

Migratsiya build ichida avtomatik bajarilmaydi. Bazani oldindan tayyorlang, deployni tekshiring, keyin production domenida `/api/health`, `/kirish`, login/logout, diagnostika va fakultet ruxsatlarini tekshiring. `.data`, `.env*`, mahalliy baza va kirish paroli deployga yuborilmaydi.

## Tekshiruvlar

`npm run test:database-transfer` alohida vaqtinchalik PostgreSQL bazalarida JSON, FK sikli, parol xeshi, session reset, RLS va bo‘sh bo‘lmagan bazani himoyalashni tekshiradi. `npm run test:integration`ni real production ma’lumotlar bazasida bajarmang.

Rasmiy ko‘rsatma: [Supabase Prisma ulanishi](https://supabase.com/docs/guides/database/prisma), [Vercel deployments](https://vercel.com/docs/deployments).
