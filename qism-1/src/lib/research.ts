import type { Role } from "@prisma/client";
export const stages = {
  IDEA: "G‘oya",
  LITERATURE: "Adabiyotlar tahlili",
  METHOD: "Metodologiya",
  DATA: "Ma’lumot yig‘ish",
  ANALYSIS: "Tahlil",
  COMPLETED: "Natija",
} as const;
export function projectScope(u: { id: string; role: Role; facultyId: string }) {
  return {
    facultyId: u.facultyId,
    ...(u.role === "ADMIN"
      ? {}
      : u.role === "SUPERVISOR"
        ? { supervisorId: u.id }
        : { studentId: u.id }),
  };
}
