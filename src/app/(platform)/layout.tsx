import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
export const dynamic = "force-dynamic";
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await requireUser();
  return (
    <AppShell name={u.name} role={u.role}>
      {children}
    </AppShell>
  );
}
