import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scarlet Sails",
  description: "MVP for real estate listings"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
