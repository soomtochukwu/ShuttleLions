import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShuttleLions 🏸 | UNN Badminton Registration & Fees",
  description:
    "Official badminton registration and fee payment platform for the University of Nigeria, Nsukka (UNN).",
  openGraph: {
    title: "ShuttleLions 🏸",
    description: "Official UNN Badminton Club Registration & Fees Portal.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShuttleLions 🏸",
    description: "Join the ShuttleLions Badminton Club at UNN. Register and pay dues online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased h-dvh flex flex-col overflow-hidden`}>
        <Providers>
          <main className="grow flex flex-col w-full relative z-10 overflow-y-auto pb-32">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
