import {
  /* aria-label */
  BookOpen,
  ShieldCheck,
  FileSearch,
  Wallet,
  GitBranch,
  Settings,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function UsageManual() {
  const sections = [
    {
      title: "Painel de Governança",
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/5",
      content:
        "Sua central de comando. Visualize indicadores críticos de risco, conformidade e saúde financeira em tempo real. Use os KPICards para navegar rapidamente para as áreas de atenção.",
      tips: [
        "Clique nos cartões para detalhes",
        "Acompanhe o ranking de risco dos projetos",
      ],
    },
    {
      title: "Gerir Auditorias",
      icon: FileSearch,
      color: "text-amber-500",
      bg: "bg-amber-500/5",
      content:
        "Módulo para criação e execução de ciclos de auditoria. Você pode usar frameworks pré-definidos (ISO, LGPD) ou criar checklists personalizados.",
      tips: [
        "Vincule evidências a cada item",
        "Gere achados (findings) para não-conformidades",
      ],
    },
    {
      title: "Garantir Conformidade",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5",
      content:
        "Estruture sua matriz de conformidade. Mapeie controles, avalie a eficácia e garanta que sua organização atenda aos padrões regulatórios exigidos.",
      tips: [
        "Mantenha o status atualizado sempre",
        "Revise a matriz de riscos periodicamente",
      ],
    },
    {
      title: "Gestão Financeira",
      icon: Wallet,
      color: "text-sky-500",
      bg: "bg-sky-500/5",
      content:
        "Controle absoluto sobre o caixa. Monitore o Burn Rate de projetos, visualize movimentações mensais e gerencie contas bancárias integradas.",
      tips: [
        "Cadastre todas as contas da organização",
        "Acompanhe o fluxo de caixa projetado",
      ],
    },
    {
      title: "Automação GitHub",
      icon: GitBranch,
      color: "text-zinc-500",
      bg: "bg-zinc-500/5",
      content:
        "Segurança contínua no código. Integre seus repositórios para monitorar vulnerabilidades, gerenciar organizações e vincular issues a achados de auditoria.",
      tips: [
        "Sincronize com o GitHub periodicamente",
        "Crie issues diretamente de achados críticos",
      ],
    },
    {
      title: "Administração",
      icon: Settings,
      color: "text-muted-foreground",
      bg: "bg-muted/10",
      content:
        "Configurações de equipe e sistema. Gerencie usuários, cargos (roles), faturamento via Stripe e informações da organização.",
      tips: [
        "Use convites por e-mail para membros",
        "Verifique o status do plano em Configurações",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-foreground/5 p-12 lg:p-16 border border-border/40">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            Guia do Sistema
          </div>
          <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-foreground font-display uppercase italic">
            Manual <br />
            <span className="text-primary">Leadgers Governance</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
            Bem-vindo ao centro de conhecimento. Entenda como cada engrenagem
            funciona para garantir sua excelência operacional.
          </p>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="glass-card soft-shadow rounded-2xl p-8 hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <section.icon className="w-24 h-24" />
            </div>
            <div
              className={`w-14 h-14 rounded-2xl ${section.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <section.icon className={`w-7 h-7 ${section.color}`} />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3 font-display uppercase tracking-tight">
              {section.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
              {section.content}
            </p>
            <div className="space-y-3 pt-6 border-t border-border/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                Dicas Pro
              </span>
              {section.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs font-bold text-foreground/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between p-10 rounded-3xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-6 mb-8 md:mb-0">
          <div className="p-4 bg-primary/20 rounded-2xl shadow-inner">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-black text-foreground uppercase tracking-tight">
              Ainda com dúvidas?
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Consulte nosso suporte técnico a qualquer momento.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@leadgers.com"
          className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-2"
        >
          Contatar Suporte
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
