/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingService } from "../services/rankingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy, Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Filter, Users, Workflow
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebounce } from "@/hooks/useDebounce";

const RankingPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [filterPt, setFilterPt] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [cadanganPage, setCadanganPage] = useState(1);
  const [cadanganSearch, setCadanganSearch] = useState("");
  const debouncedCadanganSearch = useDebounce(cadanganSearch, 500);

  const [notifModal, setNotifModal] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [prosesModalOpen, setProsesModalOpen] = useState(false);

  const showNotif = (title: string, message: string, type: "success" | "error") => {
    setNotifModal({ isOpen: true, title, message, type });
  };

  useEffect(() => { setPage(1); }, [debouncedSearch, filterPt, filterProdi]);
  useEffect(() => { setCadanganPage(1); }, [debouncedCadanganSearch]);

  const { data: optionsData } = useQuery({
    queryKey: ["rankingOptions"],
    queryFn: rankingService.getFilterOptions,
  });

  const { data: paginationData, isLoading, isFetching } = useQuery({
    queryKey: ["hasilRanking", page, limit, debouncedSearch, filterPt, filterProdi],
    queryFn: () => rankingService.getHasilRanking({ 
      page, limit, search: debouncedSearch, pt: filterPt === "ALL" ? "" : filterPt, prodi: filterProdi === "ALL" ? "" : filterProdi 
    }),
  });

  const { data: cadanganData, isLoading: isLoadingCadangan, isFetching: isFetchingCadangan } = useQuery({
    queryKey: ["cadanganRanking", cadanganPage, limit, debouncedCadanganSearch],
    queryFn: () => rankingService.getCadanganRanking({
      page: cadanganPage, limit, search: debouncedCadanganSearch
    }),
  });

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await rankingService.downloadTemplate();
      showNotif("Berhasil", "Template berhasil didownload", "success");
    } catch (_error) {
      showNotif("Gagal", "Gagal mendownload template", "error");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: rankingService.uploadData,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Data berhasil diupload", "success");
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      queryClient.invalidateQueries({ queryKey: ["cadanganRanking"] });
      queryClient.invalidateQueries({ queryKey: ["masterRanking"] });
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
      showNotif("Berhasil", res.message || "Perangkingan & Alokasi Cadangan selesai", "success");
      setPage(1);
      setCadanganPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      queryClient.invalidateQueries({ queryKey: ["cadanganRanking"] });
      setProsesModalOpen(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      showNotif("Gagal", error.response?.data?.message || "Gagal memproses perangkingan", "error");
      setProsesModalOpen(false);
    },
  });

  const clearMutation = useMutation({
    mutationFn: rankingService.clearRankingData,
    onSuccess: (res) => {
      showNotif("Berhasil", res.message || "Hasil perangkingan berhasil dibersihkan", "success");
      setPage(1);
      setCadanganPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      queryClient.invalidateQueries({ queryKey: ["cadanganRanking"] });
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
      setCadanganPage(1);
      queryClient.invalidateQueries({ queryKey: ["hasilRanking"] });
      queryClient.invalidateQueries({ queryKey: ["cadanganRanking"] });
      queryClient.invalidateQueries({ queryKey: ["masterRanking"] });
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
        subtitle="Manajemen alokasi dan penarikan cadangan secara otomatis (Afirmasi & Reguler)" 
        Icon={Trophy} 
      />

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-800">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-wide">Pusat Kontrol Ranking</h2>
              <p className="text-xs font-medium text-slate-500">Kelola master data, upload, dan bersihkan hasil</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate || isUploading}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors font-bold shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloadingTemplate ? "Mendownload..." : "Download Template"}
            </Button>

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
              disabled={isUploading || isDownloadingTemplate}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors font-bold shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Mengunggah..." : "Upload Master"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setClearModalOpen(true)}
              disabled={clearMutation.isPending}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors font-bold shadow-sm"
            >
              <Eraser className="w-4 h-4 mr-2" />
              Bersihkan Hasil
            </Button>

            <Button
              variant="ghost"
              onClick={() => setResetModalOpen(true)}
              disabled={resetMutation.isPending}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Master
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="terlokasi" className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl h-auto mb-6 flex max-w-fit shadow-inner border border-slate-200">
          <TabsTrigger 
            value="terlokasi" 
            className="rounded-lg px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm font-black text-slate-500 transition-all text-[15px]"
          >
            <Trophy className="w-4 h-4 mr-2" strokeWidth={3} />
            Peserta Lolos
          </TabsTrigger>
          <TabsTrigger 
            value="cadangan" 
            className="rounded-lg px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm font-black text-slate-500 transition-all text-[15px]"
          >
            <Users className="w-4 h-4 mr-2" strokeWidth={3} />
            Peserta Cadangan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terlokasi" className="mt-0 outline-none">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <CardTitle className="text-lg font-black tracking-wide text-emerald-800">
                  Daftar Peserta Terlokasi (Lolos)
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Mereka yang berhasil mendapatkan kuota di PT dan Prodi pilihannya.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => prosesMutation.mutate()}
                  disabled={prosesMutation.isPending}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all font-bold"
                >
                  {prosesMutation.isPending ? (
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2 fill-current" />
                  )}
                  Jalankan Perangkingan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!paginationData?.data || paginationData.data.length === 0}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 bg-white">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 border rounded-lg px-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all h-10 w-full">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Cari (Nama, Kode Pendaftaran, PT, Prodi)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-full text-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                
                <div className="w-full relative shadow-sm rounded-lg">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Filter className="w-4 h-4 text-slate-400" />
                  </div>
                  <Select value={filterPt || "ALL"} onValueChange={(v) => { setFilterPt(v); setFilterProdi("ALL"); }}>
                    <SelectTrigger className="w-full pl-9 bg-white border-slate-200 h-10 text-sm font-medium focus:ring-emerald-500/20 focus:border-emerald-500">
                      <SelectValue placeholder="Semua Perguruan Tinggi" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="ALL" className="font-bold text-emerald-800">Semua Perguruan Tinggi</SelectItem>
                      {optionsData?.pts.map((pt, idx) => (
                        <SelectItem key={idx} value={pt.nama_pt} className="font-medium">{pt.nama_pt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full relative shadow-sm rounded-lg">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Filter className="w-4 h-4 text-slate-400" />
                  </div>
                  <Select value={filterProdi || "ALL"} onValueChange={(v) => setFilterProdi(v)}>
                    <SelectTrigger className="w-full pl-9 bg-white border-slate-200 h-10 text-sm font-medium focus:ring-emerald-500/20 focus:border-emerald-500">
                      <SelectValue placeholder="Semua Program Studi" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="ALL" className="font-bold text-emerald-800">Semua Program Studi</SelectItem>
                      {uniqueProdiNames.map((namaProdi, idx) => (
                        <SelectItem key={idx} value={namaProdi} className="font-medium">{namaProdi}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-bold text-slate-600 w-[150px]">Kode Pendaftaran</TableHead>
                      <TableHead className="font-bold text-slate-600">Nama Pendaftar</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center w-[120px]">Nilai Akhir</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center w-[120px]">Kluster</TableHead>
                      <TableHead className="font-bold text-slate-600">Kampus Diterima</TableHead>
                      <TableHead className="font-bold text-slate-600 w-[100px]">Jenjang</TableHead>
                      <TableHead className="font-bold text-slate-600">Program Studi Diterima</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isFetching ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-48">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
                            <span className="text-sm font-medium">Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginationData?.data && paginationData.data.length > 0 ? (
                      paginationData.data.map((row, i) => (
                        <TableRow key={i} className="hover:bg-emerald-50/30 transition-colors">
                          <TableCell className="font-semibold text-slate-700">{row.kode_pendaftaran || "-"}</TableCell>
                          <TableCell className="font-medium text-slate-800">{row.nama}</TableCell>
                          <TableCell className="text-center font-bold text-emerald-700 text-base">
                            {Number(row.nilai_akhir).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                              row.kluster === 'Afirmasi' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {row.kluster}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-sm font-medium text-slate-700" title={row.nama_pt}>{row.nama_pt}</div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            {row.jenjang || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-sm font-medium text-slate-700" title={row.nama_prodi}>{row.nama_prodi}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-32">
                          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <Search className="w-6 h-6 text-slate-300" />
                            <span className="text-sm font-medium">Belum ada data peserta yang lolos atau data tidak ditemukan.</span>
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
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="font-medium text-slate-600 hover:text-emerald-700">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(paginationData.totalPages, p + 1))} disabled={page === paginationData.totalPages || isFetching} className="font-medium text-slate-600 hover:text-emerald-700">
                      Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cadangan" className="mt-0 outline-none">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-100 bg-emerald-50/50 px-6 py-5">
              <div>
                <CardTitle className="text-lg font-black tracking-wide text-emerald-900">
                  Daftar Peserta Cadangan (Sesuai Urutan)
                </CardTitle>
                <CardDescription className="font-medium text-slate-600">
                  Mereka yang belum mendapatkan kuota, namun siap ditarik jika ada yang mundur.
                </CardDescription>
              </div>
              <Button
                onClick={() => setProsesModalOpen(true)}
                disabled={prosesMutation.isPending || (cadanganData?.data && cadanganData.data.length === 0)}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all font-bold text-[15px] px-6 py-5 rounded-xl border border-orange-600/50 hover:scale-[1.02]"
              >
                {prosesMutation.isPending ? (
                  <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Users className="w-5 h-5 mr-2" />
                )}
                Proses Ambil Cadangan
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6 bg-white">
              <div className="flex items-center space-x-2 border rounded-lg px-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all h-10 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari cadangan (Nama, Kode Pendaftaran)..."
                  value={cadanganSearch}
                  onChange={(e) => setCadanganSearch(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 px-0 h-full text-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-bold text-slate-600 w-[80px] text-center">No. Antrian</TableHead>
                      <TableHead className="font-bold text-slate-600 w-[150px]">Kode Pendaftaran</TableHead>
                      <TableHead className="font-bold text-slate-600">Nama Pendaftar</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center w-[120px]">Nilai Akhir</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center w-[150px]">Kluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingCadangan || isFetchingCadangan ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-48">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
                            <span className="text-sm font-medium">Memuat data cadangan...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : cadanganData?.data && cadanganData.data.length > 0 ? (
                      cadanganData.data.map((row, i) => (
                        <TableRow key={i} className="hover:bg-orange-50/50 transition-colors">
                          <TableCell className="text-center font-black text-slate-400 text-lg">
                            {(cadanganPage - 1) * limit + i + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">{row.kode_pendaftaran || "-"}</TableCell>
                          <TableCell className="font-bold text-slate-800">{row.nama}</TableCell>
                          <TableCell className="text-center font-black text-orange-600 text-base">
                            {Number(row.nilai_akhir).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                              row.kluster === 'Afirmasi' ? 'bg-emerald-800 text-white' : 'bg-blue-800 text-white'
                            }`}>
                              {row.kluster}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32">
                          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <Users className="w-6 h-6 text-slate-300" />
                            <span className="text-sm font-medium">Tidak ada data cadangan saat ini.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {cadanganData && cadanganData.totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    Menampilkan halaman <span className="font-bold text-slate-700">{cadanganData.currentPage}</span> dari <span className="font-bold text-slate-700">{cadanganData.totalPages}</span> (Total: {cadanganData.totalData} cadangan)
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCadanganPage((p) => Math.max(1, p - 1))} disabled={cadanganPage === 1 || isFetchingCadangan} className="font-medium text-slate-600">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCadanganPage((p) => Math.min(cadanganData.totalPages, p + 1))} disabled={cadanganPage === cadanganData.totalPages || isFetchingCadangan} className="font-medium text-slate-600">
                      Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={notifModal.isOpen} onOpenChange={(open) => setNotifModal((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-sm text-center flex flex-col items-center rounded-2xl p-6 border-0 shadow-2xl">
          <DialogHeader className="w-full flex flex-col items-center">
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${notifModal.type === "success" ? "bg-emerald-50" : "bg-red-50"}`}>
              {notifModal.type === "success" ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-800">{notifModal.title}</DialogTitle>
            <DialogDescription className="text-center mt-3 text-sm font-medium text-slate-500">{notifModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center w-full mt-6">
            <Button className={`w-full font-bold text-white rounded-lg ${notifModal.type === "success" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-red-600 hover:bg-red-700"}`} onClick={() => setNotifModal((prev) => ({ ...prev, isOpen: false }))}>Tutup Pesan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={prosesModalOpen} onOpenChange={setProsesModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Proses Ambil Cadangan?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              Sistem akan melakukan hitung ulang. Kuota PT/Prodi yang kosong (akibat ada peserta yang di-set mundur) akan otomatis ditarik dan diisi oleh <span className="text-orange-600 font-bold">peserta cadangan teratas</span>. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel disabled={prosesMutation.isPending} className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); prosesMutation.mutate(); }} 
              disabled={prosesMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md"
            >
              {prosesMutation.isPending ? "Memproses..." : "Ya, Tarik Cadangan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearModalOpen} onOpenChange={setClearModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Bersihkan Hasil Perangkingan?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              Tindakan ini akan mengosongkan <span className="text-orange-600 font-bold">PT Final dan Prodi Final</span> untuk semua peserta yang telah diranking. Data master pendaftar tetap aman dan tidak akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel disabled={clearMutation.isPending} className="font-bold border-slate-200 text-slate-600 rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); clearMutation.mutate(); }} disabled={clearMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md">
              {clearMutation.isPending ? "Membersihkan..." : "Ya, Bersihkan Hasil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 mt-2">
              Tindakan ini akan menghapus <span className="text-red-600 font-bold">secara permanen</span> seluruh data master perangkingan dan hasil alokasi saat ini. Proses ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel disabled={resetMutation.isPending} className="font-bold border-slate-200 text-slate-600 rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); resetMutation.mutate(); }} disabled={resetMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md">
              {resetMutation.isPending ? "Menghapus Data..." : "Ya, Hapus Master"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RankingPage;