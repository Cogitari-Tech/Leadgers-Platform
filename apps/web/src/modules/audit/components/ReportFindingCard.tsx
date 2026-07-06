import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Trash2,
  ChevronDown,
  Code2,
  Link,
  AlertTriangle,
  Search,
  Calendar,
  Users,
  Mail,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import type {
  ReportFinding,
  Finding5W2H,
  FindingRiskLevel,
  FindingStatus,
  TaskCategory,
  ImpactArea,
} from "../types/audit.types";
import { ExternalLink } from "lucide-react";
import type { TenantMemberOption } from "../hooks/useTenantMembers";

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface ReportFindingCardProps {
  finding: ReportFinding;
  index: number;
  onUpdate: (id: string, updates: Partial<ReportFinding>) => void;
  onUpdate5W2H: (id: string, field: keyof Finding5W2H, value: string) => void;
  onRemove: (id: string) => void;
  tenantMembers?: TenantMemberOption[];
  membersLoading?: boolean;
}

const RISK_LEVELS: {
  value: FindingRiskLevel;
  label: string;
  activeClass: string;
  inactiveClass: string;
  activeColor: string;
}[] = [
  {
    value: "critical",
    label: "Crítico",
    activeClass:
      "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/20",
    inactiveClass:
      "hover:bg-destructive/10 hover:text-destructive border-border bg-muted/20",
    activeColor: "hsl(var(--destructive))",
  },
  {
    value: "high",
    label: "Alto",
    activeClass:
      "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20",
    inactiveClass:
      "hover:bg-primary/10 hover:text-primary border-border bg-muted/20",
    activeColor: "hsl(var(--primary))",
  },
  {
    value: "medium",
    label: "Médio",
    activeClass:
      "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20",
    inactiveClass:
      "hover:bg-amber-500/10 hover:text-amber-500 border-border bg-muted/20",
    activeColor: "#f59e0b",
  },
  {
    value: "low",
    label: "Baixo",
    activeClass:
      "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20",
    inactiveClass:
      "hover:bg-emerald-500/10 hover:text-emerald-500 border-border bg-muted/20",
    activeColor: "#10b981",
  },
];

const STATUS_OPTIONS: {
  value: FindingStatus;
  label: string;
  activeClass: string;
  inactiveClass: string;
  activeColor: string;
}[] = [
  {
    value: "open",
    label: "Aberto",
    activeClass:
      "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10",
    inactiveClass:
      "hover:bg-foreground/10 hover:text-foreground border-border bg-muted/20",
    activeColor: "hsl(var(--foreground))",
  },
  {
    value: "in_progress",
    label: "Em Tratamento",
    activeClass:
      "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20",
    inactiveClass:
      "hover:bg-primary/10 hover:text-primary border-border bg-muted/20",
    activeColor: "hsl(var(--primary))",
  },
  {
    value: "resolved",
    label: "Resolvido",
    activeClass:
      "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/20",
    inactiveClass:
      "hover:bg-emerald-500/10 hover:text-emerald-500 border-border bg-muted/20",
    activeColor: "#059669",
  },
  {
    value: "accepted",
    label: "Aceito",
    activeClass:
      "bg-muted-foreground text-background border-muted-foreground shadow-lg shadow-muted-foreground/20",
    inactiveClass:
      "hover:bg-muted-foreground/10 hover:text-muted-foreground border-border bg-muted/20",
    activeColor: "hsl(var(--muted-foreground))",
  },
];

const TASK_TYPES: { value: TaskCategory; label: string }[] = [
  { value: "Frontend Bug", label: "Interface (Frontend)" },
  { value: "Backend Logic", label: "Lógica de Processamento" },
  { value: "Security Vuln", label: "Risco de Segurança" },
  { value: "Database", label: "Dados e Persistência" },
  { value: "DevOps/CI-CD", label: "Pipeline e Operações" },
  { value: "Code Quality", label: "Débito Técnico / Código" },
  { value: "Performance", label: "Performance / Escala" },
  { value: "Documentation", label: "Falta de Documentação" },
  { value: "Compliance", label: "Não Conformidade Legal" },
  { value: "Infrastructure", label: "Arquitetura / Infra" },
  { value: "Dependency", label: "Gestão de Dependências" },
  { value: "Architecture", label: "Arquitetura e Design" },
  { value: "Product UI/UX", label: "Produto / UI-UX" },
  { value: "Growth/Marketing", label: "Growth / Marketing" },
  { value: "Sales/CRM", label: "Vendas / CRM" },
  { value: "Customer Success", label: "Customer Success" },
  { value: "HR/Recruitment", label: "RH / Recrutamento" },
  { value: "Finance/Billing", label: "Financeiro / Billing" },
  { value: "Legal/Privacy", label: "Jurídico / Privacidade" },
  { value: "Data Science/AI", label: "Data Science / AI" },
];

const IMPACT_AREAS: ImpactArea[] = [
  "Segurança",
  "Operacional",
  "Jurídico",
  "Privacidade",
  "Financeiro",
  "Reputacional",
  "Estratégico",
  "Experiência do Usuário",
  "Conformidade Regulatória",
  "Recursos Humanos",
];

const TEXT_5W2H_FIELDS: {
  key: keyof Finding5W2H;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "what",
    label: "Objeto (O que foi identificado)",
    placeholder: "Descreva detalhadamente o achado ou não conformidade...",
  },
  {
    key: "why",
    label: "Causa (Por que ocorreu)",
    placeholder: "Identifique a causa raiz ou justificativa técnica...",
  },
  {
    key: "where",
    label: "Local (Onde foi detectado)",
    placeholder: "Módulo, repositório, endpoint ou infraestrutura afetada...",
  },
  {
    key: "how",
    label: "Plano de Ação (Como resolver)",
    placeholder: "Passos detalhados para a correção do problema...",
  },
  {
    key: "howMuch",
    label: "Impacto (Custo/Risco)",
    placeholder:
      "Estimativa de esforço, custo financeiro ou nível de criticidade...",
  },
];

// ─── Member Selector Component ─────────────────────────────
function MemberSelector({
  value,
  members,
  loading,
  onChange,
  onEmailNotify,
}: {
  value: string;
  members: TenantMemberOption[];
  loading: boolean;
  onChange: (name: string) => void;
  onEmailNotify?: (email: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMember = members.find((m) => m.name === value);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
        <Users className="w-3 h-3" /> Responsabilidade (Quem deve agir)
      </label>
      <div
        className="w-full text-sm font-medium text-foreground bg-muted/40 p-3 rounded-lg border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedMember ? (
            <>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-primary">
                  {selectedMember.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-foreground text-sm truncate block">
                  {selectedMember.name}
                </span>
                <span className="text-[10px] text-muted-foreground/60 truncate block">
                  {selectedMember.email}
                </span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground/40 text-sm">
              {value || "Selecionar responsável..."}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          {/* Search */}
          <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground/40" />
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-xs w-full py-1 placeholder:text-muted-foreground/30"
              placeholder="Buscar membro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Member list */}
          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground/40 text-xs">
                Carregando membros...
              </div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    value === m.name
                      ? "bg-primary text-white"
                      : "hover:bg-muted text-foreground"
                  }`}
                  onClick={() => {
                    onChange(m.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      value === m.name ? "bg-white/20" : "bg-primary/10"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold ${value === m.name ? "text-white" : "text-primary"}`}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{m.name}</div>
                    <div
                      className={`text-[10px] truncate ${value === m.name ? "text-white/70" : "text-muted-foreground/60"}`}
                    >
                      {m.email} • {m.role}
                    </div>
                  </div>
                  {value === m.name && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground/40 text-[10px] uppercase font-bold italic">
                Nenhum membro encontrado
              </div>
            )}
          </div>

          {/* Manual input option */}
          <div className="border-t border-border/50 p-2">
            <input
              className="bg-transparent border-none outline-none text-xs w-full py-1.5 px-2 placeholder:text-muted-foreground/30"
              placeholder="Ou digite manualmente..."
              value={!selectedMember ? value : ""}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Email notification toggle */}
      {selectedMember && (
        <div className="mt-2 flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            <input
              type="checkbox"
              className="accent-primary w-3 h-3"
              checked={notifyEmail}
              onChange={(e) => {
                setNotifyEmail(e.target.checked);
                if (e.target.checked && onEmailNotify && selectedMember) {
                  onEmailNotify(selectedMember.email);
                }
              }}
            />
            <Mail className="w-3 h-3" />
            Notificar por e-mail
          </label>
          {notifyEmail && selectedMember && (
            <span className="text-[10px] text-muted-foreground/40 truncate">
              → {selectedMember.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Schedule Picker Component ─────────────────────────────
function SchedulePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedDate, setDetectedDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Parse existing value to extract dates
  useEffect(() => {
    if (value) {
      const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/g);
      if (dateMatch) {
        if (dateMatch[0]) setDetectedDate(dateMatch[0]);
        if (dateMatch[1]) setDeadlineDate(dateMatch[1]);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const updateValue = (detected: string, deadline: string) => {
    setDetectedDate(detected);
    setDeadlineDate(deadline);

    const parts: string[] = [];
    if (detected) parts.push(`Detecção: ${formatDateBR(detected)}`);
    if (deadline) parts.push(`Prazo: ${formatDateBR(deadline)}`);
    onChange(parts.join(" | ") || "");
  };

  return (
    <div className="relative" ref={calendarRef}>
      <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Cronograma (Quando ocorreu/Prazo)
      </label>

      <div
        className="w-full text-sm font-medium bg-muted/40 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/30 transition-all flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {detectedDate || deadlineDate ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {detectedDate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 shadow-sm animate-in fade-in slide-in-from-left-2">
                  <Calendar className="w-3 h-3" />
                  Detecção: {formatDateBR(detectedDate)}
                </span>
              )}
              {deadlineDate && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm animate-in fade-in slide-in-from-right-2 ${
                    isDeadlinePast(deadlineDate)
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  Prazo: {formatDateBR(deadlineDate)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/40">
              Definir datas de detecção e prazo...
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in duration-200 p-4 space-y-4">
          {/* Detection date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              Data de Detecção
            </label>
            <div className="relative group">
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:light] dark:[color-scheme:dark]"
                value={detectedDate}
                onChange={(e) => updateValue(e.target.value, deadlineDate)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
              />
              <div className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-muted/60 pointer-events-none">
                <span
                  className={
                    detectedDate
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/40"
                  }
                >
                  {detectedDate ? formatDateBR(detectedDate) : "DD/MM/AAAA"}
                </span>
                <Calendar className="w-3 h-3 text-primary transition-transform group-hover:scale-110" />
              </div>
            </div>
          </div>

          {/* Deadline date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              Prazo para Resolução
            </label>
            <div className="relative group">
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:light] dark:[color-scheme:dark]"
                value={deadlineDate}
                min={detectedDate || undefined}
                onChange={(e) => updateValue(detectedDate, e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch {}
                }}
              />
              <div className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-muted/60 pointer-events-none">
                <span
                  className={
                    deadlineDate
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/40"
                  }
                >
                  {deadlineDate ? formatDateBR(deadlineDate) : "DD/MM/AAAA"}
                </span>
                <Calendar className="w-3 h-3 text-primary transition-transform group-hover:scale-110" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "Hoje", days: 0 },
              { label: "+7 dias", days: 7 },
              { label: "+15 dias", days: 15 },
              { label: "+30 dias", days: 30 },
              { label: "+90 dias", days: 90 },
            ].map(({ label, days }) => (
              <button
                key={label}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-muted/40 hover:bg-primary/15 hover:text-primary border border-border text-foreground rounded-md transition-all shadow-sm"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  if (days === 0) {
                    updateValue(today, deadlineDate);
                  } else {
                    const deadline = new Date();
                    deadline.setDate(deadline.getDate() + days);
                    updateValue(
                      detectedDate || today,
                      deadline.toISOString().split("T")[0],
                    );
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Clear button */}
          {(detectedDate || deadlineDate) && (
            <button
              className="w-full text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              onClick={() => {
                updateValue("", "");
                setIsOpen(false);
              }}
            >
              <X className="w-3 h-3" /> Limpar Datas
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isDeadlinePast(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

// ─── Main Component ────────────────────────────────────────
export default function ReportFindingCard({
  finding,
  index,
  onUpdate,
  onUpdate5W2H,
  onRemove,
  tenantMembers = [],
  membersLoading = false,
}: ReportFindingCardProps) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  const filteredTasks = TASK_TYPES.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedTask = TASK_TYPES.find((t) => t.value === finding.task_type);

  const riskColor =
    finding.risk_level === "critical"
      ? "border-l-destructive"
      : finding.risk_level === "high"
        ? "border-l-primary"
        : finding.risk_level === "medium"
          ? "border-l-amber-500"
          : "border-l-emerald-500";

  return (
    <div
      className={`bg-card dark:bg-card/40 rounded-xl border border-border transition-all duration-200 hover:shadow-md border-l-4 ${riskColor}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 pb-0">
        <div className="flex items-center gap-3">
          <span className="bg-foreground/10 text-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Achado #{String(index + 1).padStart(2, "0")}
          </span>
          {finding.risk_level === "critical" && (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          )}
        </div>
        <Button variant="ghost" onClick={() => onRemove(finding.id)}>
          <Trash2 className="w-4 h-4 text-destructive/80 hover:text-destructive" />
        </Button>
      </div>

      <div className="p-4 space-y-5">
        {/* 5W2H Text Fields (what, why, where, how, howMuch) */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
            <ChevronDown className="w-3 h-3" /> Análise 5W2H
          </p>
          {TEXT_5W2H_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
                {field.label}
              </label>
              <textarea
                rows={2}
                className="text-sm p-3 border border-border rounded-lg bg-muted/40 w-full focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none text-foreground placeholder-muted-foreground/30"
                placeholder={field.placeholder}
                value={finding.analysis[field.key]}
                onChange={(e) =>
                  onUpdate5W2H(finding.id, field.key, e.target.value)
                }
              />
            </div>
          ))}

          {/* Interactive: Schedule Picker (When) */}
          <SchedulePicker
            value={finding.analysis.when}
            onChange={(val) => onUpdate5W2H(finding.id, "when", val)}
          />

          {/* Interactive: Member Selector (Who) */}
          <MemberSelector
            value={finding.analysis.who}
            members={tenantMembers}
            loading={membersLoading}
            onChange={(name) => onUpdate5W2H(finding.id, "who", name)}
            onEmailNotify={(email) => {
              onUpdate(finding.id, {
                should_notify: true,
                notify_email: email,
              });
            }}
          />
        </div>

        {/* Risk + Status + Task Type row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Task Type Searchable Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Tipo de Tarefa
            </label>
            <div className="relative">
              <div
                className="w-full text-xs font-medium text-foreground bg-muted/40 p-2.5 rounded-lg border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all cursor-pointer flex justify-between items-center group"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span
                  className={
                    selectedTask
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  }
                >
                  {selectedTask ? selectedTask.label : "Buscar setor..."}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                  <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-muted-foreground/40" />
                    <input
                      autoFocus
                      className="bg-transparent border-none outline-none text-xs w-full py-1 placeholder:text-muted-foreground/30"
                      placeholder="Filtrar setores..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((t) => (
                        <div
                          key={t.value}
                          className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                            finding.task_type === t.value
                              ? "bg-primary text-white"
                              : "hover:bg-primary/10 hover:text-primary text-foreground"
                          }`}
                          onClick={() => {
                            onUpdate(finding.id, { task_type: t.value });
                            closeDropdown();
                          }}
                        >
                          {t.label}
                          {finding.task_type === t.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground/40 text-[10px] uppercase font-bold italic">
                        Nenhum resultado encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Risk Level */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Risco
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {RISK_LEVELS.map((r) => {
                const isActive = finding.risk_level === r.value;
                return (
                  <label
                    key={r.value}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name={`risk-${finding.id}`}
                      value={r.value}
                      className="peer sr-only"
                      checked={isActive}
                      onChange={() =>
                        onUpdate(finding.id, { risk_level: r.value })
                      }
                    />
                    <motion.span
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "block text-center text-[10px] font-bold py-1.5 rounded-lg border text-muted-foreground transition-all",
                        isActive ? r.activeClass : r.inactiveClass,
                      )}
                    >
                      {r.label}
                    </motion.span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Status Atual
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const isActive = finding.status === s.value;
                return (
                  <label
                    key={s.value}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name={`status-${finding.id}`}
                      value={s.value}
                      className="peer sr-only"
                      checked={isActive}
                      onChange={() => onUpdate(finding.id, { status: s.value })}
                    />
                    <motion.span
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "block text-center text-[10px] font-bold py-1.5 rounded-lg border text-muted-foreground transition-all",
                        isActive ? s.activeClass : s.inactiveClass,
                      )}
                    >
                      {s.label}
                    </motion.span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Areas */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
            Áreas Impactadas
          </label>
          <div className="flex flex-wrap gap-2">
            {IMPACT_AREAS.map((area) => {
              const isActive = finding.impacted_areas.includes(area);
              return (
                <label key={area} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isActive}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...finding.impacted_areas, area]
                        : finding.impacted_areas.filter((a) => a !== area);
                      onUpdate(finding.id, { impacted_areas: next });
                    }}
                  />
                  <motion.span
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary) / 0.15)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "block text-center text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all duration-300 shadow-sm",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "border-border text-muted-foreground bg-muted/20 hover:border-primary/40",
                    )}
                  >
                    {area}
                  </motion.span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
            <Code2 className="w-3 h-3" /> Trecho de Código / Log
          </label>
          <textarea
            rows={3}
            className="text-xs font-mono p-3 border border-border rounded-lg bg-black text-primary w-full resize-none placeholder:text-muted-foreground/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            placeholder="// Cole seu código ou log aqui..."
            value={finding.code_snippet ?? ""}
            onChange={(e) =>
              onUpdate(finding.id, { code_snippet: e.target.value })
            }
          />
        </div>

        {/* Evidence Links */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
            <Link className="w-3 h-3" /> Evidências (Links)
          </label>
          <div className="space-y-1.5">
            {finding.evidence_links.map((link, li) => (
              <div key={li} className="flex gap-1.5 items-center">
                {isValidUrl(link) && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <input
                  type="url"
                  className="text-xs flex-1 border border-border px-2 py-1.5 rounded bg-muted/40 text-foreground placeholder:text-muted-foreground/30 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => {
                    const links = [...finding.evidence_links];
                    links[li] = e.target.value;
                    onUpdate(finding.id, { evidence_links: links });
                  }}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (/^(javascript|data|vbscript):/i.test(val)) {
                      const links = [...finding.evidence_links];
                      links[li] = "";
                      onUpdate(finding.id, { evidence_links: links });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const links = finding.evidence_links.filter(
                      (_, idx) => idx !== li,
                    );
                    onUpdate(finding.id, { evidence_links: links });
                  }}
                  className="text-red-400 hover:text-red-600 text-xs font-bold px-1"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                onUpdate(finding.id, {
                  evidence_links: [...finding.evidence_links, ""],
                })
              }
              className="text-primary text-[10px] font-bold uppercase hover:underline"
            >
              + Adicionar Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
