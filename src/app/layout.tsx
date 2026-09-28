import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";

const display = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
});

const body = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "טריוויית מערת האצבע",
  description: "משחק טריוויה על מערת האצבע ושמורת נחל המערות בהר הכרמל",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="page-frame">{children}</div>
      </body>
    </html>
  );
}
