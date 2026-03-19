export interface RankingResult {
  id_trx_beasiswa: number;
  nama: string;
  nilai_akhir: number;
  kluster: string;
  id_pt: number | null;
  id_prodi: number | null;
  nama_pt?: string;
  nama_prodi?: string;
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