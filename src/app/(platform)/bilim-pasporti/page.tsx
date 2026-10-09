import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { level } from "@/lib/education";
import { PageTitle, Panel } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
export default async function Passport() {
  const u = await requireUser();
  if (u.role !== "STUDENT") redirect("/bosh-sahifa");
  const [skills, history] = await Promise.all([
    db.skill.findMany({
      orderBy: { order: "asc" },
      include: { scores: { where: { userId: u.id } } },
    }),
    db.assessment.findMany({
      where: { userId: u.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
  ]);
  return (
    <>
      <PageTitle
        title="Bilim pasporti"
        description="Kuchli tomonlaringiz va rivojlanish yo‘nalishlaringiz. Natijalar diagnostika asosida yangilanadi."
      />
      <Panel
        title={u.name}
        description={u.group?.name ?? "Guruhga hali biriktirilmagan"}
      >
        <div className="flex flex-col">
          {skills.map((s) => {
            const score = s.scores[0];
            return (
              <div
                key={s.id}
                className="grid items-center gap-3 border-b py-5 md:grid-cols-[1fr_180px_190px]"
              >
                <span className="font-semibold">{s.name}</span>
                {score ? (
                  <div className="flex items-center gap-3">
                    <Progress value={score.percent} aria-label={s.name} />
                    <span className="text-sm">{score.percent}%</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Hali baholanmagan
                  </span>
                )}
                <Badge
                  variant={
                    score && score.percent < 50 ? "destructive" : "secondary"
                  }
                  className="justify-self-start"
                >
                  {level(score?.percent ?? null)}
                </Badge>
              </div>
            );
          })}
        </div>
      </Panel>
      <section className="mt-6">
        <Panel title="Diagnostika tarixi">
          {history.length ? (
            history.map((h) => (
              <p key={h.id} className="border-b py-3 text-sm">
                {h.completedAt?.toLocaleString("uz-UZ", {
                  timeZone: "Asia/Tashkent",
                })}{" "}
                — yakunlangan
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">
              Hali diagnostika o‘tkazilmagan.
            </p>
          )}
        </Panel>
      </section>
    </>
  );
}
