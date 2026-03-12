import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "AI乒羽馆",
  description: "AI乒羽馆 - 乒羽训练与知识库",
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
        <div className="flex h-screen w-full overflow-hidden">
          <div className="hidden md:block h-full shrink-0">
            <AppSidebar />
          </div>
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MobileHeader sidebar={<AppSidebar isMobile />} />
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
