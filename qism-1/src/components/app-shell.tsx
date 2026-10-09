"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Home,
  FileText,
  BarChart3,
  Signpost,
  MessageCircle,
  FlaskConical,
  Folder,
  Users,
  Library,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const studentNav = [
  { href: "/bosh-sahifa", label: "Bosh sahifa", icon: Home },
  { href: "/bilim-pasporti", label: "Bilim pasporti", icon: FileText },
  { href: "/diagnostika", label: "Diagnostika", icon: BarChart3 },
  { href: "/oquv-yolim", label: "O‘quv yo‘lim", icon: Signpost },
  { href: "/ai-yordamchi", label: "AI yordamchi", icon: MessageCircle },
  { href: "/ilmiy-faoliyat", label: "Ilmiy faoliyat", icon: FlaskConical },
  { href: "/portfolio", label: "Portfolio", icon: Folder },
];
export function AppShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const nav =
    role === "STUDENT"
      ? studentNav
      : [
          studentNav[0],
          ...(role === "TEACHER" || role === "ADMIN"
            ? [
                { href: "/oqituvchi", label: "O‘qituvchi paneli", icon: Users },
                { href: "/materiallar", label: "Bilim bazasi", icon: Library },
              ]
            : []),
          studentNav[4],
          studentNav[5],
          ...(role === "ADMIN"
            ? [{ href: "/boshqaruv", label: "Boshqaruv", icon: Settings }]
            : []),
        ];
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b bg-card p-4 lg:hidden">
        <Link href="/bosh-sahifa" className="flex items-center gap-2 font-bold">
          <BookOpen className="size-6 text-primary" />
          ZiyoLab
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      <aside
        className={cn(
          "border-r bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-[296px] lg:flex-col",
          open ? "flex flex-col" : "hidden",
        )}
      >
        <Link
          href="/bosh-sahifa"
          className="flex items-center gap-4 px-7 pt-8 pb-9"
        >
          <BookOpen className="size-10 shrink-0 text-primary" />
          <span>
            <span className="block text-[22px] font-bold tracking-tight">
              ZiyoLab
            </span>
            <span className="block text-[11px] tracking-[.2em] text-muted-foreground">
              ILMDAN NATIJAGA
            </span>
          </span>
        </Link>
        <nav aria-label="Asosiy menyu" className="flex flex-col gap-2 px-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={path === href ? "page" : undefined}
              className={cn(
                "flex items-center gap-6 rounded-lg px-5 py-4 text-base",
                path === href
                  ? "bg-accent font-semibold text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-6 shrink-0" strokeWidth={1.7} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t px-7 py-5">
          <p className="truncate text-sm font-semibold">{name}</p>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={async () => {
              const r = await fetch("/api/auth/logout", { method: "POST" });
              if (r.ok) {
                router.push("/kirish");
                router.refresh();
              } else setError("Chiqish bajarilmadi.");
            }}
          >
            <LogOut data-icon="inline-start" />
            Chiqish
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </aside>
      <main className="mx-auto max-w-[1800px] p-5 lg:ml-[296px] lg:px-7 lg:pt-[82px] lg:pb-7">
        {children}
      </main>
    </div>
  );
}
