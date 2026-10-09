import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/page-parts";
import { Diagnostic } from "@/components/diagnostic";
export default async function Page() {
  if ((await requireUser()).role !== "STUDENT") redirect("/bosh-sahifa");
  return (
    <>
      <PageTitle
        title="Diagnostika"
        description="Javoblaringiz orqali bilimdagi bo‘shliqlarni aniqlaymiz va rivojlanish yo‘lini shakllantiramiz."
      />
      <Diagnostic />
    </>
  );
}
