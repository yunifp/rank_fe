/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import type { IPerguruanTinggi } from "@/types/master";
import useHasAccess from "@/hooks/useHasAccess";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal"; 

const PerguruanTinggiPage = () => {
  useRedirectIfHasNotAccess("R");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canCreate = useHasAccess("C"); 

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // State untuk modal Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Mengambil Data
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["perguruan-tinggi", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return masterService.getPerguruanTinggiByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: IPerguruanTinggi[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  // Fungsi Panggil API Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => masterService.deletePerguruanTinggi(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus perguruan tinggi.");
      queryClient.invalidateQueries({ queryKey: ["perguruan-tinggi"] });
      // Tutup modal setelah berhasil
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Gagal menghapus perguruan tinggi."
      );
      // Tutup modal jika gagal
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    },
  });

  // Handler yang dikirim ke tabel (kolom)
  const handleDeleteClick = useCallback((id: number) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  // Eksekusi hapus di Modal
  const confirmDelete = () => {
    if (selectedId !== null) {
      deleteMutation.mutate(selectedId);
    }
  };

  // Injeksikan handleDeleteClick ke columns
  const columns = useMemo(() => getColumns(handleDeleteClick), [handleDeleteClick]);

  return (
    <>
      <CustBreadcrumb
        items={[{ name: "Perguruan Tinggi", url: "/perguruan-tinggi" }]}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="text-xl font-semibold">Perguruan Tinggi</p>
        {canCreate && (
          <Button onClick={() => navigate("/master/perguruan-tinggi/create")}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Perguruan Tinggi
          </Button>
        )}
      </div>

      <div className="mt-3">
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={data}
          pageCount={totalPages}
          pageIndex={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          searchValue={search}
          onSearchChange={(value) => setSearch(value)}
        />
      </div>

      {/* PERBAIKAN: Gunakan props 'open' (bukan 'isOpen') dan hapus 'isLoading' */}
      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedId(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default PerguruanTinggiPage;