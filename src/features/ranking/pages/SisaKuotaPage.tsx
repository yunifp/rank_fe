import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { rankingService } from "../services/rankingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, RefreshCcw, ChevronLeft, ChevronRight, BarChart3
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebounce } from "@/hooks/useDebounce";

const SisaKuotaPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: kuotaData, isLoading, isFetching } = useQuery({
    queryKey: ["sisaKuota", page, limit, debouncedSearch],
    queryFn: () => rankingService.getSisaKuota({
      page,
      limit,
      search: debouncedSearch
    }),
  });

  // Fungsi helper untuk menentukan warna progress bar
  const getProgressColor = (terpakai: number, total: number) => {
    if (total === 0) return "bg-slate-200";
    const percentage = (terpakai / total) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Monitoring Kuota Program Studi" 
        subtitle="Pantau distribusi alokasi dan sisa kuota untuk setiap Perguruan Tinggi dan Program Studi secara real-time." 
        Icon={BarChart3} 
      />

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <CardTitle className="text-lg font-black tracking-wide text-slate-800">
              Keterisian Kuota
            </CardTitle>
            <CardDescription className="font-medium text-slate-500 mt-1">
              Data keterisian dihitung berdasarkan peserta yang sudah terlokasi pada proses perangkingan.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 bg-white">
          {/* Pencarian */}
          <div className="flex items-center space-x-2 border rounded-lg px-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all h-10 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari PT atau Program Studi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 px-0 h-full text-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Tabel Kuota */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-600 w-[60px] text-center">No.</TableHead>
                  <TableHead className="font-bold text-slate-600 w-[250px]">Perguruan Tinggi</TableHead>
                  <TableHead className="font-bold text-slate-600">Program Studi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[100px]">Total</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[100px]">Terpakai</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[100px]">Sisa</TableHead>
                  <TableHead className="font-bold text-slate-600 w-[200px]">Keterisian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
                        <span className="text-sm font-medium">Memuat data kuota...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : kuotaData?.data && kuotaData.data.length > 0 ? (
                  kuotaData.data.map((row, i) => {
                    const percentage = row.kuota_total > 0 ? Math.min((row.kuota_terpakai / row.kuota_total) * 100, 100) : 0;
                    const isFull = row.sisa_kuota <= 0;

                    return (
                      <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center font-bold text-slate-400">
                          {(page - 1) * limit + i + 1}
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">
                          <div className="truncate max-w-[230px]" title={row.nama_pt}>{row.nama_pt}</div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-600">
                          <div className="truncate max-w-[250px]" title={row.nama_prodi}>{row.nama_prodi}</div>
                        </TableCell>
                        <TableCell className="text-center font-black text-slate-700 text-base">
                          {row.kuota_total}
                        </TableCell>
                        <TableCell className="text-center font-black text-emerald-600 text-base">
                          {row.kuota_terpakai}
                        </TableCell>
                        <TableCell className="text-center">
                           <span className={`font-black text-base ${isFull ? 'text-red-500' : 'text-blue-600'}`}>
                             {row.sisa_kuota}
                           </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                              <span>{percentage.toFixed(0)}%</span>
                              {isFull && <span className="text-red-500 text-[10px] uppercase">Penuh</span>}
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(row.kuota_terpakai, row.kuota_total)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <BarChart3 className="w-6 h-6 text-slate-300" />
                        <span className="text-sm font-medium">Data program studi dan kuota tidak ditemukan.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {kuotaData && kuotaData.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Menampilkan halaman <span className="font-bold text-slate-700">{kuotaData.currentPage}</span> dari <span className="font-bold text-slate-700">{kuotaData.totalPages}</span> (Total: {kuotaData.totalData} prodi)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(kuotaData.totalPages, p + 1))}
                  disabled={page === kuotaData.totalPages || isFetching}
                  className="font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SisaKuotaPage;