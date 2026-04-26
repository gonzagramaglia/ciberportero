import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import "./globals.css";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Ciberportero",
    template: "Ciberportero | %s",
  },
  description: "Ciberdefensa y seguridad digital desde la primera línea.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
      <body suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider initialLang={initialLang}>
            {children}
            <Toaster position="bottom-right" />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
