import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import SyncStatus from "@/components/SyncStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciberportero",
  description: "Ciberdefensa y seguridad digital desde la primera línea.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get language from cookies on the server to prevent UI flickering
  const cookieStore = await cookies();
  const initialLang = (cookieStore.get("lang")?.value as Locale) || "es";

  return (
    <html lang={initialLang}>
      <body>
        <AuthProvider>
          <LanguageProvider initialLang={initialLang}>
            {children}
            <SyncStatus />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
