import React, { useEffect, useMemo, useState } from "react";
import "./pedidos.css";
import { FaBoxOpen, FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";

const DADOS_PRODUTOS = [
  { id: "#009", itens: 3, total: "R$ 120,00", produto: "Ventosa dupla",     descricao: "Ferramenta para manuseio de vidro", data: "2025-01-14", pagamento: "Pix" },
  { id: "#008", itens: 5, total: "R$ 250,00", produto: "Silicone neutro",   descricao: "Silicone para vedação",              data: "2025-01-13", pagamento: "Cartão de crédito" },
  { id: "#007", itens: 1, total: "R$ 60,00",  produto: "Espaçador 8mm",     descricao: "Espaçador para box",                 data: "2025-01-12", pagamento: "Dinheiro" },
  { id: "#006", itens: 2, total: "R$ 180,00", produto: "Trilho inox",       descricao: "Trilho para porta de correr",        data: "2025-01-11", pagamento: "Boleto" },
  { id: "#005", itens: 4, total: "R$ 40,00",  produto: "Tucano grande",     descricao: "Suporte de prateleira",              data: "2025-01-10", pagamento: "Pix" },
  { id: "#004", itens: 1, total: "R$ 300,00", produto: "Lixa",              descricao: "Descrição do produto",               data: "2025-01-05", pagamento: "Cartão de débito" },
  { id: "#003", itens: 2, total: "R$ 80,00",  produto: "Cola de silicone",  descricao: "Descrição do produto",               data: "2025-01-01", pagamento: "Cartão de crédito" },
  { id: "#002", itens: 6, total: "R$ 90,00",  produto: "Batedor magnético", descricao: "Acessório para box",                 data: "2024-12-28", pagamento: "Pix" },
  { id: "#001", itens: 2, total: "R$ 55,00",  produto: "Cunha plástica",    descricao: "Calço para instalação",              data: "2024-12-27", pagamento: "Dinheiro" },
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

export default function ProdutosPage() {
  /* ===== Estado principal ===== */
  const [lista, setLista] = useState(DADOS_PRODUTOS);
  const [page, setPage] = useState(1);

  // Modais e contexto atual
  const [modal, setModal] = useState({ view: false, form: false, confirm: false });
  const [mode, setMode] = useState("new"); // novo | edit
  const [current, setCurrent] = useState(null); // item sendo visualizado/editado
  const [targetId, setTargetId] = useState(null); // id do item a excluir

  const [form, setForm] = useState(NOVO_FORM());
  const [errors, setErrors] = useState({});

  // Abre "novo" via evento global (reuso c/ outras páginas)
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

  // Esse bloco serve pra quando apertar ESC, fecha o modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModal({ view: false, form: false, confirm: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Aqui ajusta página se a lista mudar
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

  // Aqui abre o modal de edicao 
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

  //Aqui abre o de excluir
  const abrirExcluir = (id) => {
    setTargetId(id);
    setModal((m) => ({ ...m, confirm: true }));
  };

  const fecharTodos = () => setModal({ view: false, form: false, confirm: false });

  /* ===== Validação simples ===== */
  const validar = (f) => {
    const e = {};
    if (!String(f.produto).trim()) e.produto = "Informe o produto.";
    if (!String(f.total).trim()) e.total = "Informe o total (ex.: R$ 100,00).";
    if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
    if (!f.data) e.data = "Informe a data.";
    if (Number(f.itens) <= 0) e.itens = "Itens deve ser maior que 0.";
    return e;
  };

  /* ===== CRUD (mock) ===== */
  const salvar = (e) => {
    e?.preventDefault();
    const errs = validar(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === "new") {
      // Aqui faz a criacao igual ao do POST
      const nums = lista
        .map((p) => parseInt(p.id.replace("#", ""), 10))
        .filter((n) => !Number.isNaN(n));
      const prox = Math.max(0, ...nums) + 1;
      const novo = { id: `#${String(prox).padStart(3, "0")}`, ...form, itens: Number(form.itens) };
      setLista((prev) => [novo, ...prev]);
      setPage(1); // mostra o novo na primeira página
    } else {
      // Aqui faz a criacao do PUT
      setLista((prev) =>
        prev.map((p) => (p.id === current.id ? { ...p, ...form, itens: Number(form.itens) } : p))
      );
    }

    setCurrent(null);
    setModal((m) => ({ ...m, form: false }));
  };

  const confirmarExclusao = () => {
    // Aqui faz a criacao do DELETE
    setLista((prev) => prev.filter((p) => p.id !== targetId));
    setTargetId(null);
    setModal((m) => ({ ...m, confirm: false }));
  };

  /* ===== Helpers ===== */
  //Atualiza só um campo especifico do formulario, sem apagar o resto
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  return (
    <>
      <div className="text-[13px] text-slate-500 mb-3">Pedidos cadastrados</div>

      <div className="flex flex-col gap-4">
        {pagina.map((p) => (
          <article key={p.id} className="rounded-[14px] border border-slate-200 card bg-white p-5">
            {/* Cabeçalho do card */}
            <header className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <FaBoxOpen />
                <span className="font-semibold">Pedido de produtos - {p.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="icon-btn" title="Editar" onClick={() => abrirEditar(p)}>
                  <FaEdit />
                </button>
                <button className="icon-btn" title="Excluir" onClick={() => abrirExcluir(p.id)}>
                  <FaTrash />
                </button>
                <button className="icon-btn" title="Exibir" onClick={() => abrirExibir(p)}>
                  <FaExternalLinkAlt />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div>
                <div className="text-slate-600 text-sm font-semibold">Itens</div>
                <div className="text-slate-900">
                  {p.itens} {p.itens > 1 ? "Itens" : "Item"}
                  <br />
                  {p.total}
                </div>
              </div>

              <div>
                <div className="text-slate-600 text-sm font-semibold">Produtos</div>
                <div className="text-slate-900">{p.produto}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-slate-600 text-sm font-semibold">Descrição</div>
                <div className="text-slate-900">{p.descricao}</div>
              </div>

              <div>
                <div className="text-slate-600 text-sm font-semibold">Data da compra</div>
                <div className="text-slate-900">{new Date(p.data).toLocaleDateString("pt-BR")}</div>
              </div>

              <div>
                <div className="text-slate-600 text-sm font-semibold">Forma de pagamento</div>
                <div className="text-slate-900">{p.pagamento}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Rodapé com paginação */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">
          Mostrando {lista.length ? start + 1 : 0}–{Math.min(end, lista.length)} de {lista.length} resultados
        </div>
        <div className="flex gap-2">
          <button onClick={anterior} disabled={page === 1} className={`btn btn-ghost ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
            ← Anterior
          </button>
          <button
            onClick={proxima}
            disabled={page === totalPages}
            className={`btn btn-ghost ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Modal: Exibir */}
      {modal.view && current && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal((m) => ({ ...m, view: false }));
          }}
        >
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pedido de produtos - {current.id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Itens</div>
                <div className="font-medium">{current.itens}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Total</div>
                <div className="font-medium">{current.total}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Produto</div>
                <div className="font-medium">{current.produto}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Data da compra</div>
                <div className="font-medium">{new Date(current.data).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-600">Descrição</div>
                <div className="font-medium">{current.descricao}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-600">Forma de pagamento</div>
                <div className="font-medium">{current.pagamento}</div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setModal((m) => ({ ...m, view: false }))} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo/Editar */}
      {modal.form && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal((m) => ({ ...m, form: false }));
          }}
        >
          <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-[22px] font-bold text-slate-800 mb-4">
              {mode === "new" ? "Novo pedido de produtos" : `Editar pedido ${current?.id}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Itens</label>
                <input
                  type="number"
                  min={1}
                  value={form.itens}
                  onChange={(e) => setField("itens", Number(e.target.value))}
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.itens ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.itens && <p className="text-rose-600 text-xs mt-1">{errors.itens}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total</label>
                <input
                  value={form.total}
                  onChange={(e) => setField("total", e.target.value)}
                  placeholder="Ex.: R$ 100,00"
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.total ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.total && <p className="text-rose-600 text-xs mt-1">{errors.total}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
                <input
                  value={form.produto}
                  onChange={(e) => setField("produto", e.target.value)}
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.produto ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.produto && <p className="text-rose-600 text-xs mt-1">{errors.produto}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da compra</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setField("data", e.target.value)}
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.data ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.data && <p className="text-rose-600 text-xs mt-1">{errors.data}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  value={form.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                  className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.descricao ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                />
                {errors.descricao && <p className="text-rose-600 text-xs mt-1">{errors.descricao}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pagamento</label>
                <select
                  value={form.pagamento}
                  onChange={(e) => setField("pagamento", e.target.value)}
                  className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]"
                >
                  <option>Pix</option>
                  <option>Cartão de crédito</option>
                  <option>Cartão de débito</option>
                  <option>Dinheiro</option>
                  <option>Boleto</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="submit" className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                {mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={() => setModal((m) => ({ ...m, form: false }))}
                className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Confirmar exclusão */}
      {modal.confirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal((m) => ({ ...m, confirm: false }));
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-[22px] font-bold text-slate-800 text-center">Tem certeza que deseja excluir o pedido?</h2>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                Sim
              </button>
              <button
                onClick={() => setModal((m) => ({ ...m, confirm: false }))}
                className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
