import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/app/components/layout/sidebar";
import { Header } from "@/app/components/layout/header";

export const metadata: Metadata = {
  title: "AI Task Estimator",
  description: "AI-powered sprint planning and task estimation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
