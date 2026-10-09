import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Map,
  MessageCircle,
  FlaskConical,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Panel, EmptyState } from "@/components/page-parts";
export default async function Dashboard() {
  const u = await requireUser();
  if (u.role !== "STUDENT")
    return (
      <>
        <h1 className="mb-3 text-4xl font-bold">Xush kelibsiz!</h1>
        <p className="mb-8 text-muted-foreground">
          {u.name}, ta’lim va ilmiy faoliyatni boshqaring.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {u.role === "ADMIN" || u.role === "TEACHER" ? (
            <Panel title="O‘qituvchi paneli">
              <EmptyState icon={Users} title="Guruh rivojlanishini kuzating">
                <Button asChild>
                  <Link href="/oqituvchi">Panelni ochish</Link>
                </Button>
              </EmptyState>
            </Panel>
          ) : null}
          <Panel title="Ilmiy faoliyat">
            <EmptyState icon={FlaskConical} title="Ilmiy loyihalarni kuzating">
              <Button asChild>
                <Link href="/ilmiy-faoliyat">Loyihalarni ochish</Link>
              </Button>
            </EmptyState>
          </Panel>
          {u.role === "ADMIN" ? (
            <Panel title="Boshqaruv">
              <p className="mb-5 text-muted-foreground">
                Pilot akkauntlari va guruhlarni boshqaring.
              </p>
              <Button asChild>
                <Link href="/boshqaruv">Akkaunt yaratish</Link>
              </Button>
            </Panel>
          ) : null}
        </div>
      </>
    );
  const [scores, tasks, projects] = await Promise.all([
    db.skillScore.findMany({ where: { userId: u.id } }),
    db.learningTask.findMany({
      where: { userId: u.id },
      include: { skill: true },
    }),
    db.researchProject.findMany({
      where: { studentId: u.id },
      take: 3,
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return (
    <div className="flex flex-col gap-5">
      <div className="mb-1">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight md:text-[44px]">
          Xush kelibsiz!
        </h1>
        <p className="mt-1 text-lg leading-snug text-muted-foreground md:text-[21px]">
          Ilmdan natijaga — har bir qadam sizning rivojingiz uchun.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="flex flex-col justify-center rounded-xl bg-[#14213d] p-8 text-white md:min-h-[284px]">
          <h2 className="text-3xl leading-tight font-bold md:text-[36px]">
            Bilimingizdan boshlang.
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/75">
            Diagnostika orqali kuchli tomonlaringizni va rivojlanish
            yo‘nalishlarini aniqlang.
          </p>
          <Button variant="secondary" asChild className="mt-7 h-12 self-start">
            <Link href="/diagnostika">
              Diagnostikani boshlash
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </section>
        <Panel title="Bilim pasporti">
          {scores.length ? (
            <div className="flex flex-col gap-5 py-7">
              <p className="text-4xl font-bold">{scores.length} ko‘nikma</p>
              <p className="text-muted-foreground">
                {scores.filter((s) => s.percent < 80).length} yo‘nalishda
                rivojlanish imkoniyati bor.
              </p>
              <Button asChild variant="outline">
                <Link href="/bilim-pasporti">Pasportni ko‘rish</Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Hali baholanmagan"
              description="Ko‘nikmalaringiz diagnostikadan so‘ng ko‘rinadi."
            />
          )}
        </Panel>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="O‘quv yo‘lim">
          {tasks.length ? (
            <div className="flex flex-col gap-4 py-5">
              <p className="text-lg font-semibold">
                {tasks.filter((t) => t.done).length} / {tasks.length} vazifa
                bajarilgan
              </p>
              {tasks
                .filter((t) => !t.done)
                .slice(0, 2)
                .map((t) => (
                  <p key={t.id} className="text-muted-foreground">
                    {t.skill.name}
                  </p>
                ))}
              <Button asChild className="self-start">
                <Link href="/oquv-yolim">Rejani davom ettirish</Link>
              </Button>
            </div>
          ) : (
            <EmptyState icon={Map} title="Shaxsiy rejangizni shakllantiring.">
              <Button asChild>
                <Link href="/diagnostika">Diagnostikaga o‘tish</Link>
              </Button>
            </EmptyState>
          )}
        </Panel>
        <Panel title="AI yordamchi">
          <EmptyState
            icon={MessageCircle}
            title="Savolingizni birgalikda tahlil qilamiz."
          >
            <Button asChild>
              <Link href="/ai-yordamchi">Suhbatni boshlash</Link>
            </Button>
          </EmptyState>
        </Panel>
      </div>
      <Panel title="Ilmiy faoliyat">
        {projects.length ? (
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href="/ilmiy-faoliyat"
                className="border-b py-3 font-semibold text-primary"
              >
                {p.title}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FlaskConical}
            title="Birinchi ilmiy loyihangizni yarating."
          >
            <Button asChild>
              <Link href="/ilmiy-faoliyat">Loyiha yaratish</Link>
            </Button>
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}
