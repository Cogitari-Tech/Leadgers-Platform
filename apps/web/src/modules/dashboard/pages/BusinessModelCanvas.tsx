import { useState } from "react";
import { useBMC } from "../hooks/useBMC";
import { LayoutDashboard, Save } from "lucide-react";

export default function BusinessModelCanvas() {
  const { data, loading, saving, saveBMC } = useBMC();
  const [form, setForm] = useState(
    data || {
      key_partners: [],
      key_activities: [],
      key_resources: [],
      value_props: [],
      customer_rels: [],
      channels: [],
      customer_segs: [],
      cost_structure: [],
      revenue_streams: [],
    },
  );

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value.split("\\n").filter(Boolean),
    }));
  };

  const getArrayVal = (arr: string[] | undefined) => (arr || []).join("\\n");

  if (loading)
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse">
        Carregando Business Model Canvas...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Business Model Canvas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ferramenta estratégica para desenvolver e documentar modelos de
            negócios.
          </p>
        </div>
        <button
          onClick={() => saveBMC(form)}
          disabled={saving}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 font-semibold hover:opacity-90"
        >
          <Save className="w-4 h-4" />{" "}
          {saving ? "Salvando..." : "Salvar Canvas"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 grid-rows-2">
        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-2 flex flex-col h-[600px]">
          <h3 className="text-sm font-bold uppercase mb-2">Key Partners</h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Quem são seus principais parceiros e fornecedores?"
            value={getArrayVal(form.key_partners)}
            onChange={(e) => handleChange("key_partners", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-1 flex flex-col h-[290px]">
          <h3 className="text-sm font-bold uppercase mb-2">Key Activities</h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="O que o negócio faz para gerar valor?"
            value={getArrayVal(form.key_activities)}
            onChange={(e) => handleChange("key_activities", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-2 flex flex-col h-[600px] border-2 border-primary/20">
          <h3 className="text-sm font-bold uppercase mb-2">
            Value Propositions
          </h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Qual dor você resolve? Qual valor entrega aos clientes?"
            value={getArrayVal(form.value_props)}
            onChange={(e) => handleChange("value_props", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-1 flex flex-col h-[290px]">
          <h3 className="text-sm font-bold uppercase mb-2">
            Customer Relationships
          </h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Como interage com o cliente?"
            value={getArrayVal(form.customer_rels)}
            onChange={(e) => handleChange("customer_rels", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-2 flex flex-col h-[600px]">
          <h3 className="text-sm font-bold uppercase mb-2">
            Customer Segments
          </h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Quem é o cliente ideal?"
            value={getArrayVal(form.customer_segs)}
            onChange={(e) => handleChange("customer_segs", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-1 flex flex-col h-[290px]">
          <h3 className="text-sm font-bold uppercase mb-2">Key Resources</h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Recursos materiais, IP, Humanos"
            value={getArrayVal(form.key_resources)}
            onChange={(e) => handleChange("key_resources", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl md:col-span-1 md:row-span-1 flex flex-col h-[290px]">
          <h3 className="text-sm font-bold uppercase mb-2">Channels</h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Como alcançar os clientes? (Marketing/Vendas)"
            value={getArrayVal(form.channels)}
            onChange={(e) => handleChange("channels", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="glass-card soft-shadow p-6 rounded-2xl flex flex-col h-[200px]">
          <h3 className="text-sm font-bold uppercase mb-2">Cost Structure</h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Custos fixos e variáveis, CAC, infraestrutura."
            value={getArrayVal(form.cost_structure)}
            onChange={(e) => handleChange("cost_structure", e.target.value)}
          />
        </div>

        <div className="glass-card soft-shadow p-6 rounded-2xl flex flex-col h-[200px]">
          <h3 className="text-sm font-bold uppercase mb-2 text-emerald-500">
            Revenue Streams
          </h3>
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none focus:ring-0 text-sm"
            placeholder="Fontes de receita, MRR, Tickets, Consultorias."
            value={getArrayVal(form.revenue_streams)}
            onChange={(e) => handleChange("revenue_streams", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
