import { redirect } from "next/navigation";
import { Folder, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTitle, Panel, EmptyState } from "@/components/page-parts";
import { ActionForm } from "@/components/action-form";
export default async function Page() {
  const u = await requireUser();
  if (u.role !== "STUDENT") redirect("/bosh-sahifa");
  const [items, projects] = await Promise.all([
    db.portfolioItem.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
    }),
    db.researchProject.findMany({
      where: { studentId: u.id, stage: "COMPLETED" },
    }),
  ]);
  return (
    <>
      <PageTitle
        title="Portfolio"
        description="Ilmiy ishlaringiz, erishgan natijalaringiz va amaliy loyihalaringiz."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Natija qo‘shish">
          <ActionForm
            endpoint="/api/portfolio"
            button="Portfolioga qo‘shish"
            fields={[
              { name: "title", label: "Natija nomi", minLength: 3 },
              {
                name: "description",
                label: "Natija tavsifi",
                type: "textarea",
                minLength: 10,
                maxLength: 5000,
              },
              {
                name: "url",
                label: "Havola (ixtiyoriy)",
                type: "url",
                required: false,
                maxLength: 2000,
              },
            ]}
          />
        </Panel>
        {items.map((i) => (
          <Panel key={i.id} title={i.title}>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {i.description}
            </p>
            {i.url ? (
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-primary"
              >
                Natijani ochish
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </Panel>
        ))}
        {projects.map((p) => (
          <Panel
            key={p.id}
            title={p.title}
            description="Yakunlangan ilmiy loyiha"
          >
            <p className="whitespace-pre-wrap text-muted-foreground">
              {p.outcome}
            </p>
          </Panel>
        ))}
        {!items.length && !projects.length ? (
          <EmptyState icon={Folder} title="Birinchi natijangizni qo‘shing" />
        ) : null}
      </div>
    </>
  );
}
