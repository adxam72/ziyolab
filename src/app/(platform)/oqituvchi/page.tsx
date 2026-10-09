import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTitle, Panel } from "@/components/page-parts";
import { ActionForm } from "@/components/action-form";
import { level } from "@/lib/education";
export default async function Page() {
  const u = await requireUser();
  if (!["TEACHER", "ADMIN"].includes(u.role)) redirect("/bosh-sahifa");
  const groups = await db.group.findMany({
    where: {
      facultyId: u.facultyId,
      ...(u.role === "TEACHER" ? { teacherId: u.id } : {}),
    },
    include: {
      students: {
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          scores: { include: { skill: true } },
          assessments: { where: { status: "COMPLETED" }, select: { id: true } },
        },
      },
      assignments: {
        include: {
          submissions: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return (
    <>
      <PageTitle
        title="O‘qituvchi paneli"
        description="Guruh bilim xaritasi, ko‘nikmalardagi bo‘shliqlar va topshiriqlar monitoringi."
      />
      <div className="flex flex-col gap-6">
        {groups.length ? (
          groups.map((g) => (
            <section key={g.id} className="flex flex-col gap-5">
              <Panel
                title={g.name}
                description={
                  g.students.length +
                  " talaba · " +
                  g.students.filter((s) => s.assessments.length).length +
                  " talaba diagnostikadan o‘tgan"
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3">Talaba</th>
                        <th className="p-3">Bilim xaritasi</th>
                        <th className="p-3">Bilimdagi bo‘shliq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.students.map((s) => (
                        <tr key={s.id} className="border-b">
                          <td className="p-3 font-semibold">{s.name}</td>
                          <td className="p-3">
                            {s.scores.length ? (
                              <div className="flex flex-col gap-1">
                                {s.scores.map((v) => (
                                  <span key={v.id}>
                                    {v.skill.name}: {v.percent}% (
                                    {level(v.percent)})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              "Hali baholanmagan"
                            )}
                          </td>
                          <td className="p-3">
                            {s.scores.length
                              ? s.scores
                                  .filter((v) => v.percent < 80)
                                  .map((v) => v.skill.name)
                                  .join(", ") || "Bo‘shliq aniqlanmadi"
                              : "Diagnostika kerak"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!g.students.length ? (
                  <p className="py-6 text-muted-foreground">
                    Guruhga hali talaba biriktirilmagan.
                  </p>
                ) : null}
              </Panel>
              <Panel title="Guruhga topshiriq berish">
                <ActionForm
                  endpoint="/api/assignments"
                  extra={{ groupId: g.id }}
                  fields={[
                    { name: "title", label: "Topshiriq nomi", minLength: 3 },
                    {
                      name: "description",
                      label: "Topshiriq sharti",
                      type: "textarea",
                      minLength: 10,
                      maxLength: 5000,
                    },
                    {
                      name: "dueAt",
                      label: "Topshirish muddati (ixtiyoriy)",
                      type: "datetime-local",
                      required: false,
                    },
                  ]}
                  button="Topshiriqni berish"
                />
              </Panel>
              {g.assignments.map((a) => (
                <Panel
                  key={a.id}
                  title={a.title}
                  description={a.submissions.length + " ta javob yuborilgan"}
                >
                  <p className="mb-4 text-muted-foreground">{a.description}</p>
                  {a.submissions.map((s) => (
                    <section key={s.id} className="my-5 rounded-lg border p-5">
                      <h3 className="mb-3 font-semibold">{s.user.name}</h3>
                      <p className="mb-5 whitespace-pre-wrap">{s.content}</p>
                      <ActionForm
                        endpoint="/api/assignments"
                        method="PATCH"
                        extra={{ submissionId: s.id }}
                        button="Baholash"
                        fields={[
                          {
                            name: "grade",
                            label: "Baho (0–100)",
                            type: "number",
                            min: 0,
                            max: 100,
                            defaultValue: s.grade?.toString(),
                          },
                          {
                            name: "feedback",
                            label: "Izoh va tavsiya",
                            type: "textarea",
                            minLength: 1,
                            maxLength: 3000,
                            defaultValue: s.feedback ?? "",
                          },
                        ]}
                      />
                    </section>
                  ))}
                </Panel>
              ))}
            </section>
          ))
        ) : (
          <p className="text-muted-foreground">
            Sizga guruh hali biriktirilmagan.
          </p>
        )}
      </div>
    </>
  );
}
