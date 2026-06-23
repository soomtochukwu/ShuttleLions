import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-sl-bg`}>
        <Providers>
          <main className="flex-grow flex flex-col w-full relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
