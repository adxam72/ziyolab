import Link from "next/link";
export default function NotFound() {
  return (
    <main className="p-12">
      <h1 className="text-3xl font-bold">Sahifa topilmadi</h1>
      <Link href="/bosh-sahifa" className="text-primary">
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}
