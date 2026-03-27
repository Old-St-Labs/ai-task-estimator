import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Task Estimator",
  description: "Break down user stories into estimated tasks assigned to your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
