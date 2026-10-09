import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Login() {
  if (await currentUser()) redirect("/bosh-sahifa");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-[#14213d] p-8 text-white lg:p-16">
        <div className="flex items-center gap-3">
          <BookOpen className="size-9" />
          <div>
            <p className="text-xl font-bold tracking-tight">ZiyoLab</p>
            <p className="text-[11px] tracking-[.22em] text-white/60">
              ILMDAN NATIJAGA
            </p>
          </div>
        </div>
        <div className="my-14 flex max-w-xl flex-col gap-7">
          <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
            Har bir bilim.
            <br />
            Yangi imkoniyat.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            O‘z ko‘nikmalaringizni kashf eting, shaxsiy o‘quv yo‘lingizni
            yarating va bilimingizni ilmiy natijaga aylantiring.
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
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold">Tizimga kirish</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Akkauntingiz orqali kiring yoki yangi akkaunt yarating.
            </p>
          </div>
          <ActionForm
            endpoint="/api/auth/login"
            button="Kirish"
            redirectTo="/bosh-sahifa"
            fields={[
              { name: "email", label: "Email manzilingiz", type: "email" },
              {
                name: "password",
                label: "Parol",
                type: "password",
                maxLength: 128,
              },
            ]}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Akkauntingiz yo‘qmi?{" "}
            <Link
              href="/royxatdan-otish"
              className="font-medium text-primary underline underline-offset-4"
            >
              Ro‘yxatdan o‘ting
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
