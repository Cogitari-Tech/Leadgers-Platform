import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../services/projects.service";
import { ProjectFormModal } from "../components/ProjectFormModal";
import { useAuth } from "../../auth/context/AuthContext";
import { Project } from "../types/project.types";

export function ProjectsListPage() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const { can } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const canManage =
    can("projects.manage") || can("projects.create") || can("projects.edit");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (
    data: import("../types/project.types").ProjectFormData,
  ) => {
    await createProject(data);
  };

  const handleUpdate = async (
    data: Partial<import("../types/project.types").ProjectFormData>,
  ) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este projeto? Tudo associado a ele será perdido.",
      )
    ) {
      await deleteProject(id);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "on_hold":
        return "bg-muted/40 text-muted-foreground border-border/40 shadow-inner";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/40";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em Execução";
      case "completed":
        return "Concluído";
      case "on_hold":
        return "Em Pausa";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-12 p-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-display">
            Portfolio de Auditorias
          </h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Ciclo de vida e governança de projetos organizacionais
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-4 px-10 py-5 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 group ring-4 ring-primary/5"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Novo Projeto
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 shadow-2xl items-center backdrop-blur-md">
        <div className="flex-1 relative w-full group">
          <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou objetivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border/40 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm group-hover:border-primary/40"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-72 group">
            <Filter className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background/50 border border-border/40 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none group-hover:border-primary/40"
            >
              <option value="all">Filtro: Todo o Portfolio</option>
              <option value="active">Status: Em Execução</option>
              <option value="completed">Status: Concluído</option>
              <option value="on_hold">Status: Em Pausa</option>
              <option value="cancelled">Status: Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl border-4 border-primary/10 border-t-primary animate-spin shadow-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
            Sincronizando Projetos
          </p>
        </div>
      ) : error ? (
        <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-12 text-center animate-in zoom-in-95 group">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Trash2 className="text-destructive w-8 h-8" />
          </div>
          <p className="text-destructive font-black uppercase text-xs tracking-widest">
            {error}
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel border-dashed rounded-3xl p-32 text-center flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-12">
          <div className="w-28 h-28 bg-muted/20 rounded-3xl flex items-center justify-center shadow-inner ring-8 ring-muted/5">
            <Briefcase className="w-12 h-12 text-muted-foreground/20" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Horizonte Operacional Vazio
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed italic opacity-60">
              Nenhuma iniciativa detectada para os parâmetros atuais. Comece a
              construir seu portfolio agora.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsFormOpen(true);
              }}
              className="mt-6 flex items-center gap-4 px-10 py-5 bg-muted/40 hover:bg-background text-foreground rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] border border-border/40 shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Inicializar Ciclo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="group relative flex flex-col glass-panel rounded-3xl p-8 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-700 animate-in fade-in slide-in-from-bottom-12"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-10">
                <div
                  className={`px-5 py-2 rounded-xl border text-[10px] font-black tracking-[0.2em] uppercase shadow-sm ring-4 ring-background/10 ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </div>

                {canManage && (
                  <div className="flex items-center gap-3 lg:opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      className="p-3 text-muted-foreground hover:text-primary bg-background/50 rounded-xl hover:bg-background transition-all border border-border/40 shadow-sm"
                      title="Refinar Configurações"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(project.id);
                      }}
                      className="p-3 text-muted-foreground hover:text-destructive bg-background/50 rounded-xl hover:bg-background transition-all border border-border/40 shadow-sm"
                      title="Remover Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="flex-1 flex flex-col group/link"
              >
                <div className="flex items-center justify-between group/title mb-4">
                  <h3
                    className="text-3xl font-black text-foreground tracking-tighter leading-none group-hover/link:text-primary transition-colors pr-8"
                    title={project.name}
                  >
                    {project.name}
                  </h3>
                  <ArrowUpRight className="w-8 h-8 text-primary opacity-0 group-hover/link:opacity-100 transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1 duration-500" />
                </div>

                <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3 mb-10 opacity-70 group-hover:opacity-100 transition-opacity">
                  {project.description ||
                    "Memorial descritivo estratégico ainda não definido para esta auditoria corporativa."}
                </p>

                <div className="mt-auto space-y-6 pt-8 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-primary/40" />
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString(
                            "pt-BR",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "Sem Prazo"}
                    </div>

                    <Link
                      to={`/projects/${project.id}?tab=equipe`}
                      className="flex items-center gap-2 text-primary hover:text-primary/70 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Users className="w-4 h-4" />
                      Time
                    </Link>
                  </div>

                  <div className="relative w-full h-2 bg-muted/20 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000"
                      style={{
                        width: project.status === "completed" ? "100%" : "45%",
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdate : handleCreate}
        initialData={editingProject || undefined}
      />

      <div className="py-16 flex flex-col items-center gap-6 opacity-30 mt-12">
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground">
          Leadgers Cyber-Portfolio Protocol 2026
        </p>
      </div>
    </div>
  );
}
