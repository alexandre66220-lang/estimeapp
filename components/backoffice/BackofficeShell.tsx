import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

export function BackofficeShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-[#0C0C0D]">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
