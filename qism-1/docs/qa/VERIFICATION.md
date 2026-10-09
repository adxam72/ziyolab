# Yakuniy tekshiruv

2026-10-08, Asia/Tashkent. Mahalliy URL http://localhost:3000/kirish . Production next start, diskdagi PostgreSQL/PGlite + pgvector.

## Natijalar

| Tekshiruv                      | Natija                 |
| ------------------------------ | ---------------------- |
| TypeScript strict              | PASS                   |
| ESLint                         | PASS, ogohlantirishsiz |
| Unit                           | PASS, 18 test          |
| Integration: HTTP + PostgreSQL | PASS, 45 tekshiruv     |
| Playwright Edge                | PASS, 2 to‘liq oqim    |
| Production build               | PASS                   |
| Migration va seed              | PASS                   |
| Environment/DB Git exclusions  | PASS                   |

Integration: login/logout, HttpOnly/SameSite, session expiry/revocation, Origin, RBAC, resource ownership, 21 server savoli va yashirilgan javob kaliti, noto‘liq javoblar, idempotent grading, pasport/reja persistence, boshqa guruhdan submission rad etish, baholangan submissionni qulflash, supervisor scope, outcome talabi, portfolio URL, unconfigured AI 503. pgvector haqiqiy cosine SQL testi vaqtinchalik sintetik test vektori bilan bajarildi; bu Gemini live embedding testi emas.

## Browser QA

Browser skill o‘qildi va callable tool katalogi tekshirildi. Uning talab qiladigan JavaScript browser boshqaruv vositasi sessiyada mavjud emas; Playwright Microsoft Edge fallback ishlatildi.
Viewportlar: konsepsiya native 1505x1045 desktop va 390x844 mobile. Skrinshotlar page.screenshot(fullPage:true) bilan olindi.
Identity, meaningful content, framework error overlay yo‘qligi, student oqimida pageerror yo‘qligi va mobil horizontal overflow yo‘qligi tekshirildi.
Oqim 1: kirish -> desktop -> mobile menyu -> pasport -> 21 savol -> natija/DB -> progress -> ilmiy loyiha/rahbar tanlash -> portfolio -> AI sahifasi -> logout.
Oqim 2: teacher -> guruh/topshiriq -> student javobi -> teacher 92/100 baholash -> student bahoni ko‘rish -> supervisor -> ilmiy loyiha izohi.

## Vizual solishtirish

2026-10-08: ilova ZiyoLab deb qayta nomlangan. Quyidagi ImageGen konsepsiyasi dastlabki DTPI brendiga tegishli tarixiy dizayn manbasi; yangi browser screenshotlari ZiyoLab interfeysini ko‘rsatadi. RLS bilan 45 integratsion test va alohida JSON/FK/vector ko‘chirish sinovi qayta o‘tkazildi.

Konsepsiya docs/design/student-dashboard.png (built-in ImageGen), final docs/qa/dashboard-desktop.png va dashboard-mobile.png. Konsepsiya va yakuniy screenshotlar view_image(original) orqali ko‘rildi.

| Nuqta              | Konsepsiya/render dalili                                                       | Natija                                                               |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Matn va nav        | 7 Uzbek menu, sarlavha, CTA va bo‘sh holatlar                                  | Asosiy above-the-fold copy diff: qo‘shilgan yoki yo‘qolgan matn yo‘q |
| Joylashuv          | 296px sidebar, navy welcome + passport, two-column education/AI, wide research | Saqlandi; mobil bir ustunga o‘tadi                                   |
| Tipografiya        | Katta sarlavha, 24px panel title, 20px empty title, 16px controls              | Dastlabki juda kichik matn va ortiqcha line-height tuzatildi         |
| Rang va yuzalar    | Oq panellar, #f7f9fc fon, navy, cobalt, thin border                            | Issiq rang yoki dekorativ overlay qo‘shilmadi                        |
| Panel geometriyasi | 12px radius, 20px gap, min284px welcome                                        | Dastlabki ortiqcha 340px panel va nested padding tuzatildi           |
| Ikonlar            | Bir xil outline oilasi, book/file/map/chat/flask/folder                        | Lucide outline; raster UI ishlatilmaydi                              |
| Mobile             | 390px ekran, menyu, readable controls                                          | Overflow yo‘q, menyu va navigatsiya testlangan                       |

Ongli farqlar: konsepsiyadagi dekorativ notification/avatar menyusi o‘rniga real foydalanuvchi ismi va logout sidebar footerda. Brend belgisi Lucide BookOpen outline, konsepsiya solid book. Real score/progress mavjud bo‘lganda bo‘sh holat o‘rniga DB holati. Pastki research panel responsive kontentga mos avtomatik balandlikda. Interfeys konsepsiyasi shu qayd etilgan amaliy farqlar bilan tekshirildi; piksel darajasida bir xil deb da’vo qilinmaydi. Qirqilish, xato overlay yoki bajarilmaydigan asosiy amal qolmagan.

## Tuzatilgan xatolar

Local socket maxConnections=1 app va test ulanishlarini uzgan; 20 ga oshirildi. Xotira bosimi sabab build alohida, cpu=1 va webpack worker o‘chirilgan holda bajarildi. Shadcn noto‘g‘ri cn importlari repo helperga almashtirildi. Form IDs useId bilan noyob. datetime-local ISOga aylantiriladi. Portfolio bo‘sh/invalid URL TypeError tuzatildi va 7 regression test qo‘shildi.

## Tasdiqlanmagan tashqi oqimlar

2026-10-08 ro‘yxatdan o‘tish QA: kirish havolasi -> mobile/desktop forma -> parol mos kelmasligi xabari -> haqiqiy student yozuvi va session -> dashboard -> logout -> qayta login. 18 yangi API tekshiruvi va 3 brauzer testi o‘tdi; pageerror va mobile overflow kuzatilmadi. Dalillar registration-desktop.png va registration-mobile.png. Browser plugin uchun zarur callable JS runtime ushbu sessiyada yo‘q; mavjud Edge/Playwright test infratuzilmasi bilan tekshirildi. Ruxsatni oshirish, boshqa fakultet yuborish va parallel takroriy email sinovlari rad etildi. Vaqtinchalik test akkauntlari tozalandi.

Gemini generation/embedding va RAG 2026-10-08 lokal kalit bilan tekshirildi: 7 material, 768 o‘lchamli vektorlar, manbali javob va chat persistence. Server qayta ishga tushirilgach 16 jonli HTTP tekshiruvi, jumladan AI sahifasida saqlangan suhbat ko‘rinishi o‘tdi; tafsilot GEMINI_VERIFICATION.md da. Production tashqi PostgreSQL/Vercel runtime hali ishga tushirilmagan. Rasmiy universitet SSO sozlanmagan. 100–300 real talabada pedagogik pilot validatsiyasi o‘tkazilmagan.
