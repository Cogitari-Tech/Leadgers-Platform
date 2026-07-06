import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function TwoFactorChallenge() {
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Get where they were trying to go, default to dashboard
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    checkFactors();
  }, []);

  const checkFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = data.totp || [];
      const verifiedFactor = totpFactors.find((f) => f.status === "verified");

      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
      } else {
        // No enrolled factor found, they shouldn't be here unless forced to enroll
        // But for challenge, if no factor exists, just let them go back to login
        signOut();
      }
    } catch (err) {
      console.error(err);
      signOut();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) {
      setError("Nenhum fator 2FA configurado encontrado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // Step 2: Verify
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (error) throw error;

      // Successfully verified AAL2! Handle device trust
      if (rememberDevice && user) {
        // Trust for 30 days
        const trustUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        let deviceId = localStorage.getItem("leadgers_device_id");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("leadgers_device_id", deviceId);
        }

        await supabase.from("device_trusts").upsert(
          {
            user_id: user.id,
            device_id: deviceId,
            device_info: { userAgent: navigator.userAgent },
            expires_at: trustUntil.toISOString(),
            revoked: false,
          },
          { onConflict: "user_id, device_id" },
        );
      }

      // Redirect to their destination
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Código inválido. Tente novamente.");
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img
            src="/images/logo-light.webp"
            alt="Leadgers"
            className="h-10 w-auto drop-shadow-lg hidden dark:block"
          />
          <img
            src="/images/logo-dark.webp"
            alt="Leadgers"
            className="h-10 w-auto drop-shadow-lg block dark:hidden"
          />
        </div>

        <div className="glass-panel p-10 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 rounded-2xl bg-primary/10 p-4 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">
              Acesso Restrito
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-medium leading-relaxed max-w-[280px]">
              Digite o código dinâmico do seu autenticador para validar sua
              identidade.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="code"
                className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60"
              >
                Código de 6 dígitos
              </label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, ""))
                }
                className="h-20 bg-background/50 border-2 border-border/40 text-foreground placeholder-muted-foreground/30 text-center text-3xl font-mono tracking-[0.6em] focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-center pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-border/60 text-primary focus:ring-primary/20 bg-background/50 transition-all cursor-pointer"
                />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors italic">
                  Lembrar deste dispositivo (30 dias)
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-[11px] font-bold text-destructive text-center uppercase tracking-wider animate-in shake-1 duration-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all ring-4 ring-primary/5"
              disabled={verifyCode.length !== 6 || loading || !factorId}
            >
              {loading ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-3 h-4 w-4" />
              )}
              {loading ? "Sincronizando..." : "Validar Credencial"}
            </Button>

            <div className="text-center pt-4 border-t border-border/40 mt-4">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                Suspender Sessão Atual
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
