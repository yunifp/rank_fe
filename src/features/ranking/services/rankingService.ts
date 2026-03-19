import axiosInstanceJson from "@/lib/axiosInstanceJson";
import axiosInstanceFormData from "@/lib/axiosInstanceFormData";
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api";
import type { RankingResponse, RankingPaginatedResponse, FilterOptionData } from "../types/ranking";

export const rankingService = {
  uploadData: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstanceFormData.post<RankingResponse>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/upload`,
      formData
    );
    return response.data;
  },

  prosesRanking: async () => {
    const response = await axiosInstanceJson.post<RankingResponse>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/proses`,
      {},
      { timeout: 60000 }
    );
    return response.data;
  },

  getHasilRanking: async (params?: { page: number; limit: number; search: string; pt: string; prodi: string }) => {
    const response = await axiosInstanceJson.get<RankingPaginatedResponse>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/hasil`,
      { params }
    );
    return response.data.data;
  },

  downloadHasil: async (params?: { search: string; pt: string; prodi: string }) => {
    const response = await axiosInstanceJson.get(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/download-hasil`,
      {
        params,
        responseType: "blob",
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "hasil_perangkingan.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  resetData: async () => {
    const response = await axiosInstanceJson.delete<RankingResponse>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/reset`
    );
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await axiosInstanceJson.get<{ data: FilterOptionData }>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/options`
    );
    return response.data.data;
  },

  clearRankingData: async () => {
    const response = await axiosInstanceJson.put<RankingResponse>(
      `${BEASISWA_SERVICE_BASE_URL}/ranking/clear`
    );
    return response.data;
  },
    
};