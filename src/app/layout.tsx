import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NGP - New Gestion Projet",
  description: "Application de gestion de projet professionnelle. Gérez vos projets, tâches et équipes efficacement.",
  keywords: ["Gestion Projet", "Project Management", "Tâches", "Tasks", "Équipe", "Team", "NGP"],
  authors: [{ name: "NGP Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "NGP - New Gestion Projet",
    description: "Application de gestion de projet professionnelle",
    siteName: "NGP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NGP - New Gestion Projet",
    description: "Application de gestion de projet professionnelle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script inline pour définir le fond AVANT tout chargement - protection anti-flash maximale */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #__next, #__next > div, div[min-h-screen] {
            background-color: #1a2744 !important;
            background: #1a2744 !important;
          }
          * {
            border-color: rgba(255, 255, 255, 0.1);
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#1a2744' }}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
