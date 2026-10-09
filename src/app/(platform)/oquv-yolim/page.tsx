import Link from "next/link";
import { redirect } from "next/navigation";
import { Map } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTitle, Panel, EmptyState } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { MutationButton, ActionForm } from "@/components/action-form";
export default async function Page() {
  const u = await requireUser();
  if (u.role !== "STUDENT") redirect("/bosh-sahifa");
  const [tasks, assignments] = await Promise.all([
    db.learningTask.findMany({
      where: { userId: u.id },
      include: { skill: true, material: true },
      orderBy: { skill: { order: "asc" } },
    }),
    db.assignment.findMany({
      where: { groupId: u.groupId ?? "none" },
      include: { submissions: { where: { userId: u.id } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <>
      <PageTitle
        title="O‘quv yo‘lim"
        description="Diagnostika natijasiga mos materiallar va o‘qituvchi topshiriqlari."
      />
      <div className="flex flex-col gap-5">
        {tasks.length ? (
          tasks.map((t) => (
            <Panel
              key={t.id}
              title={t.skill.name}
              description={t.recommendation}
            >
              <p className="mb-5 leading-relaxed text-muted-foreground">
                {t.material?.content ??
                  "Bu ko‘nikma uchun material hali kiritilmagan."}
              </p>
              <MutationButton
                endpoint="/api/tasks"
                body={{ id: t.id, done: !t.done }}
              >
                {t.done ? "Bajarildi — qayta ochish" : "O‘rganib bo‘ldim"}
              </MutationButton>
            </Panel>
          ))
        ) : (
          <Panel title="Shaxsiy reja">
            <EmptyState icon={Map} title="Avval diagnostikadan o‘ting">
              <Button asChild>
                <Link href="/diagnostika">Diagnostikaga o‘tish</Link>
              </Button>
            </EmptyState>
          </Panel>
        )}
        <h2 className="mt-5 text-2xl font-bold">Topshiriqlar</h2>
        {assignments.length ? (
          assignments.map((a) => {
            const s = a.submissions[0];
            return (
              <Panel
                key={a.id}
                title={a.title}
                description={
                  a.dueAt
                    ? "Muddat: " +
                      a.dueAt.toLocaleString("uz-UZ", {
                        timeZone: "Asia/Tashkent",
                      })
                    : "Muddat belgilanmagan"
                }
              >
                <p className="mb-5 whitespace-pre-wrap text-muted-foreground">
                  {a.description}
                </p>
                {s?.grade !== null && s ? (
                  <>
                    <p className="font-semibold">Baho: {s.grade}/100</p>
                    <p className="mt-2">{s.feedback}</p>
                  </>
                ) : (
                  <ActionForm
                    endpoint="/api/submissions"
                    extra={{ assignmentId: a.id }}
                    fields={[
                      {
                        name: "content",
                        label: "Javobingiz",
                        type: "textarea",
                        minLength: 10,
                        maxLength: 10000,
                        defaultValue: s?.content,
                      },
                    ]}
                    button={s ? "Javobni yangilash" : "Javobni yuborish"}
                  />
                )}
              </Panel>
            );
          })
        ) : (
          <p className="text-muted-foreground">
            Guruhingizga hali topshiriq berilmagan.
          </p>
        )}
      </div>
    </>
  );
}
