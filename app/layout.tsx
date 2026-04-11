import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TempMail Pro",
  description: "Temporary disposable email addresses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
