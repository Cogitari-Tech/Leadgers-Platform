import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import type { MrrSnapshotInput } from "../hooks/useMrrSnapshots";

interface MrrSnapshotFormProps {
  saving: boolean;
  onSave: (input: MrrSnapshotInput) => Promise<void>;
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

function NumberField({
  id,
  label,
  value,
  required,
  onChange,
}: NumberFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-muted-foreground mb-1"
      >
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0,00"
        className="w-full h-11 px-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
      />
    </div>
  );
}

// Local calendar month — toISOString() is UTC, so on the 1st/last day near
// midnight (e.g. BRT) it points at the wrong month and the upsert's
// UNIQUE(tenant_id, month_date) would overwrite the neighbouring snapshot.
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function MrrSnapshotForm({ saving, onSave }: MrrSnapshotFormProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [totalMrr, setTotalMrr] = useState("");
  const [newMrr, setNewMrr] = useState("");
  const [expansionMrr, setExpansionMrr] = useState("");
  const [churnMrr, setChurnMrr] = useState("");
  const [contractionMrr, setContractionMrr] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const reset = () => {
    setMonth(currentMonth());
    setTotalMrr("");
    setNewMrr("");
    setExpansionMrr("");
    setChurnMrr("");
    setContractionMrr("");
    setNotes("");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(totalMrr);
    if (!month || isNaN(total) || total < 0) {
      setFormError("Informe o mês e um MRR total válido.");
      return;
    }

    try {
      setFormError(null);
      await onSave({
        month_date: `${month}-01`,
        total_mrr: total,
        new_mrr: Number(newMrr) || 0,
        expansion_mrr: Number(expansionMrr) || 0,
        churn_mrr: Number(churnMrr) || 0,
        contraction_mrr: Number(contractionMrr) || 0,
        notes: notes.trim() || null,
      });
      reset();
      setOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao salvar snapshot",
      );
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Registrar snapshot de MRR"
        className="flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
        Registrar mês
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel p-6 rounded-3xl border-border/30 space-y-4 w-full"
      aria-label="Formulário de snapshot de MRR"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Novo snapshot mensal
        </h3>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          aria-label="Fechar formulário"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Um snapshot por mês — reenviar o mesmo mês atualiza os valores. ARR é
        derivado automaticamente (12 × MRR).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="mrr-month"
            className="block text-xs font-semibold text-muted-foreground mb-1"
          >
            Mês de referência<span className="text-primary ml-0.5">*</span>
          </label>
          <input
            id="mrr-month"
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>
        <NumberField
          id="mrr-total"
          label="MRR total (R$)"
          value={totalMrr}
          required
          onChange={setTotalMrr}
        />
        <NumberField
          id="mrr-new"
          label="Novo MRR (R$)"
          value={newMrr}
          onChange={setNewMrr}
        />
        <NumberField
          id="mrr-expansion"
          label="Expansão (R$)"
          value={expansionMrr}
          onChange={setExpansionMrr}
        />
        <NumberField
          id="mrr-churn"
          label="Churn (R$)"
          value={churnMrr}
          onChange={setChurnMrr}
        />
        <NumberField
          id="mrr-contraction"
          label="Contração (R$)"
          value={contractionMrr}
          onChange={setContractionMrr}
        />
      </div>

      <div>
        <label
          htmlFor="mrr-notes"
          className="block text-xs font-semibold text-muted-foreground mb-1"
        >
          Notas
        </label>
        <textarea
          id="mrr-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Contexto do mês (opcional)"
          className="w-full px-3 py-2 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/60 resize-none"
        />
      </div>

      {formError && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="px-4 h-11 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar snapshot
        </button>
      </div>
    </form>
  );
}

export default MrrSnapshotForm;
