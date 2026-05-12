import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceiptFlow AI",
  description: "Extract receipt details into editable forms with Gemini AI."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
