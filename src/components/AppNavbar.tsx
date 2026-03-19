import { SidebarTrigger } from "./ui/sidebar";
import AvatarDropdown from "./AvatarDropdown";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger yang sudah disesuaikan warnanya di ui/sidebar.tsx */}
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-4">
        <AvatarDropdown />
      </div>
    </nav>
  );
}