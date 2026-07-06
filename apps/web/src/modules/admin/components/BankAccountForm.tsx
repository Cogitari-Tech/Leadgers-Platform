import { useState, type FormEvent } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { AccountType, BankAccount } from "../../auth/types/auth.types";
import {
  Landmark,
  Plus,
  Trash2,
  Loader2,
  Star,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface BankAccountFormProps {
  accounts: BankAccount[];
  onUpdate: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "pagamento", label: "Conta Pagamento" },
  { value: "investimento", label: "Investimento" },
];

const COMMON_BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "077", name: "Inter" },
  { code: "260", name: "Nubank" },
  { code: "290", name: "PagSeguro" },
  { code: "323", name: "Mercado Pago" },
  { code: "336", name: "C6 Bank" },
];

interface FormState {
  bank_name: string;
  bank_code: string;
  agency: string;
  account_number: string;
  account_type: AccountType;
  holder_name: string;
  holder_document: string;
  pix_key: string;
  is_primary: boolean;
  notes: string;
}

const emptyForm: FormState = {
  bank_name: "",
  bank_code: "",
  agency: "",
  account_number: "",
  account_type: "corrente",
  holder_name: "",
  holder_document: "",
  pix_key: "",
  is_primary: false,
  notes: "",
};

export function BankAccountForm({ accounts, onUpdate }: BankAccountFormProps) {
  const { user, tenant } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "glass-input w-full px-4 py-2.5 text-sm transition-all rounded-xl font-medium placeholder:opacity-40";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70";

  const handleBankSelect = (code: string) => {
    const bank = COMMON_BANKS.find((b) => b.code === code);
    if (bank) {
      setForm((prev) => ({
        ...prev,
        bank_name: bank.name,
        bank_code: bank.code,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      tenant_id: tenant.id,
      bank_name: form.bank_name,
      bank_code: form.bank_code || null,
      agency: form.agency,
      account_number: form.account_number,
      account_type: form.account_type,
      holder_name: form.holder_name,
      holder_document: form.holder_document || null,
      pix_key: form.pix_key || null,
      is_primary: form.is_primary,
      notes: form.notes || null,
      created_by: user?.id,
    };

    try {
      if (editingId) {
        const { error: err } = await supabase
          .from("bank_accounts")
          .update(payload)
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("bank_accounts")
          .insert(payload);
        if (err) throw err;
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar conta bancária.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setForm({
      bank_name: account.bank_name,
      bank_code: account.bank_code || "",
      agency: account.agency,
      account_number: account.account_number,
      account_type: account.account_type,
      holder_name: account.holder_name,
      holder_document: account.holder_document || "",
      pix_key: account.pix_key || "",
      is_primary: account.is_primary,
      notes: account.notes || "",
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta conta bancária?")) return;
    await supabase.from("bank_accounts").delete().eq("id", id);
    onUpdate();
  };

  const handleSetPrimary = async (id: string) => {
    if (!tenant) return;
    // Unset all primary first
    await supabase
      .from("bank_accounts")
      .update({ is_primary: false })
      .eq("tenant_id", tenant.id);
    // Set new primary
    await supabase
      .from("bank_accounts")
      .update({ is_primary: true })
      .eq("id", id);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {/* Existing accounts list */}
      {accounts.length > 0 && (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`glass-card flex items-center justify-between p-4 rounded-xl transition-all ${
                account.is_primary
                  ? "ring-2 ring-primary/20 shadow-primary/5"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{account.bank_name}</p>
                    {account.is_primary && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        <Star className="w-3 h-3" /> Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ag. {account.agency} · Conta {account.account_number} ·{" "}
                    {
                      ACCOUNT_TYPES.find(
                        (t) => t.value === account.account_type,
                      )?.label
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {account.holder_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!account.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(account.id)}
                    title="Marcar como principal"
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => handleEdit(account)}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form */}
      {!showForm ? (
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border/40 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all w-full justify-center"
        >
          <Plus className="w-4 h-4" /> Adicionar Conta Bancária
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-background/50 border border-border/30 rounded-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">
              {editingId ? "Editar Conta" : "Nova Conta Bancária"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError(null);
              }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Bank selection */}
            <div className="col-span-2 space-y-1.5">
              <label htmlFor="bankSelect" className={labelClass}>
                Banco
              </label>
              <select
                id="bankSelect"
                value={form.bank_code}
                onChange={(e) => handleBankSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione o banco</option>
                {COMMON_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom bank name (shown if none selected) */}
            {!form.bank_code && (
              <div className="col-span-2 space-y-1.5">
                <label htmlFor="customBankName" className={labelClass}>
                  Nome do Banco
                </label>
                <input
                  id="customBankName"
                  type="text"
                  required
                  value={form.bank_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bank_name: e.target.value }))
                  }
                  placeholder="Nome do banco"
                  className={inputClass}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="agencyNumber" className={labelClass}>
                Agência
              </label>
              <input
                id="agencyNumber"
                type="text"
                required
                value={form.agency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, agency: e.target.value }))
                }
                placeholder="0001"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="accountNumber" className={labelClass}>
                Conta
              </label>
              <input
                id="accountNumber"
                type="text"
                required
                value={form.account_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, account_number: e.target.value }))
                }
                placeholder="12345-6"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="accountType" className={labelClass}>
                Tipo
              </label>
              <select
                id="accountType"
                value={form.account_type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    account_type: e.target.value as AccountType,
                  }))
                }
                className={inputClass}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pixKey" className={labelClass}>
                Chave PIX (opcional)
              </label>
              <input
                id="pixKey"
                type="text"
                value={form.pix_key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pix_key: e.target.value }))
                }
                placeholder="CPF, e-mail ou telefone"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderName" className={labelClass}>
                Titular
              </label>
              <input
                id="holderName"
                type="text"
                required
                value={form.holder_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, holder_name: e.target.value }))
                }
                placeholder="Nome do titular"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="holderDocument" className={labelClass}>
                CPF/CNPJ do Titular
              </label>
              <input
                id="holderDocument"
                type="text"
                value={form.holder_document}
                onChange={(e) =>
                  setForm((p) => ({ ...p, holder_document: e.target.value }))
                }
                placeholder="000.000.000-00"
                className={inputClass}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label htmlFor="notes" className={labelClass}>
                Observações (opcional)
              </label>
              <input
                id="notes"
                type="text"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Ex: Conta operacional principal"
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="isPrimaryAccount"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="isPrimaryAccount"
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_primary: e.target.checked }))
                  }
                  className="rounded border-border accent-primary w-4 h-4"
                />
                <span className="text-sm text-muted-foreground">
                  Definir como conta principal
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {editingId ? "Salvar Alterações" : "Adicionar Conta"}
          </button>
        </form>
      )}
    </div>
  );
}
