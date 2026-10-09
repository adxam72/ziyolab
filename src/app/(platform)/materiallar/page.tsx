import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTitle, Panel } from "@/components/page-parts";
import { ActionForm, MutationButton } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
export default async function Page() {
  const u = await requireUser();
  if (!["TEACHER", "ADMIN"].includes(u.role)) redirect("/bosh-sahifa");
  const [materials, skills] = await Promise.all([
    db.material.findMany({
      where: { facultyId: u.facultyId },
      include: { skill: true },
      orderBy: { createdAt: "desc" },
    }),
    db.skill.findMany({ orderBy: { order: "asc" } }),
  ]);
  return (
    <>
      <PageTitle
        title="Bilim bazasi"
        description="Ta’lim materiallarini kiriting va AI uchun indekslang. Indekslash Gemini konfiguratsiyasini talab qiladi."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Material qo‘shish">
          <ActionForm
            endpoint="/api/materials"
            fields={[
              { name: "title", label: "Material sarlavhasi", minLength: 3 },
              {
                name: "skillId",
                label: "Ko‘nikma",
                options: skills.map((s) => ({ value: s.id, label: s.name })),
              },
              {
                name: "content",
                label: "O‘quv materiali matni",
                type: "textarea",
                minLength: 30,
                maxLength: 18000,
              },
            ]}
            button="Materialni saqlash"
          />
        </Panel>
        {materials.map((m) => (
          <Panel key={m.id} title={m.title} description={m.skill.name}>
            <Badge variant="secondary">
              {m.indexedAt ? "AI uchun indekslangan" : "Hali indekslanmagan"}
            </Badge>
            <p className="my-5 whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {m.content}
            </p>
            <MutationButton endpoint="/api/materials" body={{ id: m.id }}>
              {m.indexedAt ? "Qayta indekslash" : "AI uchun indekslash"}
            </MutationButton>
          </Panel>
        ))}
      </div>
    </>
  );
}
