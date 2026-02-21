import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import FloatingChat from "@/components/FloatingChat";

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
        className={`antialiased bg-background text-foreground font-sans`}
      >
        <div className="flex min-h-screen w-full">
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen">
            <MobileHeader sidebar={<AppSidebar />} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </div>
        <FloatingChat />
      </body>
    </html>
  );
}
