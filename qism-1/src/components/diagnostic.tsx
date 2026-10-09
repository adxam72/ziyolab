"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Panel } from "./page-parts";
type Question = { id: string; prompt: string; options: string[] };
type Result = {
  feedback: {
    id: string;
    prompt: string;
    selected: string;
    correctAnswer: string;
    correct: boolean;
    explanation: string;
  }[];
};
export function Diagnostic() {
  const [assessment, setAssessment] = useState<{
    id: string;
    questions: Question[];
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/diagnostics")
      .then(async (r) => {
        if (!r.ok) throw new Error("Diagnostikani yuklab bo‘lmadi.");
        setAssessment(await r.json());
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, []);
  async function send(start: boolean) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          start ? { action: "start" } : { id: assessment?.id, answers },
        ),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (start) {
        setAssessment(d);
        setAnswers({});
        setResult(null);
      } else {
        setResult(d);
        setAssessment(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ulanishda xato.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : null}
      {busy ? <p role="status">Bajarilmoqda…</p> : null}
      {result ? (
        <>
          <Panel
            title="Diagnostika yakunlandi"
            description="Bilim pasporti va individual o‘quv yo‘lingiz yangilandi."
          >
            <Button asChild>
              <Link href="/bilim-pasporti">Bilim pasportini ko‘rish</Link>
            </Button>
          </Panel>
          {result.feedback.map((f) => (
            <Panel key={f.id} title={f.prompt}>
              <p
                className={
                  f.correct
                    ? "font-semibold text-primary"
                    : "font-semibold text-destructive"
                }
              >
                {f.correct ? "To‘g‘ri javob" : "Xatoni tahlil qilamiz"}
              </p>
              <p className="mt-2">Sizning javobingiz: {f.selected}</p>
              {!f.correct ? (
                <p className="mt-1">To‘g‘ri javob: {f.correctAnswer}</p>
              ) : null}
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {f.explanation}
              </p>
            </Panel>
          ))}
          <Button onClick={() => send(true)} disabled={busy}>
            Yangi diagnostika
          </Button>
        </>
      ) : assessment ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            send(false);
          }}
        >
          <div className="sticky top-0 bg-background py-4">
            <p className="mb-2 text-sm text-muted-foreground">
              {Object.keys(answers).length} / {assessment.questions.length}{" "}
              savolga javob berildi
            </p>
            <Progress
              value={
                (Object.keys(answers).length / assessment.questions.length) *
                100
              }
              aria-label="Diagnostika jarayoni"
            />
          </div>
          {assessment.questions.map((q, i) => (
            <fieldset key={q.id} className="rounded-xl border bg-card p-6">
              <legend className="px-2 text-sm font-semibold text-muted-foreground">
                {i + 1}-savol
              </legend>
              <p className="mb-4 text-lg font-semibold">{q.prompt}</p>
              <div className="flex flex-col gap-3">
                {q.options.map((o, j) => (
                  <label
                    key={j}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-checked:border-primary has-checked:bg-accent"
                  >
                    <input
                      type="radio"
                      required
                      name={q.id}
                      checked={answers[q.id] === j}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: j }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <Button
            type="submit"
            disabled={
              busy ||
              Object.keys(answers).length !== assessment.questions.length
            }
            className="self-start"
          >
            Natijani olish
          </Button>
        </form>
      ) : !busy ? (
        <Panel
          title="O‘z bilimingizni aniqlang"
          description="7 ko‘nikma bo‘yicha 21 savol. Natijada xatolaringiz tahlili va shaxsiy reja shakllanadi."
        >
          <Button onClick={() => send(true)}>Diagnostikani boshlash</Button>
        </Panel>
      ) : null}
    </div>
  );
}
