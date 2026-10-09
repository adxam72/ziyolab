# ZiyoLab — ILMDAN NATIJAGA

2026-10-08 foydalanuvchi qarori: mahsulot nomi ZiyoLab. Supabase PostgreSQL va Vercel hosting tanlandi. Taqdimotdagi DTPI nomi institut va asl manba tarixi sifatida saqlanadi.

## Asosiy manba

2026-10-08 keyingi foydalanuvchi talabi: mustaqil ro‘yxatdan o‘tish. Texnik yechim: public forma faqat STUDENT rolini yaratadi; fakultet server konfiguratsiyasidan, guruh administrator tomonidan belgilanadi. Bu taqdimotdan olingan talab emas, foydalanuvchi qo‘shgan talab.

Startup.pptx, 2026-yil 5-oktabr, 16 slayd, barcha matnlar, jadvallar va SmartArt diagrammalari o‘rganildi. Muallif: Xolliyeva Ozoda Po‘lat qizi. Slayd 1 institut, keyingi slaydlar universitet atamasini ishlatadi. Rasmiy nom pilot oldidan tasdiqlanadi. Xom matn: docs/source/startup-text.txt.

## Taqdimotdan olingan talablar

| ID  | Talab                                                                                | Slayd     | Qabul mezoni                                                 |
| --- | ------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------ |
| R01 | AI, adaptiv ta’lim, diagnostika, analytics, tadqiqot yagona ekotizimda               | 2,6,12,14 | Bitta akkaunt va baza                                        |
| R02 | Shaxsiy bilim pasporti, muntazam diagnostika                                         | 5         | Ko‘nikma darajasi, tarix, baholanmagan holat                 |
| R03 | Diagnostika, xarita, individual ta’lim, xato tahlili, kompetensiya, tadqiqot, natija | 9         | Test pasport va rejani tranzaksiyada yangilaydi              |
| R04 | Talaba: material, topshiriq, AI, ilmiy loyiha, portfolio                             | 8         | O‘z yozuvlarini yaratish va bajarish                         |
| R05 | O‘qituvchi: guruh xaritasi, statistika, muammolar, topshiriq, monitoring             | 8         | Faqat biriktirilgan guruh, real statistika                   |
| R06 | Ilmiy rahbar: mavzular, loyihalar va bosqichlar                                      | 8         | Biriktirilgan loyihaga izoh va monitoring                    |
| R07 | Bir fakultet, 100–300 talaba pilot, so‘ng DTPI va boshqa OTMlar                      | 6,8,14    | Fakultet/guruh chegaralari                                   |
| R08 | Universitet rasmiy akkaunti orqali kirish                                            | 7         | SSO parametrlari ochiq masala                                |
| R09 | Web, Search, Google Play va Google integratsiyalari imkoniyati                       | 7,11      | Responsive web; native mobil va integratsiya keyingi bosqich |
| R10 | AI talabaning o‘zi fikrlashiga yordam beradi                                         | 15        | Manbali tushuntirish va yo‘naltiruvchi savollar              |
| R11 | Pilotni statistik va pedagogik validatsiya qilish                                    | 14        | Diagnostika tarixi saqlanadi; metodika tasdiqlanadi          |

Slayd 5: fonetik tahlil, morfologiya, sintaksis, punktuatsiya, akademik yozuv, tanqidiy fikrlash, ilmiy tadqiqot. Slayd 13: 6 oy uchun 37 mln so‘mlik taxminiy smeta, amaldagi narx emas. Slayd 10: full-stack, AI/ML, metodist, ilmiy maslahatchi, dizayner, kiberxavfsizlik va fan ekspertlari.

## Foydalanuvchi texnik talablari

Next.js + TypeScript, Tailwind + shadcn/ui, PostgreSQL + Prisma, Gemini, RAG + pgvector, xavfsiz auth, Vercelga mos deployment, o‘zbekcha UI. Kalit faqat server environmentda va Gitga kiritilmaydi.

## Texnik takliflar (asl taqdimot talabi emas)

- Taklif etiladigan pilot akkauntlari, yopiq provisioning; rasmiy SSO uchun provayder ma’lumotlari kerak.
- <50% rivojlantirish kerak, 50–79% o‘rta, >=80% yuqori. Pedagog tasdig‘i kerak.
- Boshlang‘ich ona tili/tadqiqot kontenti: 7 ko‘nikma, har biriga 3 savol. Fan ekspertizasi zarur.
- Kalit yo‘q bo‘lsa AI soxtalashtirilmaydi; deterministik diagnostika va reja ishlaydi.
- Fakultet materiallari RAGda 768 o‘lchamli embedding orqali izlanadi.
- Local: persistent PGlite PostgreSQL + pgvector, loopback. Production: tashqi PostgreSQL + pgvector.
- scrypt, xeshlangan opaque sessiya, HttpOnly/Secure/SameSite cookie, Origin va RBAC tekshiruvi, DB rate limit.

## MVP va keyingi bosqich

MVP: auth, pasport, diagnostika, xato tahlili, individual yo‘l, topshiriq/javob, monitoring, materiallar/RAG, AI tarixi, ilmiy loyiha/rahbar izohi, portfolio.
Keyingi bosqich: rasmiy SSO, Android/Google Play, Drive/Workspace, pilot ilmiy validatsiyasi, ko‘p OTM rollout.
Ochiq: pilot fakulteti, ekspert kontenti, SSO/domen, ma’lumot siyosati, Gemini kaliti, production DB, GitHub va Vercel target.
