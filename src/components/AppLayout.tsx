import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ContrastToggle } from "@/components/ContrastToggle";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border/70 px-4 sm:px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
            <SidebarTrigger className="mr-4" />
            <span className="font-display text-xl text-foreground">Clinic Flow</span>
            <ContrastToggle className="ml-auto" />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
