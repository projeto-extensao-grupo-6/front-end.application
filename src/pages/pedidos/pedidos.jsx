import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaBars,
  FaUser,
  FaPlus,
  FaFilter,
  FaCheck,
} from "react-icons/fa";

const DADOS_PRODUTOS = [
  { id: "#001", itens: 3, total: "R$ 120,00", produto: "Ventosa dupla", descricao: "Ferramenta para manuseio de vidro", data: "2025-01-14", pagamento: "Pix" },
  { id: "#002", itens: 5, total: "R$ 250,00", produto: "Silicone neutro", descricao: "Silicone para vedação", data: "2025-01-13", pagamento: "Cartão de crédito" },
  { id: "#003", itens: 1, total: "R$ 60,00", produto: "Espaçador 8mm", descricao: "Espaçador para box", data: "2025-01-12", pagamento: "Dinheiro" },
  { id: "#004", itens: 2, total: "R$ 180,00", produto: "Trilho inox", descricao: "Trilho para porta de correr", data: "2025-01-11", pagamento: "Boleto" },
  { id: "#005", itens: 4, total: "R$ 40,00", produto: "Tucano grande", descricao: "Suporte de prateleira", data: "2025-01-10", pagamento: "Pix" },
  { id: "#006", itens: 1, total: "R$ 300,00", produto: "Lixa", descricao: "Descrição do produto", data: "2025-01-05", pagamento: "Cartão de débito" },
  { id: "#007", itens: 2, total: "R$ 80,00", produto: "Cola de silicone", descricao: "Descrição do produto", data: "2025-01-01", pagamento: "Cartão de crédito" },
  { id: "#008", itens: 6, total: "R$ 90,00", produto: "Batedor magnético", descricao: "Acessório para box", data: "2024-12-28", pagamento: "Pix" },
  { id: "#009", itens: 2, total: "R$ 55,00", produto: "Cunha plástica", descricao: "Calço para instalação", data: "2024-12-27", pagamento: "Dinheiro" },
];

const ITEMS_PER_PAGE = 3;
const NOVO_FORM = () => ({
  itens: 1,
  total: "",
  produto: "",
  descricao: "",
  data: new Date().toISOString().slice(0, 10),
  pagamento: "Pix",
});

export default function Pedidos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();
  const isPedidos = location.pathname === "/pedidos";

  // Estado principal
  const [lista, setLista] = useState(DADOS_PRODUTOS);
  const [page, setPage] = useState(1);

  // Modais e contextos
  const [modal, setModal] = useState({ view: false, form: false, confirm: false });
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
      if (e.key === "Escape") setModal({ view: false, form: false, confirm: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(lista.length / ITEMS_PER_PAGE));
    if (page > totalPages) setPage(totalPages);
  }, [lista, page]);

  const totalPages = Math.max(1, Math.ceil(lista.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pagina = useMemo(() => lista.slice(start, end), [lista, start, end]);

  const proxima = () => page < totalPages && setPage((p) => p + 1);
  const anterior = () => page > 1 && setPage((p) => p - 1);

  const abrirExibir = (item) => {
    setCurrent(item);
    setModal((m) => ({ ...m, view: true }));
  };

  const abrirEditar = (item) => {
    setMode("edit");
    setCurrent(item);
    setForm({
      itens: item.itens,
      total: item.total,
      produto: item.produto,
      descricao: item.descricao,
      data: item.data,
      pagamento: item.pagamento,
    });
    setErrors({});
    setModal((m) => ({ ...m, form: true }));
  };

  const abrirExcluir = (id) => {
    setTargetId(id);
    setModal((m) => ({ ...m, confirm: true }));
  };

  const validar = (f) => {
    const e = {};
    if (!String(f.produto).trim()) e.produto = "Informe o produto.";
    if (!String(f.total).trim()) e.total = "Informe o total (ex.: R$ 100,00).";
    if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
    if (!f.data) e.data = "Informe a data.";
    if (Number(f.itens) <= 0) e.itens = "Itens deve ser maior que 0.";
    return e;
  };

  const salvar = (e) => {
    e?.preventDefault();
    const errs = validar(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === "new") {
      const nums = lista
        .map((p) => parseInt(p.id.replace("#", ""), 10))
        .filter((n) => !Number.isNaN(n));
      const prox = Math.max(0, ...nums) + 1;
      const novo = { id: `#${String(prox).padStart(3, "0")}`, ...form, itens: Number(form.itens) };
      setLista((prev) => [novo, ...prev]);
      setPage(1);
    } else {
      setLista((prev) =>
        prev.map((p) => (p.id === current.id ? { ...p, ...form, itens: Number(form.itens) } : p))
      );
    }

    setCurrent(null);
    setModal((m) => ({ ...m, form: false }));
  };

  const confirmarExclusao = () => {
    setLista((prev) => prev.filter((p) => p.id !== targetId));
    setTargetId(null);
    setModal((m) => ({ ...m, confirm: false }));
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

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

                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-1">
                  <Link
                    to="/pedidos"
                    className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer ${isPedidos ? "bg-[#264168] text-white" : "hover:bg-white text-slate-600"
                      }`}
                    title="Pedidos"
                  >
                    <FaBoxOpen />
                  </Link>
                  <Link
                    to="/servicos"
                    className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer ${!isPedidos ? "bg-[#E7EEF3] text-[#0F172A]" : "hover:bg-white text-black"
                      }`}
                    title="Serviços"
                  >
                    <FaCheck />
                  </Link>
                </div>
              </div>
            </div>


            {/* Conteúdo da página */}
            <div className="text-[13px] text-slate-500 mb-3 mt-8 text-left">Pedidos cadastrados</div>
            <div className="flex flex-col gap-4">
              {pagina.map((p) => (
                <article
                  key={p.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Cabeçalho */}
                  <header className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-slate-600 rounded cursor-pointer"
                      />
                      <FaBoxOpen className="text-slate-500 text-lg" />
                      <span className="font-medium text-slate-700">
                        Pedido de produtos - {p.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="text-slate-500 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                        title="Editar"
                        onClick={() => abrirEditar(p)}
                      >
                        <FaEdit className="text-[18px]" />
                      </button>
                      <button
                        className="text-slate-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Excluir"
                        onClick={() => abrirExcluir(p.id)}
                      >
                        <FaTrash className="text-[18px]" />
                      </button>
                    </div>
                  </header>

                  {/* Corpo dos dados */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-1 text-sm text-slate-700">
                    <div>
                      <div className="text-slate-500 font-medium mb-1">Itens</div>
                      <div className="text-slate-900 leading-tight">
                        {p.itens} {p.itens > 1 ? "Itens" : "Item"}
                        <br />
                        <span className="font-semibold">{p.total}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-medium mb-1">Produtos</div>
                      <div className="text-slate-900 font-semibold leading-tight">
                        {p.produto}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-slate-500 font-medium mb-1">Descrição</div>
                      <div className="text-slate-900 leading-tight">{p.descricao}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-medium mb-1">Data da compra</div>
                      <div className="text-slate-900 leading-tight">
                        {new Date(p.data).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-medium mb-1">Forma de pagamento</div>
                      <div className="text-slate-900 font-semibold leading-tight">
                        {p.pagamento}
                      </div>
                    </div>
                  </div>
                </article>

              ))}

              {/* Paginação */}
              <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
                <div>
                  Mostrando {lista.length ? start + 1 : 0}–{Math.min(end, lista.length)} de{" "}
                  {lista.length} resultados
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={anterior}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition ${page === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={proxima}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Modais */}
      {modal.view && current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, view: false })); }}>
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pedido de produtos - {current.id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-slate-600">Itens</div><div className="font-medium">{current.itens}</div></div>
              <div><div className="text-sm text-slate-600">Total</div><div className="font-medium">{current.total}</div></div>
              <div><div className="text-sm text-slate-600">Produto</div><div className="font-medium">{current.produto}</div></div>
              <div><div className="text-sm text-slate-600">Data da compra</div><div className="font-medium">{new Date(current.data).toLocaleDateString("pt-BR")}</div></div>
              <div className="md:col-span-2"><div className="text-sm text-slate-600">Descrição</div><div className="font-medium">{current.descricao}</div></div>
              <div className="md:col-span-2"><div className="text-sm text-slate-600">Forma de pagamento</div><div className="font-medium">{current.pagamento}</div></div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setModal((m) => ({ ...m, view: false }))} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {modal.form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, form: false })); }}>
          <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-[22px] font-bold text-slate-800 mb-4">{mode === "new" ? "Novo pedido de produtos" : `Editar pedido ${current?.id}`}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Itens</label>
                <input type="number" min={1} value={form.itens} onChange={(e) => setField("itens", Number(e.target.value))} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.itens ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.itens && <p className="text-rose-600 text-xs mt-1">{errors.itens}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total</label>
                <input value={form.total} onChange={(e) => setField("total", e.target.value)} placeholder="Ex.: R$ 100,00" className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.total ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.total && <p className="text-rose-600 text-xs mt-1">{errors.total}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
                <input value={form.produto} onChange={(e) => setField("produto", e.target.value)} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.produto ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.produto && <p className="text-rose-600 text-xs mt-1">{errors.produto}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da compra</label>
                <input type="date" value={form.data} onChange={(e) => setField("data", e.target.value)} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.data ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.data && <p className="text-rose-600 text-xs mt-1">{errors.data}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.descricao ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`} />
                {errors.descricao && <p className="text-rose-600 text-xs mt-1">{errors.descricao}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pagamento</label>
                <select value={form.pagamento} onChange={(e) => setField("pagamento", e.target.value)} className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]">
                  <option>Pix</option>
                  <option>Cartão de crédito</option>
                  <option>Cartão de débito</option>
                  <option>Dinheiro</option>
                  <option>Boleto</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="submit" className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>{mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}</button>
              <button type="button" onClick={() => setModal((m) => ({ ...m, form: false }))} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {modal.confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, confirm: false })); }}>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-[22px] font-bold text-slate-800 text-center">Tem certeza que deseja excluir o pedido?</h2>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>Sim</button>
              <button onClick={() => setModal((m) => ({ ...m, confirm: false }))} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}