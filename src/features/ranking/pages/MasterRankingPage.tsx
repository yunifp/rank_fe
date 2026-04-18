import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingService } from "../services/rankingService";
import type { RankingResult } from "../types/ranking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  Database, UserMinus, UserCheck, RefreshCcw
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebounce } from "@/hooks/useDebounce";

const MasterRankingPage = () => {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [notifModal, setNotifModal] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const [mundurModalOpen, setMundurModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<RankingResult | null>(null);
  const [targetStatusMundur, setTargetStatusMundur] = useState<"Y" | "N">("Y");

  const showNotif = (title: string, message: string, type: "success" | "error") => {
    setNotifModal({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: masterData, isLoading, isFetching } = useQuery({
    queryKey: ["masterRanking", page, limit, debouncedSearch],
    queryFn: () => rankingService.getAllDatabaseUpload({
      page,
      limit,
      search: debouncedSearch
    }),
  });

  const statusMundurMutation = useMutation({
    mutationFn: () => rankingService.updateStatusMundur(selectedPeserta!.id_trx_beasiswa, targetStatusMundur),
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Status berhasil diubah", "success");
      queryClient.invalidateQueries({ queryKey: ["masterRanking"] });
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      setMundurModalOpen(false);
      setSelectedPeserta(null);
    },
    onError: () => {
      showNotif("Gagal", "Gagal mengubah status mundur", "error");
      setMundurModalOpen(false);
    }
  });

  const handleOpenMundurModal = (peserta: RankingResult, status: "Y" | "N") => {
    setSelectedPeserta(peserta);
    setTargetStatusMundur(status);
    setMundurModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Database Master Perangkingan" 
        subtitle="Lihat seluruh data pendaftar dan kelola status (termasuk status cadangan dan pengunduran diri)" 
        Icon={Database} 
      />

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <CardTitle className="text-lg font-black tracking-wide text-slate-800">
            Daftar Seluruh Pendaftar
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 bg-white">
          <div className="flex items-center space-x-2 border rounded-lg px-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all h-10 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan Nama atau Kode Pendaftaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 px-0 h-full text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-600 w-[150px]">Kode Pendaftaran</TableHead>
                  <TableHead className="font-bold text-slate-600">Nama Pendaftar</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[100px]">Nilai</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[100px]">Kluster</TableHead>
                  <TableHead className="font-bold text-slate-600">PT & Prodi Alokasi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[120px]">Status</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[140px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
                        <span className="text-sm font-medium">Memuat data master...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : masterData?.data && masterData.data.length > 0 ? (
                  masterData.data.map((row, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-700">{row.kode_pendaftaran || "-"}</TableCell>
                      <TableCell className="font-medium text-slate-800">{row.nama}</TableCell>
                      <TableCell className="text-center font-bold text-emerald-700 text-base">
                        {Number(row.nilai_akhir).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.kluster === 'Afirmasi' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.kluster}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.nama_pt && row.nama_prodi ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={row.nama_pt}>{row.nama_pt}</span>
                            <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]" title={row.nama_prodi}>{row.nama_prodi}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.status_mundur === "Y" ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-red-100 text-red-800 border border-red-200 shadow-sm">
                            Mundur
                          </span>
                        ) : row.id_pt ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                            Terlokasi
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                            Cadangan
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.status_mundur === "Y" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 w-full font-bold shadow-sm"
                            onClick={() => handleOpenMundurModal(row, "N")}
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                            Batal Mundur
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-full font-bold shadow-sm"
                            onClick={() => handleOpenMundurModal(row, "Y")}
                          >
                            <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                            Set Mundur
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <Database className="w-6 h-6 text-slate-300" />
                        <span className="text-sm font-medium">Database master kosong atau data tidak ditemukan.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {masterData && masterData.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Menampilkan halaman <span className="font-bold text-slate-700">{masterData.currentPage}</span> dari <span className="font-bold text-slate-700">{masterData.totalPages}</span> (Total: {masterData.totalData} data)
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
                  onClick={() => setPage((p) => Math.min(masterData.totalPages, p + 1))}
                  disabled={page === masterData.totalPages || isFetching}
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

      {/* DIALOG NOTIFIKASI */}
      <Dialog open={notifModal.isOpen} onOpenChange={(open) => setNotifModal((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-sm text-center flex flex-col items-center rounded-2xl p-6 border-0 shadow-2xl">
          <DialogHeader className="w-full flex flex-col items-center">
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${
              notifModal.type === "success" ? "bg-emerald-50" : "bg-red-50"
            }`}>
              {notifModal.type === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-800">
              {notifModal.title}
            </DialogTitle>
            <DialogDescription className="text-center mt-3 text-sm font-medium text-slate-500">
              {notifModal.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center w-full mt-6">
            <Button 
              className={`w-full font-bold text-white rounded-lg ${
                notifModal.type === "success" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-red-600 hover:bg-red-700"
              }`} 
              onClick={() => setNotifModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Tutup Pesan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG: KONFIRMASI MUNDUR */}
      <AlertDialog open={mundurModalOpen} onOpenChange={setMundurModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Konfirmasi Status Mundur</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              {targetStatusMundur === "Y" 
                ? (
                  <span>Apakah Anda yakin ingin menandai peserta <span className="font-bold text-slate-800">{selectedPeserta?.nama}</span> sebagai <span className="text-red-600 font-bold">MENGUNDURKAN DIRI</span>? Jika ya, PT & Prodi alokasinya akan dikosongkan.</span>
                )
                : (
                  <span>Apakah Anda yakin ingin <span className="text-emerald-600 font-bold">MEMBATALKAN</span> status mengundurkan diri untuk peserta <span className="font-bold text-slate-800">{selectedPeserta?.nama}</span>?</span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={statusMundurMutation.isPending}
              className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                statusMundurMutation.mutate();
              }} 
              disabled={statusMundurMutation.isPending}
              className={targetStatusMundur === "Y" ? "bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md" : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md"}
            >
              {statusMundurMutation.isPending ? "Menyimpan..." : "Ya, Lanjutkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MasterRankingPage;