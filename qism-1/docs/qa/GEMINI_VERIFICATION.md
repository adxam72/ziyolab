# Gemini ulanishi — 2026-10-08

Kalit faqat lokal .env ichida. Models API HTTP 200 qaytardi; kalit qiymati log, kod yoki hujjatga yozilmadi.

Provider sinovi: avvalgi gemini-2.5-flash generateContent 404, gemini-3.8-flash 503 qaytardi. gemini-3.5-flash-lite haqiqiy o‘zbekcha javob bilan 200 qaytardi; generation modeli shunga yangilandi. gemini-embedding-001 embedContent 200 va 768 o‘lchamli vektor qaytardi.

Haqiqiy ilova librarysi orqali 7 boshlang‘ich o‘quv materialining 7 bo‘lagi indekslandi. Boshqa fakultet bilan qidirish 422, pilot fakultetdagi akademik yozuv savoli manbali o‘zbekcha javob qaytardi. Savol va javob ChatMessagega yozilganligi tekshirildi; vaqtinchalik sinov akkaunti va suhbat yozuvlari tozalandi. Indekslar ilovada foydalanish uchun qoldi.

Agent muhitidagi spawn EPERM va eski server huquqi sabab foydalanuvchi RESTART.ps1 orqali build/serverni qayta ishga tushirdi. Shundan keyin 16 jonli HTTP tekshiruvi o‘tdi: administrator indekslashi 200, talaba indekslashiga 403, boshqa fakultet qidiruviga 422, haqiqiy RAG javobiga 200. Manbalar ruxsatli bazadagi materiallardan ekanligi, savol/javob saqlanishi va AI sahifasida suhbat ko‘rinishi tekshirildi. Vaqtinchalik foydalanuvchilar va sinov suhbatlari tozalandi; 7 materialning indekslari saqlandi.

Takroriy jonli tekshiruv: npm run test:ai:live. Bu real API kvotasi ishlatadi; CIga avtomatik qo‘shilmagan. Testlar vaqtinchalik foydalanuvchilar bilan indekslash, ruxsat chegarasi, pgvector qidiruv, citations, chat saqlanishi va AI sahifasini tekshiradi.

Rasmiy hujjatlar: [Gemini embeddings](https://ai.google.dev/gemini-api/docs/embeddings), [text generation](https://ai.google.dev/gemini-api/docs/text-generation).
