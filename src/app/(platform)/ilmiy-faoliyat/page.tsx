import { FlaskConical } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectScope, stages } from "@/lib/research";
import { PageTitle, Panel, EmptyState } from "@/components/page-parts";
import { ActionForm } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
export default async function Page() {
  const u = await requireUser();
  const [projects, supervisors] = await Promise.all([
    db.researchProject.findMany({
      where: projectScope(u),
      include: {
        student: { select: { name: true } },
        supervisor: { select: { name: true } },
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.user.findMany({
      where: { facultyId: u.facultyId, role: "SUPERVISOR" },
      select: { id: true, name: true },
    }),
  ]);
  return (
    <>
      <PageTitle
        title="Ilmiy faoliyat"
        description="Muammodan ilmiy savolga, izlanishdan amaliy natijaga."
      />
      <div className="flex flex-col gap-6">
        {u.role === "STUDENT" ? (
          <Panel title="Yangi ilmiy loyiha">
            <ActionForm
              endpoint="/api/research"
              button="Loyiha yaratish"
              fields={[
                { name: "title", label: "Loyiha nomi", minLength: 5 },
                {
                  name: "question",
                  label: "Ilmiy savol",
                  type: "textarea",
                  minLength: 10,
                  maxLength: 2000,
                },
                {
                  name: "method",
                  label: "Tadqiqot usuli",
                  type: "textarea",
                  minLength: 10,
                  maxLength: 3000,
                },
                {
                  name: "supervisorId",
                  label: "Ilmiy rahbar",
                  required: false,
                  options: [
                    { value: "", label: "Hali tanlanmagan" },
                    ...supervisors.map((s) => ({ value: s.id, label: s.name })),
                  ],
                },
              ]}
            />
          </Panel>
        ) : null}
        {projects.length ? (
          projects.map((p) => (
            <Panel
              key={p.id}
              title={p.title}
              description={
                p.student.name +
                " · Rahbar: " +
                (p.supervisor?.name ?? "Biriktirilmagan")
              }
            >
              <Badge variant="secondary">
                {stages[p.stage as keyof typeof stages]}
              </Badge>
              <dl className="mt-5 grid gap-3">
                <dt className="font-semibold">Ilmiy savol</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">
                  {p.question}
                </dd>
                <dt className="font-semibold">Tadqiqot usuli</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">
                  {p.method}
                </dd>
              </dl>
              <div className="mt-6">
                <ActionForm
                  endpoint="/api/research"
                  method="PATCH"
                  extra={{ id: p.id }}
                  button="Bosqichni yangilash"
                  fields={[
                    {
                      name: "stage",
                      label: "Tadqiqot bosqichi",
                      defaultValue: p.stage,
                      options: Object.entries(stages).map(([value, label]) => ({
                        value,
                        label,
                      })),
                    },
                    {
                      name: "outcome",
                      label: "Natija va kuzatuvlar",
                      type: "textarea",
                      required: false,
                      defaultValue: p.outcome,
                      maxLength: 5000,
                    },
                  ]}
                />
              </div>
              <section className="mt-7 border-t pt-5">
                <h3 className="mb-4 font-semibold">Rahbar fikrlari</h3>
                {p.comments.length ? (
                  p.comments.map((c) => (
                    <div key={c.id} className="mb-3 border-b pb-3">
                      <p className="text-sm font-semibold">{c.author.name}</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        {c.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="mb-4 text-sm text-muted-foreground">
                    Hali izoh yo‘q.
                  </p>
                )}
                {u.role === "SUPERVISOR" || u.role === "ADMIN" ? (
                  <ActionForm
                    endpoint="/api/research/comments"
                    extra={{ projectId: p.id }}
                    button="Fikr bildirish"
                    fields={[
                      {
                        name: "content",
                        label: "Tavsiya va fikringiz",
                        type: "textarea",
                        minLength: 3,
                        maxLength: 3000,
                      },
                    ]}
                  />
                ) : null}
              </section>
            </Panel>
          ))
        ) : (
          <EmptyState
            icon={FlaskConical}
            title="Hali ilmiy loyiha yo‘q"
            description="Talaba loyihasi yaratilgach, bu yerda tadqiqot bosqichlari ko‘rinadi."
          />
        )}
      </div>
    </>
  );
}
