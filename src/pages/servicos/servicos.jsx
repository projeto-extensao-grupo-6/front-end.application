import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  FaWrench, FaEdit, FaTrash, FaExternalLinkAlt,
  FaExclamationTriangle, FaUser, FaBars, FaPlus, FaFilter, FaCheck, FaBoxOpen
} from "react-icons/fa";


const MOCK_SERVICOS = [
  { id: "#001", cliente: "Carlos Henrique", data: "2025-10-12", descricao: "Instalação de porta de vidro temperado", status: "Ativo", etapa: "Aguardando orçamento", progresso: [1, 6], muted: false },
  { id: "#002", cliente: "Fernanda Silva", data: "2025-10-11", descricao: "Troca de janela basculante", status: "Ativo", etapa: "Orçamento aprovado", progresso: [3, 6], muted: false },
  { id: "#003", cliente: "Marcos Oliveira", data: "2025-10-10", descricao: "Conserto de box de banheiro", status: "Finalizado", etapa: "Concluído", progresso: [6, 6], muted: true },
  { id: "#004", cliente: "Loja Central Vidros", data: "2025-10-09", descricao: "Instalação de vitrine comercial", status: "Ativo", etapa: "Execução em andamento", progresso: [4, 6], muted: false },
  { id: "#005", cliente: "Gabriel Souza", data: "2025-10-08", descricao: "Troca de vidro de porta pivotante", status: "Ativo", etapa: "Aguardando peças", progresso: [2, 6], muted: false },
  { id: "#006", cliente: "Clínica Bem-Estar", data: "2025-10-07", descricao: "Divisórias de vidro fosco", status: "Ativo", etapa: "Orçamento aprovado", progresso: [3, 6], muted: false },
];

function StatusPill({ status }) {
  const map = {
    // Reduzindo o padding horizontal (px-2) e vertical (py-0.5) para o mínimo.
    Ativo: "bg-green-100 text-green-800 rounded-full px-0.5 py-1 text-xs font-bold inline-block",
    Finalizado: "bg-red-100 text-red-800 rounded-full px-0.5 py-1 text-xs font-bold inline-block",
    Concluído: "bg-green-100 text-green-800 rounded-full px-0.5 py-1 text-xs font-bold inline-block"
  };
  return (
    <span className={map[status] || "bg-slate-100 text-slate-800 rounded-full px-0.5 py-1 text-xs font-medium inline-block"}>
      {status}
    </span>
  );
}

function Progress({ value = 0, total = 6, dark = false }) {
  const pct = Math.min(100, Math.round((Number(value) / Number(total)) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <div className="h-2 w-40 rounded-full bg-slate-300/60 overflow-hidden">
        <div className={`h-2 rounded-full ${dark ? "bg-[#003249]" : "bg-[#007EA7]"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600">{value}/{total}</span>
    </div>
  );
}

const ITEMS_PER_PAGE = 3;
const NOVO_FORM = () => ({
  cliente: "",
  data: new Date().toISOString().slice(0, 10),
  descricao: "",
  status: "Ativo",
  etapa: "Aguardando orçamento",
  progressoValor: 0,
  progressoTotal: 6,
});

export default function Servicos({ busca = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();
  const isServicos = location.pathname === "/servicos";

  const [servicos, setServicos] = useState(MOCK_SERVICOS);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState({ confirm: false, view: false, form: false });
  const [mode, setMode] = useState("new");
  const [current, setCurrent] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [form, setForm] = useState(NOVO_FORM());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const open = () => {
      setMode("new");
      setForm(NOVO_FORM());
      setErrors({});
      setModal((m) => ({ ...m, form: true }));
    };
    window.addEventListener("openNovoPedido", open);
    return () => window.removeEventListener("openNovoPedido", open);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModal({ confirm: false, view: false, form: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const listaFiltrada = useMemo(() => {
    const t = String(busca).toLowerCase().trim();
    if (!t) return servicos;
    return servicos.filter((s) => [s.id, s.cliente, s.descricao, s.status, s.etapa].join(" ").toLowerCase().includes(t));
  }, [busca, servicos]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pagina = useMemo(() => listaFiltrada.slice(start, end), [listaFiltrada, start, end]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const proxima = () => page < totalPages && setPage((p) => p + 1);
  const anterior = () => page > 1 && setPage((p) => p - 1);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const fecharTodos = () => setModal({ confirm: false, view: false, form: false });

  const abrirExibir = (item) => { setCurrent(item); setModal((m) => ({ ...m, view: true })); };
  const fecharExibir = () => { setCurrent(null); setModal((m) => ({ ...m, view: false })); };

  const abrirEditar = (item) => {
    setMode("edit");
    setCurrent(item);
    setForm({
      cliente: item.cliente,
      data: item.data,
      descricao: item.descricao,
      status: item.status,
      etapa: item.etapa,
      progressoValor: item.progresso?.[0] ?? 0,
      progressoTotal: item.progresso?.[1] ?? 6,
    });
    setErrors({});
    setModal((m) => ({ ...m, form: true }));
  };

  const abrirConfirmarExclusao = (id) => { setTargetId(id); setModal((m) => ({ ...m, confirm: true })); };
  const fecharConfirmarExclusao = () => { setTargetId(null); setModal((m) => ({ ...m, confirm: false })); };

  const validar = (f) => {
    const e = {};
    if (!String(f.cliente).trim()) e.cliente = "Informe o nome do cliente.";
    if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
    if (!f.data) e.data = "Informe a data.";
    if (Number(f.progressoTotal) <= 0) e.total = "Total precisa ser maior que 0.";
    if (Number(f.progressoValor) < 0 || Number(f.progressoValor) > Number(f.progressoTotal)) e.valor = "Valor entre 0 e total.";
    return e;
  };

  const salvar = (e) => {
    e?.preventDefault();
    const errs = validar(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === "new") {
      const nums = servicos.map((s) => parseInt(String(s.id).replace("#", ""), 10)).filter((n) => !Number.isNaN(n));
      const prox = Math.max(0, ...nums) + 1;
      const novo = {
        id: `#${String(prox).padStart(3, "0")}`,
        cliente: form.cliente.trim(),
        data: form.data,
        descricao: form.descricao.trim(),
        status: form.status,
        etapa: (form.etapa || "Aguardando orçamento").trim(),
        progresso: [Number(form.progressoValor) || 0, Number(form.progressoTotal) || 6],
        muted: form.status === "Finalizado",
      };
      setServicos((prev) => [novo, ...prev]);
      setPage(1);
    } else {
      setServicos((prev) =>
        prev.map((s) =>
          s.id === current.id
            ? {
              ...s,
              cliente: form.cliente.trim(),
              data: form.data,
              descricao: form.descricao.trim(),
              status: form.status,
              etapa: form.etapa.trim(),
              progresso: [Number(form.progressoValor) || 0, Number(form.progressoTotal) || 6],
              muted: form.status === "Finalizado",
            }
            : s
        )
      );
    }

    setCurrent(null);
    setModal((m) => ({ ...m, form: false }));
  };

  const confirmarExclusao = () => {
    setServicos((prev) => prev.filter((s) => s.id !== targetId));
    fecharConfirmarExclusao();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-800 flex flex-col">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-14">
          <h1 className="text-[32px] leading-tight font-bold text-center text-[#0F172A]">
            Pedidos e serviços
          </h1>
          <p className="text-center text-[15px] text-slate-500 mt-2">
            Tenha uma visão completa dos pedidos e serviços atuais.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 w-full">
              <button
                className="inline-flex items-center gap-2 px-6 py-2 rounded text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: "#007EA7" }}
                onClick={() => window.dispatchEvent(new CustomEvent("openNovoPedido"))}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#002A4B"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#007EA7"}
              >
                Novo Registro
              </button>

              <div className="flex items-center gap-3">
                <div className="relative min-w-[260px]">
                  <input
                    placeholder="Busque Por..."
                    className="w-100 h-10 pl-3 pr-3 rounded-md border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6980e6]"
                  />
                </div>

                <button
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm cursor-pointer"
                  onClick={() => window.dispatchEvent(new CustomEvent("toggleFiltro"))}
                  title="Filtrar"
                >
                  <FaFilter /> Filtrar
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1">
                    <Link
                      to="/servicos"
                      className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${isServicos ? "bg-[#264168] text-white" : "hover:bg-white text-slate-600"}`}
                      title="Serviços"
                    >
                      <FaCheck />
                    </Link>
                    <Link
                      to="/pedidos"
                      className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${!isServicos ? "bg-[#E7EEF3] text-[#0F172A]" : "hover:bg-white text-black"}`}
                      title="Pedidos"
                    >
                      <FaBoxOpen />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo da página */}
            <div className="text-[13px] text-slate-500 mb-3 mt-8 text-left">Serviços cadastrados</div>
            <div className="flex flex-col gap-6">
              {pagina.map((p) => (
                <article
                  key={p.id}
                  className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${p.muted ? "pedido-muted" : ""}`}
                >
                  {/* Cabeçalho */}
                  <header className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-6 text-slate-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-slate-600 rounded cursor-pointer"
                      />
                      <div className="flex items-center gap-2 text-slate-600 font-semibold whitespace-nowrap">
                        <FaWrench />
                        <span>Pedido de serviço - {p.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        className="text-slate-600 hover:text-slate-800"
                        title="Editar"
                        onClick={() => abrirEditar(p)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="text-slate-600 hover:text-slate-800"
                        title="Excluir"
                        onClick={() => abrirConfirmarExclusao(p.id)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        type="button"
                        className="text-slate-600 hover:text-slate-800"
                        title="Exibir"
                        onClick={() => abrirExibir(p)}
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </header>

                  {/* Corpo dos dados */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Cliente */}
                    <div className="flex flex-col text-slate-900 text-sm whitespace-nowrap">
                      <span className="text-slate-600 text-xs font-bold">Nome Cliente</span>
                      <span>{p.cliente}</span>
                    </div>

                    {/* Data */}
                    <div className="flex flex-col text-slate-900 text-sm whitespace-nowrap">
                      <span className="text-slate-600 text-xs font-bold">Data Lançamento</span>
                      <span>{new Date(p.data).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {/* Descrição */}
                    <div className="flex flex-col text-slate-900 text-sm">
                      <span className="text-slate-600 text-xs font-bold">Descrição</span>
                      <span>{p.descricao}</span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col text-slate-900 text-md">
                      <span className="text-slate-600 text-xs font-bold">Status</span>
                      <StatusPill status={p.status} />
                    </div>

                    {/* Progresso */}
                    <div className="flex flex-col text-slate-900 text-sm whitespace-nowrap">
                      <span className="text-slate-600 text-xs font-bold">{p.etapa}</span>
                      <Progress value={p.progresso[0]} total={p.progresso[1]} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
              <div>
                Mostrando {listaFiltrada.length ? start + 1 : 0}–{Math.min(end, listaFiltrada.length)} de {listaFiltrada.length} resultados
              </div>

              <div className="flex gap-2">
                <button
                  onClick={anterior}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Anterior
                </button>

                <button
                  onClick={proxima}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Próximo
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Modais */}
      {modal.confirm && (
        <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharConfirmarExclusao(); }}>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-500 mt-1 text-xl" />
              <h2 className="text-[22px] font-bold text-center w-full text-slate-800">Tem certeza que deseja excluir o pedido?</h2>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>Sim</button>
              <button onClick={fecharConfirmarExclusao} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modal.view && current && (
        <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharExibir(); }}>
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pedido de serviço - {current.id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-slate-600">Nome Cliente</div><div className="font-medium">{current.cliente}</div></div>
              <div><div className="text-sm text-slate-600">Data lançamento</div><div className="font-medium">{new Date(current.data).toLocaleDateString("pt-BR")}</div></div>
              <div className="md:col-span-2"><div className="text-sm text-slate-600">Descrição</div><div className="font-medium">{current.descricao}</div></div>
              <div><div className="text-sm text-slate-600">Status</div><StatusPill status={current.status} /></div>
              <div><div className="text-sm text-slate-600">Etapa</div><div className="font-medium">{current.etapa}</div></div>
              <div className="md:col-span-2"><div className="text-sm text-slate-600 mb-2">Progresso</div><Progress value={current.progresso[0]} total={current.progresso[1]} dark={current.etapa === "Concluído"} /></div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={fecharExibir} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {modal.form && (
        <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, form: false })); }}>
          <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-400"><FaUser /></div>
              <h2 className="text-[22px] font-bold text-slate-800">{mode === "new" ? "Novo pedido de serviço" : `Editar pedido ${current?.id}`}</h2>
              <div className="ml-auto flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-slate-700 select-none">
                  <span className="text-sm">Status ativo</span>
                  <input type="checkbox" checked={form.status === "Ativo"} onChange={(e) => setField("status", e.target.checked ? "Ativo" : "Finalizado")} className="peer sr-only" />
                  <span className="w-11 h-6 rounded-full bg-slate-300 relative transition peer-checked:bg-[#007EA7]">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition peer-checked:left-[22px]" />
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input value={form.cliente} onChange={(e) => setField("cliente", e.target.value)} placeholder="Nome do cliente" className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.cliente ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.cliente && <p className="text-rose-600 text-xs mt-1">{errors.cliente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de lançamento</label>
                <input type="date" value={form.data} onChange={(e) => setField("data", e.target.value)} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.data ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.data && <p className="text-rose-600 text-xs mt-1">{errors.data}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} placeholder="Descrição do serviço" className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.descricao ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.descricao && <p className="text-rose-600 text-xs mt-1">{errors.descricao}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Etapa</label>
                  <input value={form.etapa} onChange={(e) => setField("etapa", e.target.value)} placeholder="Ex.: Aguardando orçamento" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (valor)</label>
                    <input type="number" min={0} value={form.progressoValor} onChange={(e) => setField("progressoValor", Number(e.target.value))} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.valor ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                    {errors.valor && <p className="text-rose-600 text-xs mt-1">{errors.valor}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (total)</label>
                    <input type="number" min={1} value={form.progressoTotal} onChange={(e) => setField("progressoTotal", Number(e.target.value))} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.total ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                    {errors.total && <p className="text-rose-600 text-xs mt-1">{errors.total}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="submit" className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                {mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}
              </button>
              <button type="button" onClick={fecharTodos} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}