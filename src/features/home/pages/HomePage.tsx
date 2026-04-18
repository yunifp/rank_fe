import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import NotifikasiPengajuan from "../components/NotifikasiPengajuan";
import { HomeGreeting } from "../components/HomeGreeting";
import { useAuthRole } from "@/hooks/useAuthRole";
import { Separator } from "@/components/ui/separator";
import NotifikasiPerubahanDataMahasiswa from "../components/NotifikasiPerubahanDataMahasiswa";
import { RankingDashboardWidget } from "../components/RankingDashboardWidget";


const HomePage = () => {
  useRedirectIfHasNotAccess("R");

  const {
    isStaffDivisiBeasiswa,
    isLembagaPendidikanVerifikator,
    isVerifikatorPjk,
    isBpdp,
  } = useAuthRole();

  return (
    <div className="space-y-6 pb-10">
      <HomeGreeting />
      <Separator />
      
      {/* Area Notifikasi Lama */}
      {(isStaffDivisiBeasiswa ||
        isLembagaPendidikanVerifikator ||
        isVerifikatorPjk) && <NotifikasiPengajuan />}

      {isBpdp && <NotifikasiPerubahanDataMahasiswa />}

      <div className="pt-4">
        <RankingDashboardWidget />
      </div>
      
    </div>
  );
};

export default HomePage;