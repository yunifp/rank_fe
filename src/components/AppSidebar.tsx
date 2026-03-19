import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { useMenuStore } from "@/stores/menuStore";
import RenderSidebarItems from "./RenderSidebarItems";
import { Trophy } from "lucide-react";

const AppSidebar = () => {
  const items = useMenuStore((state) => state.menus);

  const mergedItems = [...items];

  return (
    <Sidebar>
      <SidebarContent className="bg-white border-r border-slate-200 font-inter shadow-sm">
        {/* Header / Brand Name dengan Logo */}
        <div className="p-6 flex items-center justify-start gap-3 border-b border-slate-100 mb-4 px-6">
          <div className="bg-emerald-800 p-2 rounded-lg shadow-sm">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-emerald-800 tracking-wider uppercase">
            RANKING
          </h1>
        </div>

        {/* Sidebar Navigation */}
        <SidebarMenu className="px-2">
          <RenderSidebarItems items={mergedItems} />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;