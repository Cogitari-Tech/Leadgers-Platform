// SEO tags for parser: <title>Leadgers</title> <meta name="description" content="Compliance infrastructure for startups" />
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  GitBranch,
  Lock,
  Menu,
  X,
  Database,
  Eye,
  Activity,
  ChevronRight,
  Zap,
} from "lucide-react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    document.title =
      "Leadgers Governance | A infraestrutura de compliance da sua startup";

    // SEO Meta Tags update logic for SPA
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let el = document.querySelector(
        isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta(
      "description",
      "Controle fluxos de caixa, valide a contabilidade e crie trilhas de auditoria automáticas com a plataforma SaaS all-in-one para governança empresarial.",
    );
    updateMeta("og:title", "Leadgers Governance", true);
    updateMeta(
      "og:description",
      "A infraestrutura de compliance da sua startup. Controle fluxos, valide contabilidade e esteja pronto para due diligence.",
      true,
    );
    updateMeta("og:image", "https://leadgers.com/images/og-main.webp", true);
    updateMeta("og:type", "website", true);
    updateMeta("twitter:card", "summary_large_image");

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const navTo = (hashOrRoute: string) => {
    setMobileMenuOpen(false);
    if (hashOrRoute.startsWith("#")) {
      const el = document.querySelector(hashOrRoute);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (hashOrRoute.startsWith("http")) {
      window.open(hashOrRoute, "_blank");
    } else {
      navigate(hashOrRoute);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden text-foreground page-transition">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "py-3 bg-[hsl(var(--glass-bg))] backdrop-blur-xl border-[hsl(var(--glass-border))] shadow-sm"
            : "py-5 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navTo("/")}
              className="flex items-center gap-3"
              aria-label="Leadgers Governance Home"
            >
              <img
                src="/images/logo-light.webp"
                alt="Leadgers"
                className="h-10 w-auto hidden dark:block"
              />
              <img
                src="/images/logo-dark.webp"
                alt="Leadgers"
                className="h-10 w-auto block dark:hidden"
              />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 px-2 py-0.5 border-l border-border ml-2 hidden sm:block">
                Governance
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <button
                onClick={() => navTo("#produto")}
                className="hover:text-foreground transition-colors"
              >
                Produto
              </button>
              <button
                onClick={() => navTo("#integracoes")}
                className="hover:text-foreground transition-colors"
              >
                Integrações
              </button>
              <button
                onClick={() => navTo("#compliance")}
                className="hover:text-foreground transition-colors"
              >
                Safety & Compliance
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => navTo("/login")}
              className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2 transition-colors rounded-lg hover:bg-muted/50"
            >
              Entrar
            </button>
            <button
              onClick={() => navTo("/register")}
              className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              Solicitar Acesso
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-2xl flex flex-col p-4 gap-2 animate-in slide-in-from-top-4">
            <button
              onClick={() => navTo("#produto")}
              className="text-sm font-bold text-left p-3 hover:bg-muted rounded-xl"
            >
              Produto
            </button>
            <button
              onClick={() => navTo("#integracoes")}
              className="text-sm font-bold text-left p-3 hover:bg-muted rounded-xl"
            >
              Integrações
            </button>
            <button
              onClick={() => navTo("#compliance")}
              className="text-sm font-bold text-left p-3 hover:bg-muted rounded-xl"
            >
              Safety & Compliance
            </button>
            <hr className="border-border/30 my-2" />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navTo("/login")}
                className="text-sm font-bold text-center py-3 bg-muted rounded-xl"
              >
                Entrar
              </button>
              <button
                onClick={() => navTo("/register")}
                className="text-sm font-bold text-center py-3 bg-primary text-primary-foreground rounded-xl"
              >
                Solicitar Acesso
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ─── 2. HERO SECTION ───────────────────────────────────── */}
        <section className="relative pt-40 pb-32 md:pt-48 md:pb-40 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background rounded-full opacity-50 blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <button
              onClick={() => navTo("#compliance")}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-background border border-border/50 text-muted-foreground rounded-full text-xs font-semibold hover:border-primary/50 transition-colors mb-8 shadow-sm backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Auditoria Enterprise-Grade para Startups
              <ChevronRight className="w-3 h-3 ml-1" />
            </button>

            <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-bold tracking-tighter leading-[1.05] text-foreground mb-6 font-display">
              A infraestrutura de compliance <br className="hidden md:block" />
              da sua startup.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Elimine planilhas caóticas e consolide sua governança. Controle o
              fluxo de caixa, valide a contabilidade e esteja sempre pronto para
              due diligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navTo("/register")}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-sm md:text-base hover:brightness-110 transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Solicitar Acesso
              </button>
              <button
                onClick={() => navTo("#produto")}
                className="px-8 py-4 bg-background border border-border font-bold rounded-xl text-sm md:text-base hover:bg-muted/50 transition-all shadow-sm active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Ver Plataforma
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Acesso
                exclusivo B2B
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Avaliação
                de setup inclusa
              </span>
            </p>
          </motion.div>

          <motion.div
            style={{ y: yHero }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-5xl mx-auto mt-20 relative z-10"
          >
            <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-[hsl(var(--glass-bg))] backdrop-blur-2xl shadow-2xl overflow-hidden soft-shadow relative">
              <div className="h-10 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex h-[400px] md:h-[600px] bg-background">
                <div className="w-16 md:w-56 border-r border-border/50 p-4 flex flex-col gap-4 bg-muted/10">
                  <div className="h-8 w-3/4 bg-muted/50 rounded hidden md:block mb-4" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 shrink-0" />
                      <div className="h-4 w-full bg-muted/50 rounded hidden md:block" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-1/3 bg-muted/50 rounded" />
                    <div className="h-8 w-32 bg-primary/10 rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-28 bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between soft-shadow">
                      <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                        Compliance Score
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-display font-black text-emerald-500">
                          98%
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold mb-1.5 flex items-center bg-emerald-500/10 px-1 py-0.5 rounded">
                          <ArrowRight className="w-2.5 h-2.5 -rotate-45" />{" "}
                          +2.4%
                        </span>
                      </div>
                    </div>
                    <div className="h-28 bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between soft-shadow">
                      <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                        Risco Ativo
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="px-2 py-1 mb-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded">
                          MÉDIO
                        </span>
                        <span className="text-sm font-bold text-foreground mb-1">
                          3 Achados
                        </span>
                      </div>
                    </div>
                    <div className="h-28 bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between soft-shadow">
                      <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                        Runway
                      </span>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-display font-black text-foreground">
                          18
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mb-1.5">
                          meses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/20 border border-border/50 rounded-xl flex flex-col relative overflow-hidden soft-shadow">
                    <div className="absolute inset-0 p-5 flex flex-col gap-3 opacity-80">
                      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground/60 border-b border-border/50 pb-2 uppercase tracking-wide">
                        <span className="w-24">Doc ID</span>
                        <span className="flex-1">Programa</span>
                        <span>Vínculo</span>
                      </div>
                      {[
                        {
                          id: "AUD-001",
                          prog: "SOC2 Compliance",
                          active: true,
                        },
                        { id: "SEC-044", prog: "Análise Vuln.", active: true },
                        { id: "FIN-012", prog: "Fechamento T3", active: false },
                      ].map((row, j) => (
                        <div
                          key={j}
                          className="flex justify-between items-center text-sm font-medium hover:bg-muted/30 p-1.5 -mx-1.5 rounded transition-colors"
                        >
                          <span className="font-mono text-xs w-24 text-muted-foreground">
                            {row.id}
                          </span>
                          <span className="text-foreground flex-1">
                            {row.prog}
                          </span>
                          {row.active ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto relative z-10 glass-card p-4 text-sm font-bold flex items-center justify-center gap-2 border-t border-border/50 text-foreground bg-background/50 backdrop-blur-md">
                      <Activity className="w-4 h-4 text-primary" /> Visualização
                      Real-Time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── 3. SOCIAL PROOF & METRICS ──────────────────────────── */}
        <section className="py-16 border-y border-border/50 bg-muted/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-primary pattern-bg-background pattern-size-4 pattern-opacity-5" />

          <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
            <h2 className="text-center text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-10">
              Governança confiada por empresas inovadoras
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 select-none">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground flex items-center gap-2 hover:text-primary transition-colors">
                <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background text-xs font-bold rotate-45 transform">
                  <span className="-rotate-45">N</span>
                </div>{" "}
                NEXUS
              </span>
              <span className="text-xl md:text-2xl font-black font-display text-foreground italic flex items-center gap-1.5 hover:text-amber-500 transition-colors">
                <Zap className="w-6 h-6 fill-current" /> FINTECH LABS
              </span>
              <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-foreground hover:text-emerald-500 transition-colors">
                ACME.
              </span>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground hover:text-indigo-500 transition-colors">
                AETHER
              </span>
              <span className="text-lg md:text-xl font-bold tracking-[0.3em] text-foreground border-2 border-foreground px-3 py-1 hover:text-rose-500 hover:border-rose-500 transition-colors">
                VORTEX
              </span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-center text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground/60 mb-8">
              A base da confiança operacional
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black font-display text-foreground">
                  1M+
                </span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  Eventos Auditados
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black font-display text-foreground">
                  0
                </span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  Violações de Dados
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black font-display text-foreground">
                  99.99%
                </span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  Uptime Garantido
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black font-display text-primary">
                  AES-256
                </span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
                  Criptografia Base
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. KEY BENEFITS ───────────────────────────────────── */}
        <section id="produto" className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-4">
                Estruture antes de quebrar.
              </h2>
              <p className="text-lg text-muted-foreground">
                O Leadgers transforma o caos do crescimento acelerado em
                processos maduros, auditáveis e previsíveis.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Eye className="w-5 h-5 text-primary" />,
                  title: "Due Diligence em Minutos",
                  desc: "Gere relatórios de conformidade e auditoria instantaneamente com dados validados e organizados, poupando meses de trabalho.",
                },
                {
                  icon: <BarChart3 className="w-5 h-5 text-primary" />,
                  title: "Visão Financeira Clara",
                  desc: "Acompanhe Burn Rate, Runway e consolide despesas operacionais sem depender de processos manuais.",
                },
                {
                  icon: <ShieldCheck className="w-5 h-5 text-primary" />,
                  title: "Governança Contínua",
                  desc: "Trilhas de auditoria imutáveis, controle hierárquico rígido e alertas precoces contra falhas ou inconsistências.",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. F-PATTERN FEATURES ─────────────────────────────── */}
        <section className="py-24 px-6 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto flex flex-col gap-32">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex-1 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase">
                  <Database className="w-3 h-3" /> Finanças Core
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground leading-[1.1]">
                  Unifique suas <br /> finanças e auditorias.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Conecte o Leadgers aos seus sistemas atuais. Automatize a
                  categorização de despesas e aprovações mantendo uma trilha de
                  auditoria absoluta contra falhas e fraudes internas.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => navTo("/register")}
                    className="font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Explorar módulo financeiro{" "}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
              <div className="flex-1 w-full max-w-lg relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
                  alt="Dashboards"
                  className="relative z-10 w-full rounded-2xl border border-border/50 shadow-2xl sepia-[0.3] hue-rotate-[190deg] saturate-50 dark:saturate-[0.2]"
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex-1 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase">
                  <GitBranch className="w-3 h-3" /> DevSecOps Mapeado
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground leading-[1.1]">
                  Segurança visível <br /> em cada branch.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Mapeamos vulnerabilidades arquiteturais direto do GitHub.
                  Avalie a severidade, correlacione dependências desatualizadas
                  e exija a mitigação imediata nos seus workflows de
                  repositório.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => navTo("/register")}
                    className="font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Inspecionar fluxo de CI/CD{" "}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
              <div className="flex-1 w-full max-w-lg relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <div className="relative z-10 w-full h-[350px] rounded-2xl border-border/50 shadow-2xl overflow-hidden glass-card flex flex-col">
                  <div className="flex items-center border-b border-border/50 p-4 gap-3 bg-muted/40">
                    <GitBranch className="w-5 h-5 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">
                      main / actions / security.yaml
                    </span>
                  </div>
                  <div className="p-6 font-mono text-xs text-muted-foreground leading-loose overflow-hidden opacity-80">
                    <span className="text-emerald-500">import</span>{" "}
                    {"{ analyze_deps }"}{" "}
                    <span className="text-emerald-500">from</span>{" "}
                    "@leadgers/security"
                    <br />
                    <br />
                    <span className="text-primary">export</span> default{" "}
                    <span className="text-primary">function</span> pipeline(){" "}
                    {"{"}
                    <br />
                    &nbsp;&nbsp;const scan = analyze_deps();
                    <br />
                    &nbsp;&nbsp;if (scan.vulnerabilities.length &gt; 0) {"{"}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-destructive">throw</span> new
                    Error("Vulnerability Detected");
                    <br />
                    &nbsp;&nbsp;{"}"}
                    <br />
                    {"}"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5.5 TESTIMONIAL ────────────────────────────────────── */}
        <section className="py-32 px-6 border-b border-border/50 overflow-hidden relative bg-card">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto relative z-10 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted border border-border/50 overflow-hidden ring-8 ring-primary/5 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"
                alt="Carlos S."
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-medium text-foreground leading-tight md:leading-snug mb-10 relative">
              <span className="absolute -top-10 -left-6 md:-left-10 text-8xl text-primary/20 font-serif leading-none">
                "
              </span>
              O Leadgers economizou mais de 40 horas no nosso fechamento
              trimestral. Em vez de perseguir aprovações em planilhas e e-mails
              caóticos, agora possuímos uma única fonte imutável de verdade,
              completamente blindada contra falhas de compliance.
              <span className="absolute -bottom-16 -right-6 md:-right-10 text-8xl text-primary/20 font-serif leading-none">
                "
              </span>
            </h2>
            <div className="flex flex-col items-center justify-center">
              <span className="font-bold text-foreground text-lg">
                Carlos S.
              </span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                Diretor de Compliance e Risco, Fintech Labs
              </span>
            </div>
          </motion.div>
        </section>

        {/* ─── 6. INTEGRATIONS ────────────────────────────────────── */}
        <section id="integracoes" className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              Conectado ao ecossistema <br className="md:hidden" /> que você já
              confia.
            </h2>
            <p className="text-muted-foreground mb-16">
              Governança eficiente requer centralização. Integramos suas fontes
              de dados nativamente.
            </p>

            {/* Marquee representation */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-display text-2xl font-bold">
                <GitBranch className="w-8 h-8" /> GitHub
              </div>
              <div className="flex items-center gap-2 font-display text-2xl font-bold">
                <Database className="w-8 h-8" /> Supabase
              </div>
              <div className="flex items-center gap-2 font-display text-2xl font-bold">
                <Zap className="w-8 h-8" /> Vercel
              </div>
              <div className="flex items-center gap-2 font-display text-2xl font-bold">
                <Activity className="w-8 h-8" /> Stripe
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. TRUST & SECURITY ───────────────────────────────── */}
        <section
          id="compliance"
          className="py-24 px-6 bg-[#0B0F19] text-white border-y border-[#1E293B]"
        >
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="w-16 h-16 bg-primary/20 border border-primary/50 text-primary rounded-2xl mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-white mb-6">
                Segurança de nível enterprise.{" "}
                <br className="hidden md:block" /> Zero Trust por padrão.
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                No Leadgers, consideramos todos os dados corporativos como
                ultra-críticos. Nossa arquitetura foi montada sob os mesmos
                guias de risco de grandes instituições de pagamento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto pt-8">
              <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-xl border border-[#334155]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">
                  Criptografia AES-256 (transit/rest)
                </span>
              </div>
              <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-xl border border-[#334155]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">
                  Log Imutável e Trilhas de Auditoria
                </span>
              </div>
              <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-xl border border-[#334155]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">
                  Enforcement de MFA e IAM restrito
                </span>
              </div>
              <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-xl border border-[#334155]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">
                  Alinhamento nativo SOC2 e LGPD
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. FINAL CTA ──────────────────────────────────────── */}
        <section className="py-32 px-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-primary pattern-bg-background pattern-size-6 pattern-opacity-10" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground mb-6">
              Pronto para estruturar <br className="hidden md:block" /> sua
              governança?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Estruture sua governança agora mesmo. Sem amarras e sem
              necessidade de equipe de integrações.
            </p>

            <button
              onClick={() => navTo("/register")}
              className="px-10 py-5 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:brightness-110 shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
              Solicitar Acesso <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground mt-6 font-medium">
              Acesso exclusivo para convidados corporativos.
            </p>
          </motion.div>
        </section>
      </main>

      {/* ─── 9. FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-background pt-16 pb-8 px-6 text-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex flex-col items-start gap-3 mb-6">
                <img
                  src="/images/logo-light.webp"
                  alt="Leadgers"
                  className="h-6 w-auto hidden dark:block"
                />
                <img
                  src="/images/logo-dark.webp"
                  alt="Leadgers"
                  className="h-6 w-auto block dark:hidden"
                />
              </Link>
              <p className="text-muted-foreground font-medium text-xs leading-relaxed max-w-[200px]">
                Auditoria técnica e compliance moderno para empresas de capital
                fechado e open source.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-foreground font-display">
                Produto
              </span>
              <button
                onClick={() => navTo("#produto")}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
              >
                Features
              </button>
              <button
                onClick={() => navTo("#compliance")}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
              >
                Segurança
              </button>
              <button
                onClick={() => navTo("/register")}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
              >
                Acesso Antecipado
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-foreground font-display">
                Recursos
              </span>
              <Link
                to={user ? "/dashboard/manual-uso" : "/login"}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Documentação
              </Link>
              <a
                href="https://github.com/leadgers-tech"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                GitHub
              </a>
              <button
                onClick={() => navTo("#")}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
              >
                Blog (Em Breve)
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-foreground font-display">
                Empresa
              </span>
              <Link
                to="/termos"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Termos de Uso
              </Link>
              <Link
                to="/privacidade"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Privacidade
              </Link>
              <Link
                to="/disclaimer"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Legal
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-xs text-muted-foreground font-medium">
                © {new Date().getFullYear()} Leadgers Governance. Um produto{" "}
                <strong>Cogitari Tech</strong>. CNPJ 64.460.886/0001-39.
              </span>
            </div>
            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
              <span>support@leadgers.com</span>
              <span>privacy@leadgers.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
