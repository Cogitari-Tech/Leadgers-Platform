import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../config/supabase";
import { Input } from "../../../shared/components/ui/Input";
import { CheckCircle2, ShieldAlert, Loader2, Smartphone } from "lucide-react";

export function TwoFactorSetup() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const factorIdRef = useRef(factorId);
  const isEnrolledRef = useRef(isEnrolled);

  useEffect(() => {
    factorIdRef.current = factorId;
  }, [factorId]);

  useEffect(() => {
    isEnrolledRef.current = isEnrolled;
  }, [isEnrolled]);

  useEffect(() => {
    // Cleanup unverified factor when component unmounts
    return () => {
      if (factorIdRef.current && !isEnrolledRef.current) {
        supabase.auth.mfa
          .unenroll({ factorId: factorIdRef.current })
          .catch((err) => {
            console.error("Failed to cleanup unverified 2FA factor:", err);
          });
      }
    };
  }, []);

  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = data.all || [];
      const enrolled = totpFactors.some(
        (factor) => factor.status === "verified",
      );
      setIsEnrolled(enrolled);

      if (enrolled) {
        // Find the verified factor ID
        const verifiedFactor = totpFactors.find((f) => f.status === "verified");
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
        }
      }
    } catch (err) {
      console.error("Error checking MFA status:", err);
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    setError("");

    try {
      // Clean up any existing unverified totp factors first
      // This prevents the "already enrolled" error if user left page before verifying previously
      const { data: listData } = await supabase.auth.mfa.listFactors();
      const unverifiedFactors = (listData?.all || []).filter(
        (f) => f.status === "unverified" && f.factor_type === "totp",
      );

      for (const factor of unverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setUri(data.totp.uri);
    } catch (err) {
      console.error("[2FA Enrollment Error]:", err);
      let errMsg = "Falha ao iniciar configuração do 2FA.";
      if (err instanceof Error) {
        errMsg = err.message;
        if (err.message.includes("not enabled")) {
          errMsg =
            "O Autenticador TOTP não foi ativado no painel do banco de dados de autenticação. Confirme se a funcionalidade MFA está habilitada.";
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Challenge
      const challengeCode = await supabase.auth.mfa.challenge({ factorId });
      if (challengeCode.error) throw challengeCode.error;

      // Step 2: Verify
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeCode.data.id,
        code: verifyCode,
      });

      if (error) throw error;

      setIsEnrolled(true);
    } catch (err) {
      console.error("[2FA Verification Error]:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Código inválido. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const unenroll = async () => {
    if (!factorId) return;
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      setIsEnrolled(false);
      setFactorId(null);
      setQrCode(null);
      setSecret(null);
      setVerifyCode("");
    } catch (err) {
      console.error("2FA Unenroll Error:", err);
      setError(err instanceof Error ? err.message : "Falha ao desativar 2FA.");
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <div className="p-8 w-full h-full flex flex-col justify-center animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary ring-4 ring-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Proteção Máxima Ativada
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Sua conta está protegida com a Autenticação de Dois Fatores (2FA).
              Um código será solicitado em novos logins.
            </p>
          </div>
          <div className="pt-4 w-full">
            <button
              onClick={unenroll}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive/5 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Desativar Camada de Segurança</span>
            </button>
            {error && (
              <p className="mt-4 text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full h-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="rounded-2xl bg-primary/10 p-4 text-primary ring-4 ring-primary/5">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {qrCode ? "Escaneie o QR Code" : "Proteja sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {qrCode
              ? "Use o Google Authenticator ou Authy para escanear o código abaixo e ativar a segurança."
              : "Adicione uma camada extra de segurança exigindo um código temporário no seu celular para entrar na plataforma."}
          </p>
        </div>

        {!qrCode ? (
          <div className="w-full pt-4">
            <button
              onClick={startEnrollment}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              <span>Iniciar Configuração</span>
            </button>
            {error && (
              <div className="mt-6 text-left p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                <p className="text-xs text-destructive font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Erro de Configuração
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                  {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl glass-card shadow-inner">
              <div className="bg-white p-3 rounded-xl shadow-2xl">
                <QRCodeSVG value={uri || ""} size={180} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Código de Configuração Manual
                </p>
                <code className="px-4 py-2 bg-background border border-border/60 rounded-lg text-sm font-mono font-bold text-foreground block tracking-wider">
                  {secret}
                </code>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs font-medium flex items-start gap-3 text-left">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Não saia desta página</strong> antes de validar o código
                abaixo. Se você fechar ou recarregar, precisará reiniciar o
                processo.
              </p>
            </div>

            <form onSubmit={verifyEnrollment} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="code"
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Digite o código de 6 dígitos
                </label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000 000"
                  value={verifyCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setVerifyCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="text-center text-3xl tracking-[0.6em] font-mono h-20 rounded-2xl"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-destructive font-bold text-center">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={unenroll}
                  disabled={loading}
                  className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={verifyCode.length !== 6 || loading}
                  className="py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <span>Verificar e Ativar</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
