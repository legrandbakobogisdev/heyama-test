import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heyama Objects",
  description: "Plateforme de gestion d'Objects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-6">
            <Link
              href="/"
              className="text-sm font-medium tracking-tight text-foreground"
            >
              Heyama Objects
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
