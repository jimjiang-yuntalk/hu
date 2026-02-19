import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "斛教练",
  description: "专业羽毛球知识库 - 技术、战术与训练",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased flex min-h-screen bg-background text-foreground font-sans`}
      >
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
