import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiConfigured } from "@/lib/ai";
import { PageTitle } from "@/components/page-parts";
import { Chat } from "@/components/chat";
export default async function Page() {
  const u = await requireUser();
  const messages = await db.chatMessage.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return (
    <>
      <PageTitle
        title="AI yordamchi"
        description="Tayyor javobdan ko‘ra, tushunish va mustaqil fikrlashga bir qadam."
      />
      <Chat
        configured={aiConfigured()}
        initial={messages
          .reverse()
          .map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations as
              { number: number; title: string }[] | null,
          }))}
      />
    </>
  );
}
