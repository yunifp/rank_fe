import type { IMenu } from "@/types/menu";
import type { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "./ui/sidebar";
import clsx from "clsx";
import DynamicIcon from "./DynamicIcon";
import { ChevronDown } from "lucide-react";

interface RenderSidebarItemsProps {
  items: IMenu[];
  level?: number;
}

const RenderSidebarItems: FC<RenderSidebarItemsProps> = ({
  items,
  level = 0,
}) => {
  const location = useLocation();
  const paddingLeft = 3 + level * 2;

  return items.map((item: IMenu) => {
    const isActive = location.pathname === item.url;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      const isAnyChildActive = item.children?.some(
        (child) =>
          child.url === location.pathname ||
          (child.children ?? []).some(
            (grandChild) => grandChild.url === location.pathname,
          ),
      );

      return (
        <Collapsible
          key={item.id}
          className="group"
          defaultOpen={isAnyChildActive}
        >
          <SidebarMenuItem className="my-1">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={clsx(
                  "flex items-center justify-between w-full py-3 px-3 rounded-lg transition-all duration-200",
                  isAnyChildActive
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon && (
                    <DynamicIcon
                      name={item.icon}
                      className={clsx(
                        "h-5 w-5 shrink-0",
                        isAnyChildActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-emerald-700"
                      )}
                    />
                  )}
                  <span className="text-[14px] font-bold tracking-wide truncate">
                    {item.nama}
                  </span>
                </div>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180",
                    isAnyChildActive ? "text-emerald-200" : "text-slate-400"
                  )}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent className={`pl-${paddingLeft}`}>
            <SidebarMenuSub className="border-l-2 border-emerald-100 ml-4 mt-1">
              <RenderSidebarItems
                items={item.children ?? []}
                level={level + 1}
              />
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem
        key={item.id}
        className={clsx(
          "my-1 rounded-lg transition-all duration-200",
          isActive ? "bg-emerald-800 shadow-md" : "hover:bg-emerald-50"
        )}
      >
        <Link
          to={item.url}
          className={clsx(
            "flex items-center gap-3 w-full py-3 px-3 text-[14px] font-bold rounded-lg transition-colors",
            `pl-${paddingLeft}`,
            isActive ? "text-white" : "text-slate-600 hover:text-emerald-800"
          )}
        >
          {item.icon && (
            <DynamicIcon
              name={item.icon}
              className={clsx(
                "h-5 w-5 min-w-[20px] shrink-0",
                isActive ? "text-white" : "text-slate-400"
              )}
            />
          )}

          <span className="tracking-wide">{item.nama}</span>
        </Link>
      </SidebarMenuItem>
    );
  });
};

export default RenderSidebarItems;