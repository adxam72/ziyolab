import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ro‘yxatdan o‘tish" };

export default async function Register() {
  if (await currentUser()) redirect("/bosh-sahifa");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-[#14213d] p-8 text-white lg:p-16">
        <Link
          href="/kirish"
          className="flex items-center gap-3 self-start"
          aria-label="ZiyoLab — kirish"
        >
          <BookOpen className="size-9" />
          <div>
            <p className="text-xl font-bold tracking-tight">ZiyoLab</p>
            <p className="text-[11px] tracking-[.22em] text-white/60">
              ILMDAN NATIJAGA
            </p>
          </div>
        </Link>
        <div className="my-10 flex max-w-xl flex-col gap-7">
          <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
            Bilim sari
            <br />
            birinchi qadam.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            Akkaunt yarating, ko‘nikmalaringizni aniqlang va o‘zingizga mos
            ta’lim yo‘lini boshlang.
          </p>
          <div className="flex items-center gap-3 text-sm text-white/70">
            Diagnostika <ArrowRight className="size-4" /> Ta’lim{" "}
            <ArrowRight className="size-4" /> Tadqiqot
          </div>
        </div>
        <p className="text-sm text-white/50">
          ZiyoLab ta’lim va ilmiy faoliyat platformasi
        </p>
      </section>
      <section className="flex items-center justify-center bg-card px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-7">
          <div>
            <h2 className="text-3xl font-bold">Ro‘yxatdan o‘tish</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Shaxsiy ta’lim yo‘lingizni bugun boshlang.
            </p>
          </div>
          <ActionForm
            endpoint="/api/auth/register"
            button="Akkaunt yaratish"
            redirectTo="/bosh-sahifa"
            fields={[
              {
                name: "name",
                label: "Ism va familiyangiz",
                minLength: 2,
                maxLength: 100,
                autoComplete: "name",
              },
              {
                name: "email",
                label: "Email manzilingiz",
                type: "email",
                maxLength: 254,
              },
              {
                name: "password",
                label: "Parol (kamida 12 belgi)",
                type: "password",
                minLength: 12,
                maxLength: 128,
                autoComplete: "new-password",
              },
              {
                name: "confirmPassword",
                label: "Parolni tasdiqlang",
                type: "password",
                minLength: 12,
                maxLength: 128,
                autoComplete: "new-password",
              },
            ]}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Talaba akkaunti yaratiladi. Guruhga biriktirish uchun fakultet
            mas’uliga murojaat qiling.
          </p>
          <p className="text-sm text-muted-foreground">
            Akkauntingiz bormi?{" "}
            <Link
              href="/kirish"
              className="font-medium text-primary underline underline-offset-4"
            >
              Tizimga kiring
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
