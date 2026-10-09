"use client";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";
export type FormField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  autoComplete?: string;
};
export function ActionForm({
  endpoint,
  method = "POST",
  fields,
  extra = {},
  button = "Saqlash",
  redirectTo,
}: {
  endpoint: string;
  method?: string;
  fields: FormField[];
  extra?: Record<string, unknown>;
  button?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = { ...extra };
    for (const f of fields) {
      const value = String(formData.get(f.name) ?? "");
      data[f.name] =
        f.type === "number"
          ? Number(value)
          : f.type === "datetime-local" && value
            ? new Date(value).toISOString()
            : value;
    }
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Saqlanmadi.");
      setError(false);
      setMessage("Muvaffaqiyatli saqlandi.");
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        form.reset();
        router.refresh();
      }
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "Ulanishda xato.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <FieldGroup>
        {fields.map((f) => (
          <Field key={f.name}>
            <FieldLabel htmlFor={formId + "-" + f.name}>{f.label}</FieldLabel>
            {f.options ? (
              <select
                id={formId + "-" + f.name}
                name={f.name}
                defaultValue={f.defaultValue}
                required={f.required ?? true}
                className="h-11 w-full rounded-md border bg-card px-3 text-sm"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <Textarea
                id={formId + "-" + f.name}
                name={f.name}
                required={f.required ?? true}
                minLength={f.minLength}
                maxLength={f.maxLength ?? 10000}
                defaultValue={f.defaultValue}
                rows={4}
              />
            ) : (
              <Input
                id={formId + "-" + f.name}
                name={f.name}
                type={f.type ?? "text"}
                required={f.required ?? true}
                minLength={f.minLength}
                maxLength={f.maxLength ?? 200}
                min={f.min}
                max={f.max}
                defaultValue={f.defaultValue}
                autoComplete={
                  f.autoComplete ??
                  (f.type === "password"
                    ? "current-password"
                    : f.name === "email"
                      ? "email"
                      : "off")
                }
              />
            )}
          </Field>
        ))}
      </FieldGroup>
      {message ? (
        <Alert variant={error ? "destructive" : "default"} role="status">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : null}
        {pending ? "Bajarilmoqda…" : button}
      </Button>
    </form>
  );
}
export function MutationButton({
  endpoint,
  method = "PATCH",
  body,
  children,
}: {
  endpoint: string;
  method?: string;
  body: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            const r = await fetch(endpoint, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Ulanishda xato.");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Bajarilmoqda…" : children}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
