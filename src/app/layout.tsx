import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Smart README | AI Generator",
  description: "Transform your repository into a compelling story.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable}`}>{children} <Analytics /> </body>
    </html>
  );
}
