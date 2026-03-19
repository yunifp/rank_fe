/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingService } from "../services/rankingService";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, Play, Download, Trash2, RefreshCcw, Eraser,
  Trophy, Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Filter 
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebounce } from "@/hooks/useDebounce";

const RankingPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [search, setSearch] = useState("");
  const [filterPt, setFilterPt] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);

  const [notifModal, setNotifModal] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false); // <-- STATE BARU

  const showNotif = (title: string, message: string, type: "success" | "error") => {
    setNotifModal({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterPt, filterProdi]);

  const { data: optionsData } = useQuery({
    queryKey: ["rankingOptions"],
    queryFn: rankingService.getFilterOptions,
  });

  const { data: paginationData, isLoading, isFetching } = useQuery({
    queryKey: ["hasilRanking", page, limit, debouncedSearch, filterPt, filterProdi],
    queryFn: () => rankingService.getHasilRanking({ 
      page, 
      limit, 
      search: debouncedSearch, 
      pt: filterPt === "ALL" ? "" : filterPt, 
      prodi: filterProdi === "ALL" ? "" : filterProdi 
    }),
  });

  const uploadMutation = useMutation({
    mutationFn: rankingService.uploadData,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Data berhasil diupload", "success");
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      showNotif("Gagal", error.response?.data?.message || "Gagal mengupload data", "error");
    },
    onSettled: () => setIsUploading(false),
  });

  const prosesMutation = useMutation({
    mutationFn: rankingService.prosesRanking,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Perangkingan selesai", "success");
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      showNotif("Gagal", error.response?.data?.message || "Gagal memproses perangkingan", "error");
    },
  });

  // MUTATION BARU: Clear Hasil
  const clearMutation = useMutation({
    mutationFn: rankingService.clearRankingData,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Hasil perangkingan berhasil dibersihkan", "success");
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      setClearModalOpen(false);
    },
    onError: () => {
      showNotif("Gagal", "Gagal membersihkan hasil perangkingan", "error");
      setClearModalOpen(false);
    },
  });

  const resetMutation = useMutation({
    mutationFn: rankingService.resetData,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Data berhasil direset", "success");
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      setResetModalOpen(false);
    },
    onError: () => {
      showNotif("Gagal", "Gagal mereset data perangkingan", "error");
      setResetModalOpen(false);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    try {
      await rankingService.downloadHasil({
        search: debouncedSearch,
        pt: filterPt === "ALL" ? "" : filterPt,
        prodi: filterProdi === "ALL" ? "" : filterProdi
      });
      showNotif("Berhasil", "File berhasil didownload", "success");
    } catch (_error) {
      showNotif("Gagal", "Gagal mendownload file excel", "error");
    }
  };

  const availableProdis = filterPt && filterPt !== "ALL"
    ? optionsData?.prodis.filter(p => {
        const selectedPtObj = optionsData?.pts.find(pt => pt.nama_pt === filterPt);
        return selectedPtObj ? p.id_pt === selectedPtObj.id_pt : true;
      })
    : optionsData?.prodis;

  const uniqueProdiNames = Array.from(new Set(availableProdis?.map(p => p.nama_prodi) || []));

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Sistem Perangkingan" 
        subtitle="Manajemen alokasi dan perangkingan mahasiswa secara otomatis (Afirmasi & Reguler)" 
        Icon={Trophy} 
      />

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <CardTitle className="text-lg font-black tracking-wide text-slate-800">
            Data Hasil Perangkingan
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors font-semibold"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Mengunggah..." : "1. Upload Excel"}
            </Button>

            <Button
              onClick={() => prosesMutation.mutate()}
              disabled={prosesMutation.isPending}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all font-semibold"
            >
              {prosesMutation.isPending ? (
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2 fill-current" />
              )}
              2. Proses Ranking
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!paginationData?.data || paginationData.data.length === 0}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              3. Download Hasil
            </Button>

            {/* TOMBOL BARU: BERSIHKAN HASIL */}
            <Button
              variant="outline"
              onClick={() => setClearModalOpen(true)}
              disabled={clearMutation.isPending}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors font-semibold"
            >
              <Eraser className="w-4 h-4 mr-2" />
              Bersihkan Hasil
            </Button>

            <Button
              variant="ghost"
              onClick={() => setResetModalOpen(true)}
              disabled={resetMutation.isPending}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Master
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 bg-white">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 border rounded-lg px-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all h-10 w-full">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari (Nama, ID, PT, Prodi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 px-0 h-full text-sm placeholder:text-slate-400"
              />
            </div>
            
            <div className="w-full relative shadow-sm rounded-lg">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
              <Select 
                value={filterPt || "ALL"} 
                onValueChange={(v) => {
                  setFilterPt(v);
                  setFilterProdi("ALL");
                }}
              >
                <SelectTrigger className="w-full pl-9 bg-white border-slate-200 h-10 text-sm focus:ring-emerald-500/20 focus:border-emerald-500">
                  <SelectValue placeholder="Semua Perguruan Tinggi" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="ALL" className="font-semibold text-emerald-800">Semua Perguruan Tinggi</SelectItem>
                  {optionsData?.pts.map((pt, idx) => (
                    <SelectItem key={idx} value={pt.nama_pt}>{pt.nama_pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full relative shadow-sm rounded-lg">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
              <Select 
                value={filterProdi || "ALL"} 
                onValueChange={(v) => setFilterProdi(v)}
              >
                <SelectTrigger className="w-full pl-9 bg-white border-slate-200 h-10 text-sm focus:ring-emerald-500/20 focus:border-emerald-500">
                  <SelectValue placeholder="Semua Program Studi" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="ALL" className="font-semibold text-emerald-800">Semua Program Studi</SelectItem>
                  {uniqueProdiNames.map((namaProdi, idx) => (
                    <SelectItem key={idx} value={namaProdi}>{namaProdi}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-600 w-[120px]">ID Transaksi</TableHead>
                  <TableHead className="font-bold text-slate-600">Nama Pendaftar</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[120px]">Nilai Akhir</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center w-[120px]">Kluster</TableHead>
                  <TableHead className="font-bold text-slate-600">PT Final</TableHead>
                  <TableHead className="font-bold text-slate-600">Prodi Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
                        <span className="text-sm font-medium">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginationData?.data && paginationData.data.length > 0 ? (
                  paginationData.data.map((row, i) => (
                    <TableRow key={i} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-semibold text-slate-700">{row.id_trx_beasiswa}</TableCell>
                      <TableCell className="font-medium text-slate-800">{row.nama}</TableCell>
                      <TableCell className="text-center font-bold text-emerald-700 text-base">
                        {Number(row.nilai_akhir).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                          row.kluster === 'Afirmasi' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {row.kluster}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.nama_pt ? (
                          <div className="max-w-[200px] truncate text-sm font-medium text-slate-700" title={row.nama_pt}>
                            {row.nama_pt}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.nama_prodi ? (
                          <div className="max-w-[200px] truncate text-sm font-medium text-slate-700" title={row.nama_prodi}>
                            {row.nama_prodi}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <Search className="w-6 h-6 text-slate-300" />
                        <span className="text-sm font-medium">Belum ada data perangkingan atau data tidak ditemukan.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {paginationData && paginationData.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Menampilkan halaman <span className="font-bold text-slate-700">{paginationData.currentPage}</span> dari <span className="font-bold text-slate-700">{paginationData.totalPages}</span> (Total: {paginationData.totalData} data)
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
                  onClick={() => setPage((p) => Math.min(paginationData.totalPages, p + 1))}
                  disabled={page === paginationData.totalPages || isFetching}
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

      {/* ALERT DIALOG BARU: BERSIHKAN HASIL */}
      <AlertDialog open={clearModalOpen} onOpenChange={setClearModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Bersihkan Hasil Perangkingan?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              Tindakan ini akan mengosongkan <span className="text-orange-600 font-bold">PT Final dan Prodi Final</span> untuk semua peserta yang telah diranking. Data master pendaftar tetap aman dan tidak akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={clearMutation.isPending}
              className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                clearMutation.mutate();
              }} 
              disabled={clearMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md"
            >
              {clearMutation.isPending ? "Membersihkan..." : "Ya, Bersihkan Hasil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG: RESET MASTER */}
      <AlertDialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              Tindakan ini akan menghapus <span className="text-red-600 font-bold">secara permanen</span> seluruh data master perangkingan dan hasil alokasi saat ini. Proses ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={resetMutation.isPending}
              className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                resetMutation.mutate();
              }} 
              disabled={resetMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md"
            >
              {resetMutation.isPending ? "Menghapus Data..." : "Ya, Hapus Master"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RankingPage;