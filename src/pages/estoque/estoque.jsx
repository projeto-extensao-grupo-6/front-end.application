// import React, { useState } from "react";
// import Header from "../../shared/components/header/header";
// import Sidebar from "../../shared/components/sidebar/sidebar";

// export default function Estoque() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       <div className="flex-1 flex flex-col min-h-screen">
//         <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//         <div className="h-[80px]" />
//         <main className="flex-1 p-8">
//           <div className="max-w-[1800px] mx-auto text-center">
//             <h1 className="text-3xl font-bold text-gray-800">Estoque</h1>
//             <p className="text-gray-500 text-lg">Visualize todos os funcionários de sua empresa</p>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Package,
  ArrowUp,
  Search,
  CalendarDays,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// --- Componente de KPIs (Adaptado para o Estoque) ---
const EstoqueKpis = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <Package className="w-5 h-5 text-gray-400" />
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          {stat.caption && (
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              {stat.captionColor === 'green' && <ArrowUp className="w-4 h-4 mr-1 text-green-500" />}
              {stat.caption}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
);

// --- Componente Principal Estoque ---
export default function Estoque() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Dados dos KPIs de Estoque
  const kpiData = [
    {
      title: "Total de produtos em estoque",
      value: "0,00",
      caption: "+00% este mês",
      captionColor: 'green'
    },
    {
      title: "Itens com baixo estoque",
      value: "0,00",
      caption: "0 atualmente",
    },
    {
      title: "Produto em alta",
      value: "0,00",
      caption: "0 atualmente",
    },
    {
      title: "Itens fora de estoque",
      value: "0,00",
      caption: "0 atualmente",
    },
  ];

  // Dados da Tabela de Itens
  const itensEstoque = [
    {
      nome: "Vidro",
      descricao: "-",
      preco: "R$ 8,50",
      quantidade: 8,
      situacao: "Disponível",
      checked: false,
    },
    {
      nome: "Parafusadeira Canhão",
      descricao: "Para parafusadeira com ímã",
      preco: "R$ 26,50",
      quantidade: 2,
      situacao: "Abaixo do normal",
      checked: false,
    },
    {
      nome: "Protetor auditivo",
      descricao: "-",
      preco: "R$ 5,00",
      quantidade: 10,
      situacao: "Disponível",
      checked: true,
    },
    {
      nome: "Roldana mini preta",
      descricao: "-",
      preco: "R$ 3,00",
      quantidade: 9,
      situacao: "Disponível",
      checked: false,
    },
    {
      nome: "Tucano grande",
      descricao: "Suporte de prateleira",
      preco: "R$ 23,00",
      quantidade: 2,
      situacao: "Abaixo do normal",
      checked: true,
    },
    {
      nome: "Fecho para porta",
      descricao: "Branco",
      preco: "R$ 10,00",
      quantidade: 1,
      situacao: "Abaixo do normal",
      checked: true,
    },
  ];

  // Estado para a pesquisa e filtros (apenas para simular o visual)
  const [searchTerm, setSearchTerm] = useState("Vidro fosco"); // Simula o filtro ativo
  const [selectedItems, setSelectedItems] = useState(itensEstoque.filter(item => item.checked).map(item => item.nome));

  const handleCheckboxChange = (nome) => {
    setSelectedItems(prev =>
      prev.includes(nome)
        ? prev.filter(item => item !== nome)
        : [...prev, nome]
    );
  };

  // Função para determinar a cor do badge de situação
  const getSituacaoColor = (situacao) => {
    switch (situacao) {
      case "Disponível":
        return "bg-green-100 text-green-700";
      case "Abaixo do normal":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        {/* Adiciona padding para evitar que o conteúdo fique atrás do Header fixo */}
        <div className="pt-20 lg:pt-[80px]" /> 
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-[1800px] mx-auto">
       

            {/* KPIs */}
            <EstoqueKpis stats={kpiData} />

            {/* Tabela de Estoque */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 hidden">Controle de estoque</h2>

              {/* Barra de Ações e Pesquisa */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <button className="w-full md:w-auto bg-[#003d6b] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002a4d] transition-colors flex items-center justify-center">
                  Novo Item
                </button>

                {/* Pesquisa e Filtros */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  
                  {/* Campo de Pesquisa */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#003d6b] focus:border-[#003d6b] text-sm"
                    />
                    {/* Simulação do filtro ativo */}
                    {searchTerm && (
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-0 pr-4">
                            <span className="flex items-center bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                {searchTerm}
                                <button onClick={() => setSearchTerm('')} className="ml-1 text-gray-500 hover:text-gray-800">
                                    &times;
                                </button>
                            </span>
                        </div>
                    )}
                  </div>

                  {/* Botões de Filtro */}
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 border border-gray-300 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <CalendarDays className="w-4 h-4" /> Data
                    </button>
                    <button className="flex items-center gap-2 border border-gray-300 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" /> Filtrar
                    </button>
                    <button className="flex items-center gap-2 border border-gray-300 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" /> Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#003d6b] border-gray-300 rounded focus:ring-[#003d6b]"
                          // Adicionar lógica para selecionar todos
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade em estoque
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itensEstoque.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.nome)}
                            onChange={() => handleCheckboxChange(item.nome)}
                            className={`w-4 h-4 ${selectedItems.includes(item.nome) ? 'text-[#003d6b] border-[#003d6b] bg-gray-200' : 'text-gray-400 border-gray-300'} rounded focus:ring-[#003d6b]`}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.nome}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.descricao}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.preco}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantidade}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSituacaoColor(item.situacao)}`}
                          >
                            {item.situacao}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-700">
                  Mostrando 1-6 de <span className="font-medium">10</span> resultados
                </p>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 border border-gray-300 py-1.5 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <button className="flex items-center gap-1 bg-[#003d6b] text-white py-1.5 px-3 rounded-md text-sm hover:bg-[#002a4d] transition-colors">
                        Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
