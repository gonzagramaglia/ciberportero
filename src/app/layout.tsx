import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthProvider";
import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import "./globals.css";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL('https://ciberportero.com'),
  title: {
    default: "Ciberportero",
    template: "Ciberportero | %s",
  },
  description: "Recursos y apuntes independientes para estudiantes de Ciberdefensa (UNDEF).",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Ciberportero",
    description: "Recursos y apuntes independientes para estudiantes de Ciberdefensa (UNDEF).",
    url: "https://ciberportero.com",
    siteName: "Ciberportero",
    images: [
      {
        url: "/vercel-logo.png",
        width: 1200,
        height: 630,
        alt: "Ciberportero",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciberportero",
    description: "Recursos y apuntes independientes para estudiantes de Ciberdefensa (UNDEF).",
    images: ["/vercel-logo.png"],
  },
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
            <Toaster 
              position="top-center" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  color: '#1e293b',
                  borderRadius: '20px',
                  padding: '1rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                },
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
