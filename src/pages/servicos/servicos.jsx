import React, { useMemo, useState, useEffect } from "react";
import "../pedidos/pedidos.css";
import { FaWrench, FaEdit, FaTrash, FaExternalLinkAlt, FaExclamationTriangle, FaUser } from "react-icons/fa";

const MOCK_SERVICOS = [
  { id: "#010", cliente: "Carlos Henrique",     data: "2025-10-12", descricao: "Instalação de porta de vidro temperado", status: "Ativo",      etapa: "Aguardando orçamento",  progresso: [1, 6], muted: false },
  { id: "#009", cliente: "Fernanda Silva",      data: "2025-10-11", descricao: "Troca de janela basculante",            status: "Ativo",      etapa: "Orçamento aprovado",    progresso: [3, 6], muted: false },
  { id: "#008", cliente: "Marcos Oliveira",     data: "2025-10-10", descricao: "Conserto de box de banheiro",           status: "Finalizado", etapa: "Concluído",              progresso: [6, 6], muted: true  },
  { id: "#007", cliente: "Loja Central Vidros", data: "2025-10-09", descricao: "Instalação de vitrine comercial",       status: "Ativo",      etapa: "Execução em andamento", progresso: [4, 6], muted: false },
  { id: "#006", cliente: "Gabriel Souza",       data: "2025-10-08", descricao: "Troca de vidro de porta pivotante",     status: "Ativo",      etapa: "Aguardando peças",      progresso: [2, 6], muted: false },
  { id: "#005", cliente: "Clínica Bem-Estar",   data: "2025-10-07", descricao: "Divisórias de vidro fosco",             status: "Ativo",      etapa: "Orçamento aprovado",    progresso: [3, 6], muted: false },
];

function StatusPill({ status }) {
  const map = { Ativo: "chip chip-green", Finalizado: "chip chip-red", Concluído: "chip chip-green" };
  return <span className={map[status] || "chip"}>{status}</span>;
}

function Progress({ value = 0, total = 6, dark = false }) {
  const pct = Math.min(100, Math.round((Number(value) / Number(total)) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <div className="h-2 w-40 rounded-full bg-slate-300/60 overflow-hidden">
        <div className={`h-2 rounded-full ${dark ? "bg-[#003249]" : "bg-[#003249]"}`} style={{ width: `${pct}%` }} />
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

export default function ServicosPage({ busca = "" }) {
  // Pegando os dados mockados
  const [servicos, setServicos] = useState(MOCK_SERVICOS);

  // Paginação
  const [page, setPage] = useState(1);

  // Modais agrupados
  const [modal, setModal] = useState({ confirm: false, view: false, form: false });

  // Contexto
  const [mode, setMode] = useState("new"); // new | edit
  const [current, setCurrent] = useState(null); // item atual
  const [targetId, setTargetId] = useState(null); // alvo de exclusão

  // Form e erros
  const [form, setForm] = useState(NOVO_FORM());
  const [errors, setErrors] = useState({});

  /* ===== Efeitos globais ===== */
  // Evento global para abrir "novo"
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

  // Esc fecha os modais
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModal({ confirm: false, view: false, form: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ===== Filtro de busca ===== */
  const listaFiltrada = useMemo(() => {
    const t = String(busca).toLowerCase().trim();
    if (!t) return servicos;
    return servicos.filter((s) => [s.id, s.cliente, s.descricao, s.status, s.etapa].join(" ").toLowerCase().includes(t));
  }, [busca, servicos]);

  /* ===== Paginação calculada ===== */
  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pagina = useMemo(() => listaFiltrada.slice(start, end), [listaFiltrada, start, end]);

  // Ajusta página se necessário quando a lista mudar
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const proxima = () => page < totalPages && setPage((p) => p + 1);
  const anterior = () => page > 1 && setPage((p) => p - 1);

  /* ===== Helpers ===== */
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const fecharTodos = () => setModal({ confirm: false, view: false, form: false });

  /* ===== Ações de UI ===== */
  const abrirExibir = (item) => {
    setCurrent(item);
    setModal((m) => ({ ...m, view: true }));
  };
  const fecharExibir = () => {
    setCurrent(null);
    setModal((m) => ({ ...m, view: false }));
  };

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

  const abrirConfirmarExclusao = (id) => {
    setTargetId(id);
    setModal((m) => ({ ...m, confirm: true }));
  };
  const fecharConfirmarExclusao = () => {
    setTargetId(null);
    setModal((m) => ({ ...m, confirm: false }));
  };

  const validar = (f) => {
    const e = {};
    if (!String(f.cliente).trim()) e.cliente = "Informe o nome do cliente.";
    if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
    if (!f.data) e.data = "Informe a data.";
    if (Number(f.progressoTotal) <= 0) e.total = "Total precisa ser maior que 0.";
    if (Number(f.progressoValor) < 0 || Number(f.progressoValor) > Number(f.progressoTotal)) e.valor = "Valor entre 0 e total.";
    return e;
  };

  // crud com os dados mockados
  const salvar = (e) => {
    e?.preventDefault();
    const errs = validar(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === "new") {
      // POST
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
      setPage(1); // mostra o novo no topo
    } else {
      // PUT
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
    // DELETE
    setServicos((prev) => prev.filter((s) => s.id !== targetId));
    fecharConfirmarExclusao();
  };

  return (
    <>
      <div className="text-[13px] text-slate-500 mb-3">Serviços cadastrados</div>

      {/* Lista de cards */}
      <div className="flex flex-col gap-4">
        {pagina.map((item) => (
          <article key={item.id} className={`rounded-[14px] border border-slate-200 card bg-white p-5 ${item.muted ? "pedido-muted" : ""}`}>
            <header className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <FaWrench />
                <span className="font-semibold">Pedido de serviço - {item.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="icon-btn" title="Editar" onClick={() => abrirEditar(item)}>
                  <FaEdit />
                </button>
                <button type="button" className="icon-btn" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                  <FaTrash />
                </button>
                <button type="button" className="icon-btn" title="Exibir" onClick={() => abrirExibir(item)}>
                  <FaExternalLinkAlt />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div className="md:col-span-2">
                <div className="text-slate-600 text-sm font-semibold">Nome Cliente</div>
                <div className="text-slate-900">{item.cliente}</div>
              </div>
              <div>
                <div className="text-slate-600 text-sm font-semibold">Data Lançamento</div>
                <div className="text-slate-900">{new Date(item.data).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-slate-600 text-sm font-semibold">Descrição</div>
                <div className="text-slate-900">{item.descricao}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-600 text-sm font-semibold mr-2">Status</div>
                <StatusPill status={item.status} />
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="text-slate-600 text-sm">{item.etapa}</div>
              <Progress value={item.progresso[0]} total={item.progresso[1]} dark={item.etapa === "Concluído"} />
            </div>
          </article>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">
          Mostrando {listaFiltrada.length ? start + 1 : 0}–{Math.min(end, listaFiltrada.length)} de {listaFiltrada.length} resultados
        </div>
        <div className="flex gap-2">
          <button onClick={anterior} disabled={page === 1} className={`btn btn-ghost ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
            ← Anterior
          </button>
          <button onClick={proxima} disabled={page === totalPages} className={`btn btn-ghost ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}>
            Próximo →
          </button>
        </div>
      </div>

      {/* Modal: Confirmar exclusão */}
      {modal.confirm && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharConfirmarExclusao(); }}>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-500 mt-1 text-xl" />
              <h2 className="text-[22px] font-bold text-center w-full text-slate-800">Tem certeza que deseja excluir o pedido?</h2>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>Sim</button>
              <button onClick={fecharConfirmarExclusao} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exibir */}
      {modal.view && current && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharExibir(); }}>
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pedido de serviço - {current.id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Nome Cliente</div>
                <div className="font-medium">{current.cliente}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Data lançamento</div>
                <div className="font-medium">{new Date(current.data).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-600">Descrição</div>
                <div className="font-medium">{current.descricao}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Status</div>
                <StatusPill status={current.status} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Etapa</div>
                <div className="font-medium">{current.etapa}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-600 mb-2">Progresso</div>
                <Progress value={current.progresso[0]} total={current.progresso[1]} dark={current.etapa === "Concluído"} />
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={fecharExibir} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Formulário (novo/editar) */}
      {modal.form && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, form: false })); }}>
          <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-400">
                <FaUser />
              </div>
              <h2 className="text-[22px] font-bold text-slate-800">{mode === "new" ? "Novo pedido de serviço" : `Editar pedido ${current?.id}`}</h2>
              <div className="ml-auto flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-slate-700 select-none">
                  <span className="text-sm">Status ativo</span>
                  <input
                    type="checkbox"
                    checked={form.status === "Ativo"}
                    onChange={(e) => setField("status", e.target.checked ? "Ativo" : "Finalizado")}
                    className="peer sr-only"
                  />
                  <span className="w-11 h-6 rounded-full bg-slate-300 relative transition peer-checked:bg-[#007EA7]">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition peer-checked:left-[22px]" />
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  value={form.cliente}
                  onChange={(e) => setField("cliente", e.target.value)}
                  placeholder="Nome do cliente"
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.cliente ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.cliente && <p className="text-rose-600 text-xs mt-1">{errors.cliente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de lançamento</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setField("data", e.target.value)}
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.data ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.data && <p className="text-rose-600 text-xs mt-1">{errors.data}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  value={form.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                  placeholder="Descrição do serviço"
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.descricao ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.descricao && <p className="text-rose-600 text-xs mt-1">{errors.descricao}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Etapa</label>
                  <input
                    value={form.etapa}
                    onChange={(e) => setField("etapa", e.target.value)}
                    placeholder="Ex.: Aguardando orçamento"
                    className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (valor)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.progressoValor}
                      onChange={(e) => setField("progressoValor", Number(e.target.value))}
                      className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.valor ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                    />
                    {errors.valor && <p className="text-rose-600 text-xs mt-1">{errors.valor}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (total)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.progressoTotal}
                      onChange={(e) => setField("progressoTotal", Number(e.target.value))}
                      className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.total ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                    />
                    {errors.total && <p className="text-rose-600 text-xs mt-1">{errors.total}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="submit" className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                {mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}
              </button>
              <button type="button" onClick={fecharTodos} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
