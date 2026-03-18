
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/features/Auth/services/authService";
import { toast } from "sonner";
import { useAuthStore, type AuthUser } from "@/stores/authStore";
import { useMenuStore } from "@/stores/menuStore";
import type { LoginRequest } from "../types/auth";
import LoadingDialog from "@/components/LoadingDialog";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2, RefreshCcw } from "lucide-react";

const loginSchema = z.object({
  user_id: z.string().min(1, { message: "User ID harus diisi" }),
  pin: z.string().min(1, { message: "PIN harus diisi" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginInstansiPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMenus = useMenuStore((state) => state.setMenus);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Captcha States
  const [captchaId, setCaptchaId] = useState<string>("");
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fetchCaptcha = async () => {
    try {
      setCaptchaError("");
      setCaptchaAnswer("");
      const res = await authService.getCaptcha();

      if (res.success && res.data) {
        setCaptchaId(res.data.captchaId);
        setCaptchaQuestion(res.data.question);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (data: LoginFormData) => {
    if (!captchaAnswer) {
      setCaptchaError("Jawaban captcha wajib diisi");
      return;
    }

    setIsLoading(true);
    setCaptchaError("");

    try {
      const payload: LoginRequest & { captchaId: string; answer: number } = {
        user_id: data.user_id,
        pin: data.pin,
        jenis_akun: "instansi",
        captchaId: captchaId,
        answer: parseInt(captchaAnswer),
      };

      const response = await authService.login(payload);

      if (response.success && response.data) {
        toast.success(response.message);

        const authUser: AuthUser = {
          id: response.data.user.id ?? "",
          nama: response.data.user.nama_lengkap ?? "",
          avatar: response.data.user.avatar ?? "",
          email: response.data.user.email ?? "",
          no_hp: response.data.user.no_hp ?? "",
          user_id: response.data.user.user_id ?? "",
          id_lembaga_pendidikan: response.data.user.id_lembaga_pendidikan ?? null,
          lembaga_pendidikan: response.data.user.lembaga_pendidikan ?? null,
          id_role: response.data.user.role.map((role: any) => role.id),
          kode_prov: response.data.user.kode_prov ?? "",
          kode_kab: response.data.user.kode_kab ?? "",
        };

        setAuth(
          authUser,
          response.data.accessToken,
          response.data.refreshToken,
        );

        setMenus(response.data.menus);
        navigate(response.data.redirectPage);
      } else {
        toast.error(response.message || "Gagal melakukan login");
        await fetchCaptcha();
      }
    } catch (error: any) {
      await fetchCaptcha();
      const errorMessage = error?.response?.data?.message || error?.message || "Terjadi kesalahan sistem";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
        {/* Decorative Background Blur - Diubah ke Hijau Tua */}
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-green-700/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />

        <div className="relative w-full max-w-[450px] transition-all duration-500 hover:scale-[1.01]">
          <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl overflow-hidden">
            <CardHeader className="space-y-3 pb-8 pt-10">
              {/* Icon Header - Diubah ke gradient Hijau Tua */}
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-green-700 to-green-500 shadow-lg shadow-green-700/30">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-slate-900">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-center text-slate-500 font-medium">
                Silakan masuk untuk melanjutkan ke beranda <br />
                <span className="text-xs font-medium text-slate-400">Portal Instansi</span>
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(handleLogin)}>
              <CardContent className="space-y-6">
                
                {/* Username Input */}
                <div className="space-y-2.5">
                  <Label htmlFor="user_id" className="text-slate-700 font-semibold ml-1">Username</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-green-700" />
                    <Input
                      id="user_id"
                      type="text"
                      placeholder="Masukkan Username"
                      className={`h-12 border-slate-200 bg-slate-50/50 pl-12 text-slate-900 placeholder:text-slate-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-700/10 rounded-xl transition-all font-medium ${errors.user_id ? "border-red-500" : ""}`}
                      {...register("user_id")}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.user_id && (
                    <span className="text-xs text-red-500 font-medium pl-1">{errors.user_id.message}</span>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2.5">
                  <Label htmlFor="pin" className="text-slate-700 font-semibold ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-green-700" />
                    <Input
                      id="pin"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`h-12 border-slate-200 bg-slate-50/50 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-700/10 rounded-xl transition-all font-medium ${errors.pin ? "border-red-500" : ""}`}
                      {...register("pin")}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-green-700 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.pin && (
                    <span className="text-xs text-red-500 font-medium pl-1">{errors.pin.message}</span>
                  )}
                </div>

                {/* Captcha Section */}
                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold ml-1">Verifikasi Keamanan</Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                    <div className="flex items-center justify-center bg-green-50/50 border border-green-200 text-green-700 font-black text-lg tracking-widest rounded-xl h-12 px-6 shadow-sm select-none w-full sm:w-auto">
                      {captchaQuestion || "..."}
                    </div>
                    
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <Input
                          type="number"
                          placeholder="Hasil"
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value)}
                          disabled={isLoading}
                          className={`h-12 rounded-xl bg-slate-50/50 pl-4 text-center font-bold text-lg transition-all focus:bg-white focus:ring-4 focus:ring-green-700/10 ${captchaError ? "border-red-500 focus:border-red-500 focus-visible:ring-red-500/20" : "border-slate-200 focus:border-green-700"}`}
                        />
                      </div>
                      
                      <button
                        type="button"
                        className="shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-all duration-300 shadow-sm"
                        onClick={fetchCaptcha}
                        title="Muat ulang kode"
                        disabled={isLoading}
                      >
                        <RefreshCcw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {captchaError && (
                    <span className="text-xs text-red-500 font-medium pl-1 animate-pulse">{captchaError}</span>
                  )}
                </div>

                {/* Action Button - Diubah ke Hijau Tua */}
                <Button 
                  className="w-full h-12 mt-6 bg-green-700 hover:bg-green-800 text-white font-bold text-base rounded-xl shadow-lg shadow-green-700/25 transition-all active:scale-[0.98] disabled:opacity-70" 
                  type="submit"
                  disabled={isLoading || !captchaId}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Masuk Sekarang'}
                </Button>
              </CardContent>

              {/* Footer text */}
              <div className="px-6 pb-8 pt-2 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  &copy; {new Date().getFullYear()} Instansi Anda. <br />
                  All rights reserved.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
      
      <LoadingDialog open={isLoading} title="Sedang mengautentikasi..." />
    </>
  );
};

export default LoginInstansiPage;
