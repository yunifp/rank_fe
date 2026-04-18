export interface RankingResult {
  id_trx_beasiswa: number;
  kode_pendaftaran?: string; 
  nama: string;
  nilai_akhir: number;
  kluster: string;
  id_pt: number | null;
  id_prodi: number | null;
  nama_pt?: string;
  jenjang?: string; 
  nama_prodi?: string;
  status_mundur?: string;
}

export interface PaginatedData {
  data: RankingResult[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

export interface RankingResponse {
  success: boolean;
  message: string;
  data?: RankingResult[];
}

export interface RankingPaginatedResponse {
  success: boolean;
  message: string;
  data: PaginatedData;
}

export interface FilterOptionData {
  pts: { id_pt: number; nama_pt: string }[];
  prodis: { id_prodi: number; id_pt: number; nama_prodi: string }[];
}

export interface SisaKuotaResult {
  id_pt: number;
  id_prodi: number;
  nama_pt: string;
  nama_prodi: string;
  kuota_total: number;
  kuota_terpakai: number;
  sisa_kuota: number;
}

export interface PaginatedSisaKuotaData {
  data: SisaKuotaResult[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

export interface SisaKuotaPaginatedResponse {
  success: boolean;
  message: string;
  data: PaginatedSisaKuotaData;
}

export interface DashboardStats {
  data_mentah: {
    total: number;
    afirmasi: number;
    reguler: number;
  };
  data_proses: {
    total: number;
    afirmasi: number;
    reguler: number;
    mundur: number;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}