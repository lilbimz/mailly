import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mailly",
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
