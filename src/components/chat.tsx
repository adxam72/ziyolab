"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Send } from "lucide-react";
type Message = {
  id: string;
  role: string;
  content: string;
  citations: { number: number; title: string }[] | null;
};
export function Chat({
  initial,
  configured,
}: {
  initial: Message[];
  configured: boolean;
}) {
  const [messages, setMessages] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  return (
    <div className="flex flex-col gap-6">
      {!configured ? (
        <p className="rounded-lg border p-4 text-muted-foreground">
          AI yordamchi hozircha faol emas. Boshqa ta’lim bo‘limlaridan
          foydalanishingiz mumkin.
        </p>
      ) : null}
      <div aria-live="polite" className="flex flex-col gap-4">
        {messages.length ? (
          messages.map((m) => (
            <article
              key={m.id}
              className={
                "max-w-3xl rounded-xl border p-5 " +
                (m.role === "user" ? "self-end bg-accent" : "bg-card")
              }
            >
              <p className="mb-2 text-sm font-semibold text-primary">
                {m.role === "user" ? "Siz" : "AI yordamchi"}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.citations?.length ? (
                <div className="mt-4 flex flex-col gap-1 border-t pt-3">
                  {m.citations.map((c) => (
                    <p key={c.number} className="text-sm text-muted-foreground">
                      [{c.number}] {c.title}
                    </p>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="py-10 text-center text-muted-foreground">
            O‘quv materiallari bo‘yicha savol bering. Javoblarda bilim
            bazasidagi manbalar ko‘rsatiladi.
          </p>
        )}
      </div>
      <form
        ref={form}
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const question = String(
            new FormData(e.currentTarget).get("question"),
          );
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            setMessages((m) => [
              ...m,
              {
                id: crypto.randomUUID(),
                role: "user",
                content: question,
                citations: null,
              },
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: d.answer,
                citations: d.citations,
              },
            ]);
            form.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Ulanishda xato.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field>
          <FieldLabel htmlFor="question">Savolingiz</FieldLabel>
          <Textarea
            id="question"
            name="question"
            minLength={3}
            maxLength={2000}
            required
            rows={3}
            disabled={busy}
          />
        </Field>
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          disabled={busy || !configured}
          className="self-end"
          type="submit"
        >
          <Send data-icon="inline-start" />
          {busy ? "Javob tayyorlanmoqda…" : "Savolni yuborish"}
        </Button>
      </form>
    </div>
  );
}
