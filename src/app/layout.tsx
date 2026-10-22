import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: {
    default: "DevPath",
    template: "%s · DevPath",
  },
  description:
    "DevPath helps SAIT students at CUSAT learn DSA with a structured syllabus, practice problems, peer rankings, and an AI study companion.",
  applicationName: "DevPath",
  keywords: ["DSA", "CUSAT", "SAIT", "programming", "peer learning", "DevPath"],
  authors: [{ name: "DevPath" }],
  creator: "DevPath",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "DevPath",
    title: "DevPath — Learn DSA with structure",
    description:
      "Structured DSA curriculum, searchable practice, and batch rankings for SAIT (IT & AI) at CUSAT.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPath",
    description: "Structured DSA learning and practice for CUSAT SAIT students.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
