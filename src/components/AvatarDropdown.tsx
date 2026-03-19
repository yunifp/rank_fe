/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/Auth/services/authService";
import { useState } from "react";
import { toast } from "sonner";
import LoadingDialog from "./LoadingDialog";

const AvatarDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [isLogouting, setIslogouting] = useState(false);

  const handleLogout = async () => {
    setIslogouting(true);
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      navigate("/logout");
      toast.success("Berhasil logout");
    } catch (error) {
      toast.error("Terjadi kesalahan saat logout");
    } finally {
      setIslogouting(false);
    }
  };

  const handleRedirect = () => {
    navigate("/profile");
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2.5 max-w-[220px] bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-all h-10 px-3 rounded-xl shadow-sm"
          >
            {/* Icon User pengganti Image */}
            <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-800 shrink-0">
              <User className="h-4 w-4" strokeWidth={2.5} />
            </div>

            <span className="truncate text-sm font-bold max-w-[110px] tracking-wide">
              {user?.nama || "User"}
            </span>

            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="font-inter w-64 bg-white border-slate-200 shadow-lg rounded-xl overflow-hidden p-1.5" 
          align="end" 
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-black text-slate-800 tracking-wide truncate">
                {user?.nama || "Pengguna"}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate">
                {user?.email || "Tidak ada email"}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-slate-100 mx-1" />
          
          <DropdownMenuItem 
            onClick={handleRedirect}
            className="cursor-pointer py-2.5 px-3 text-[14px] font-bold text-slate-600 focus:bg-emerald-50 focus:text-emerald-800 rounded-lg transition-colors mt-1"
          >
            <User className="mr-3 h-4 w-4" /> Profil Saya
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-100 mx-1" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer py-2.5 px-3 text-[14px] font-bold text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg transition-colors mb-1"
          >
            <LogOut className="mr-3 h-4 w-4" /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LoadingDialog open={isLogouting} title="Memproses logout..." />
    </>
  );
};

export default AvatarDropdown;