"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-3xl font-bold">Sahifani ochib bo‘lmadi</h1>
      <p className="text-muted-foreground">
        Ma’lumotlar bazasi ulanishini tekshiring va qayta urinib ko‘ring.
      </p>
      <Button onClick={reset}>Qayta urinish</Button>
    </main>
  );
}
