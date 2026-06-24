import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { BranchProvider } from "@/contexts/BranchContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BranchProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden ml-55">
          <Topbar />
          <main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
        </div>
      </div>
    </BranchProvider>
  );
}
