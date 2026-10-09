import "dotenv/config";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
const curriculum = [
  {
    id: "phonetics",
    name: "Fonetik tahlil",
    content:
      "Fonetik tahlilda so‘zning tovush tarkibi, bo‘g‘inlari va urg‘usi o‘rganiladi. Tovush nutqning eshitiladigan birligi, harf esa yozuv belgisi. Unli tovushlar bo‘g‘in hosil qiladi. Masalan, kitob so‘zi ki-tob tarzida ikki bo‘g‘inga bo‘linadi. Tahlilda harf soni va tovush sonini alohida hisoblang.",
    questions: [
      [
        "Fonetik tahlilda nima o‘rganiladi?",
        ["Tovush tarkibi", "Gap bo‘laklari", "Matn mazmuni"],
        0,
        "Fonetika tovushlar va ularning xususiyatlarini o‘rganadi.",
      ],
      [
        "Kitob so‘zi necha bo‘g‘inli?",
        ["Bir", "Ikki", "Uch"],
        1,
        "Ki-tob: ikki unli ikki bo‘g‘in hosil qiladi.",
      ],
      [
        "Bo‘g‘in hosil qiladigan tovush qaysi?",
        ["Undosh", "Unli", "Tinish belgisi"],
        1,
        "Unli tovush bo‘g‘inning markazini tashkil qiladi.",
      ],
    ],
  },
  {
    id: "morphology",
    name: "Morfologiya",
    content:
      "Morfologiya so‘z turkumlari va so‘z shakllarini o‘rganadi. Ot shaxs yoki narsa nomini bildiradi; fe’l harakat va holatni, sifat belgini bildiradi. Kitoblar so‘zidagi -lar ko‘plik qo‘shimchasidir. So‘z turkumini aniqlashda uning ma’nosi va gapdagi vazifasiga qarang.",
    questions: [
      [
        "Harakatni bildiradigan so‘z turkumi?",
        ["Ot", "Fe’l", "Sifat"],
        1,
        "Fe’l harakat yoki holatni bildiradi.",
      ],
      [
        "Kitoblar so‘zidagi -lar nimani bildiradi?",
        ["Ko‘plik", "Egalik", "Zamon"],
        0,
        "-lar ko‘plik ma’nosini ifodalaydi.",
      ],
      [
        "Sifatning asosiy ma’nosi qaysi?",
        ["Predmet belgisi", "Harakat", "Shaxs nomi"],
        0,
        "Sifat predmetning belgisini bildiradi.",
      ],
    ],
  },
  {
    id: "syntax",
    name: "Sintaksis",
    content:
      "Sintaksis so‘z birikmalari va gap tuzilishini o‘rganadi. Ega gapdagi harakat bajaruvchisini bildirishi mumkin. Kesim ega haqida xabar beradi. Talaba kitob o‘qidi gapida Talaba ega, o‘qidi kesim. Gap bo‘laklarini aniqlashda so‘zlarning o‘zaro aloqasini tekshiring.",
    questions: [
      [
        "Sintaksis nimani o‘rganadi?",
        ["Tovush", "Gap tuzilishi", "So‘z imlosi"],
        1,
        "Sintaksis gap va so‘z birikmalarini o‘rganadi.",
      ],
      [
        "Talaba kitob o‘qidi gapida ega qaysi?",
        ["Talaba", "Kitob", "O‘qidi"],
        0,
        "Talaba harakatni bajaruvchi bo‘lib kelgan.",
      ],
      [
        "Mazkur gapda kesim qaysi?",
        ["Talaba", "Kitob", "O‘qidi"],
        2,
        "O‘qidi ega haqida xabar bildiradi.",
      ],
    ],
  },
  {
    id: "punctuation",
    name: "Punktuatsiya",
    content:
      "Punktuatsiya yozma nutqda tinish belgilaridan foydalanishni o‘rganadi. Darak gap odatda nuqta bilan, so‘roq gap so‘roq belgisi bilan yakunlanadi. Sanashda bog‘lovchisiz uyushiq bo‘laklar orasiga vergul qo‘yiladi: Bog‘da olma, nok, shaftoli bor. Tinish belgisi gapning mazmuniga va tuzilishiga bog‘liq.",
    questions: [
      [
        "So‘roq gap oxiriga qaysi belgi qo‘yiladi?",
        ["Nuqta", "So‘roq belgisi", "Vergul"],
        1,
        "So‘roq mazmuni so‘roq belgisi bilan ifodalanadi.",
      ],
      [
        "Bog‘da olma, nok, shaftoli bor gapida vergul sababi?",
        ["Sanash", "Gap yakuni", "Ko‘chirma gap"],
        0,
        "Uyushiq bo‘laklar bog‘lovchisiz sanalmoqda.",
      ],
      [
        "Punktuatsiya nimaga tegishli?",
        ["Tinish belgilariga", "Faqat tovushlarga", "So‘z turkumiga"],
        0,
        "Punktuatsiya tinish belgilarining qo‘llanishini o‘rganadi.",
      ],
    ],
  },
  {
    id: "writing",
    name: "Akademik yozuv",
    content:
      "Akademik yozuv aniq savol, dalil, tahlil va xulosaga tayanadi. Boshqa muallif fikri ishlatilganda manba ko‘rsatiladi. Xulosa dalillardan kelib chiqishi kerak. Tadqiqot matnida shaxsiy taxminni tekshirilgan fakt sifatida bermang. Masalan, kuzatuv natijasini taqdim etib, uning cheklovlarini tushuntiring.",
    questions: [
      [
        "Boshqa muallif fikri ishlatilsa nima kerak?",
        ["Manba ko‘rsatish", "Ismni yashirish", "O‘zgartirmay ko‘chirish"],
        0,
        "Manba ko‘rsatish akademik halollikning asosidir.",
      ],
      [
        "Akademik xulosa nimaga tayanadi?",
        ["Dalil va tahlil", "Faqat taxmin", "Faqat his-tuyg‘u"],
        0,
        "Xulosa tadqiqot dalillari bilan asoslanadi.",
      ],
      [
        "Tekshirilmagan taxmin qanday yoziladi?",
        ["Fakt sifatida", "Taxmin ekani ochiq", "Mutlaq haqiqat"],
        1,
        "Taxmin va tekshirilgan fakt alohida ko‘rsatiladi.",
      ],
    ],
  },
  {
    id: "critical",
    name: "Tanqidiy fikrlash",
    content:
      "Tanqidiy fikrlash da’voni dalil bilan tekshirish, manba ishonchliligini baholash va muqobil izohlarni ko‘rib chiqishni anglatadi. Korrelyatsiya sababiyatni avtomatik isbotlamaydi. Ishonchli tahlil tadqiqot usuli, tanlanma va cheklovlarni tekshiradi. Savol bering: bu xulosani qaysi dalil qo‘llaydi?",
    questions: [
      [
        "Da’voni tekshirishda birinchi nima kerak?",
        ["Dalil", "Mashhurlik", "Taxmin"],
        0,
        "Dalil da’voni baholashga imkon beradi.",
      ],
      [
        "Korrelyatsiya har doim sababiyatmi?",
        ["Ha", "Yo‘q", "Faqat katta sonlarda"],
        1,
        "Bog‘liqlik sababni o‘z-o‘zidan isbotlamaydi.",
      ],
      [
        "Manbani baholashda nima muhim?",
        ["Usul va cheklovlar", "Faqat dizayn", "Faqat ko‘rishlar soni"],
        0,
        "Metod va cheklovlar xulosaning ishonchliligini ko‘rsatadi.",
      ],
    ],
  },
  {
    id: "research",
    name: "Ilmiy tadqiqot",
    content:
      "Ilmiy tadqiqot muammo va tekshiriladigan savoldan boshlanadi. Metod savolga mos tanlanadi: kuzatish, so‘rov, tajriba yoki matn tahlili. Ma’lumotlar yig‘ilgach tahlil qilinadi va dalillarga mos xulosa chiqariladi. Ishtirokchilarning roziligi va shaxsiy ma’lumotlarni himoya qilish zarur. Natijada savolga javob va tadqiqot cheklovlari ko‘rsatiladi.",
    questions: [
      [
        "Tadqiqot nimadan boshlanadi?",
        ["Muammo va savoldan", "Faqat xulosadan", "Faqat grafikdan"],
        0,
        "Aniq muammo va savol metodni yo‘naltiradi.",
      ],
      [
        "Metod nimaga mos bo‘lishi kerak?",
        ["Tadqiqot savoliga", "Faqat arzonlikka", "Faqat moda yo‘nalishga"],
        0,
        "Metod savolga javob berishi kerak.",
      ],
      [
        "Ishtirokchilar ma’lumotida nima zarur?",
        ["Rozilik va himoya", "Ochiq parol", "Ruxsatsiz e’lon"],
        0,
        "Rozilik va maxfiylik tadqiqot etikasining asosidir.",
      ],
    ],
  },
];
async function main() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error(
      "Seed is local only; production accounts must be explicitly provisioned.",
    );
  await db.faculty.upsert({
    where: { id: "pilot-faculty" },
    create: { id: "pilot-faculty", name: "Pilot fakulteti" },
    update: {},
  });
  await db.group.upsert({
    where: { id: "pilot-group" },
    create: {
      id: "pilot-group",
      name: "Pilot guruh",
      facultyId: "pilot-faculty",
    },
    update: {},
  });
  let admin = await db.user.findUnique({
    where: { email: "admin@dtpi.local" },
  });
  if (!admin) {
    const password = randomBytes(18).toString("base64url");
    admin = await db.user.create({
      data: {
        email: "admin@dtpi.local",
        name: "Platforma administratori",
        role: "ADMIN",
        facultyId: "pilot-faculty",
        passwordHash: await hashPassword(password),
      },
    });
    mkdirSync(".data", { recursive: true });
    writeFileSync(
      ".data/access.txt",
      "Mahalliy administrator\nEmail: admin@dtpi.local\nParol: " +
        password +
        "\nURL: http://localhost:3000/kirish\nBu fayl Gitga kiritilmaydi.",
    );
  }
  for (const [i, s] of curriculum.entries()) {
    await db.skill.upsert({
      where: { id: s.id },
      create: { id: s.id, name: s.name, order: i },
      update: { name: s.name, order: i },
    });
    for (const [j, q] of s.questions.entries()) {
      const [prompt, options, correctIndex, explanation] = q;
      await db.question.upsert({
        where: { id: s.id + "-" + j },
        create: {
          id: s.id + "-" + j,
          skillId: s.id,
          prompt: prompt as string,
          options: options as string[],
          correctIndex: correctIndex as number,
          explanation: explanation as string,
        },
        update: {},
      });
    }
    await db.material.upsert({
      where: { id: "material-" + s.id },
      create: {
        id: "material-" + s.id,
        facultyId: "pilot-faculty",
        skillId: s.id,
        authorId: admin.id,
        title: s.name + " asoslari",
        content: s.content,
      },
      update: {},
    });
  }
  console.log(
    "7 ko‘nikma, 21 savol, 7 boshlang‘ich material. Admin kirishi .data/access.txt da. Demo talaba yoki soxta natija yaratilmagan.",
  );
}
main()
  .catch(() => {
    console.error("Seed bajarilmadi. DB ulanishini tekshiring.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
