import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegalAI UAE - AI-Powered Legal Assistance",
  description: "Get instant, confidential AI-powered legal guidance tailored to UAE laws and regulations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
