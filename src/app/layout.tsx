import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AeroCheck - Sistem Inspeksi Bandara",
  description: "Sistem Check Persiapan dan Kelengkapan Inspeksi Daerah Pergerakan Pesawat Udara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
