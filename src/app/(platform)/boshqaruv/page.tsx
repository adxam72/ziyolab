import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageTitle, Panel } from "@/components/page-parts";
import { ActionForm } from "@/components/action-form";
const roles = {
  STUDENT: "Talaba",
  TEACHER: "O‘qituvchi",
  SUPERVISOR: "Ilmiy rahbar",
  ADMIN: "Administrator",
};
export default async function Page() {
  const u = await requireUser();
  if (u.role !== "ADMIN") redirect("/bosh-sahifa");
  const [users, groups] = await Promise.all([
    db.user.findMany({
      where: { facultyId: u.facultyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        group: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.group.findMany({ where: { facultyId: u.facultyId } }),
  ]);
  return (
    <>
      <PageTitle
        title="Boshqaruv"
        description="Pilot akkauntlarini yarating. Talaba guruhga, o‘qituvchi guruh monitoringiga biriktiriladi."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Akkaunt yaratish">
          <ActionForm
            endpoint="/api/users"
            button="Akkaunt yaratish"
            fields={[
              { name: "name", label: "Ism va familiya", minLength: 2 },
              { name: "email", label: "Email", type: "email", maxLength: 254 },
              {
                name: "password",
                label: "Boshlang‘ich parol (kamida 12 belgi)",
                type: "password",
                minLength: 12,
                maxLength: 128,
              },
              {
                name: "role",
                label: "Foydalanuvchi roli",
                options: [
                  { value: "STUDENT", label: "Talaba" },
                  { value: "TEACHER", label: "O‘qituvchi" },
                  { value: "SUPERVISOR", label: "Ilmiy rahbar" },
                ],
              },
              {
                name: "groupId",
                label: "Guruh",
                required: false,
                options: [
                  { value: "", label: "Biriktirilmagan" },
                  ...groups.map((g) => ({ value: g.id, label: g.name })),
                ],
              },
            ]}
          />
        </Panel>
        <Panel title="Foydalanuvchilar">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Ism</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Guruh</th>
                </tr>
              </thead>
              <tbody>
                {users.map((v) => (
                  <tr key={v.id} className="border-b">
                    <td className="p-3 font-semibold">{v.name}</td>
                    <td className="p-3">{v.email}</td>
                    <td className="p-3">{roles[v.role]}</td>
                    <td className="p-3">{v.group?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
