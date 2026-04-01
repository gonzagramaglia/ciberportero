import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
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
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
