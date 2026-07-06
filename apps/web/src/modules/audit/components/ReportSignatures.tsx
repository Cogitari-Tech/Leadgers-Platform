import { useState } from "react";
import { PenLine, X, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import type { ReportSignature } from "../types/audit.types";

interface ReportSignaturesProps {
  signatures: ReportSignature[];
  onAdd: (name: string, role: string) => void;
  onRemove: (name: string) => void;
}

export default function ReportSignatures({
  signatures,
  onAdd,
  onRemove,
}: ReportSignaturesProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSign = () => {
    if (!name.trim() || !role.trim()) return;
    onAdd(name.trim(), role.trim());
    setName("");
    setRole("");
    setShowModal(false);
  };

  return (
    <div className="glass-card soft-shadow rounded-3xl p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
            Assinaturas e Rastreabilidade
          </h3>
        </div>
        <Button
          className="flex items-center gap-1.5 text-xs"
          onClick={() => setShowModal(true)}
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Assinar Agora</span>
        </Button>
      </div>

      {signatures.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
          <PenLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma assinatura registrada</p>
          <p className="text-xs mt-1">
            Clique em "Assinar Agora" para adicionar
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {signatures.map((sig) => (
            <div
              key={sig.name}
              className="flex items-center justify-between py-3 group"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-200 text-sm">
                  {sig.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {sig.role}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" /> {sig.signed_at}
                </p>
              </div>
              <button
                onClick={() => onRemove(sig.name)}
                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover assinatura"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sign Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Assinatura"
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Cargo / Função"
            placeholder="Ex: Auditor Líder"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ao assinar, você confirma que revisou o conteúdo deste relatório. A
            assinatura será registrada com data e hora atuais.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              <span>Cancelar</span>
            </Button>
            <Button
              onClick={handleSign}
              disabled={!name.trim() || !role.trim()}
            >
              <span>Confirmar Assinatura</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
