import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EventIQ - Log Analyzer",
  description: "AI-powered Windows Event Log Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col font-sans ${notoSansThai.className}`}>{children}</body>
    </html>
  );
}
