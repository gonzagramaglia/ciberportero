import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import CountdownWidget from "@/components/CountdownWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciberportero",
  description: "Ciberdefensa y seguridad digital desde la primera línea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          {children}
          <CountdownWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
