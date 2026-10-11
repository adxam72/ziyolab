import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "ZiyoLab — ILMDAN NATIJAGA",
    template: "%s | ZiyoLab",
  },
  description:
    "Bilim diagnostikasi, individual ta’lim va ilmiy faoliyat platformasi.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
