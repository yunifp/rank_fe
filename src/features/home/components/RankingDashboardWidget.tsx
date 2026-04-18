import { useQuery } from "@tanstack/react-query";
import { rankingService } from "../../ranking/services/rankingService";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, UserCheck, UserMinus, 
  Database, Star, Award, Trophy, RefreshCcw 
} from "lucide-react";

export const RankingDashboardWidget = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardRankingStats"],
    queryFn: rankingService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[20vh] text-emerald-600 bg-white rounded-xl border border-slate-200 shadow-sm">
        <RefreshCcw className="w-8 h-8 animate-spin mb-3" />
        <h3 className="text-sm font-bold">Memuat Statistik Perangkingan...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==============================================
          SECTION 1: DATA MENTAH (UPLOADED DATA)
      ============================================== */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-black text-slate-800 tracking-wide">Data Mentah (Pendaftar)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Total Data Mentah */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Upload</p>
                  <p className="text-3xl font-black text-slate-800">{stats?.data_mentah.total || 0}</p>
                </div>
                <div className="bg-slate-100 p-4 rounded-xl text-slate-600">
                  <Users className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Total Afirmasi */}
          <Card className="bg-emerald-800 border-none shadow-md hover:shadow-lg transition-shadow rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-700 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-200 uppercase tracking-wider">Afirmasi</p>
                  <p className="text-3xl font-black">{stats?.data_mentah.afirmasi || 0}</p>
                </div>
                <div className="bg-emerald-700 p-4 rounded-xl text-emerald-100 shadow-inner">
                  <Star className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Total Reguler */}
          <Card className="bg-blue-800 border-none shadow-md hover:shadow-lg transition-shadow rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-700 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-blue-200 uppercase tracking-wider">Reguler</p>
                  <p className="text-3xl font-black">{stats?.data_mentah.reguler || 0}</p>
                </div>
                <div className="bg-blue-700 p-4 rounded-xl text-blue-100 shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="h-px w-full bg-slate-200 my-4" />

      {/* ==============================================
          SECTION 2: DATA HASIL PROSES (ALOKASI)
      ============================================== */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-black text-slate-800 tracking-wide">Data Hasil Proses (Terlokasi)</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Total Hasil Proses */}
          <Card className="bg-white border-emerald-200 border-2 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Lolos</p>
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-900">{stats?.data_proses.total || 0}</p>
            </CardContent>
          </Card>

          {/* Card Proses Afirmasi */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lolos (Afirmasi)</p>
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 border border-emerald-100">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.data_proses.afirmasi || 0}</p>
            </CardContent>
          </Card>

          {/* Card Proses Reguler */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lolos (Reguler)</p>
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 border border-blue-100">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.data_proses.reguler || 0}</p>
            </CardContent>
          </Card>

          {/* Card Data Mundur */}
          <Card className="bg-white border-red-200 border shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Peserta Mundur</p>
                <div className="bg-red-50 p-2 rounded-lg text-red-600 border border-red-100">
                  <UserMinus className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-red-700">{stats?.data_proses.mundur || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};