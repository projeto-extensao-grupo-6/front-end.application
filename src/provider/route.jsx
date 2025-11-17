import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/login/login.jsx';
import Cadastro from '../pages/cadastro/cadastro.jsx';
import PaginaInicial from '../pages/paginaInicial/paginaInicial.jsx';
import Funcionarios from '../pages/funcionarios/funcionarios.jsx';
import Clientes from '../pages/clientes/clientes.jsx';
import Estoque from '../pages/estoque/estoque.jsx';
import Pedidos from '../pages/pedidos/pedidos.jsx';
import Acesso from '../pages/acesso/acesso.jsx';
import CalendarDashboard from '../pages/calendar-dashboard.jsx/index.jsx';
import Perfil from '../pages/perfil/perfil.jsx';

export const routes = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  { path: '/paginaInicial', element: <PaginaInicial /> },
  { path: '/funcionarios', element: <Funcionarios /> },
  { path: '/clientes', element: <Clientes /> },
  { path: '/estoque', element: <Estoque /> },
  { path: '/pedidos', element: <Pedidos /> },
  { path: '/acesso', element: <Acesso /> },
  { path: '/agendamentos', element: <CalendarDashboard /> },
  { path: '/perfil', element: <Perfil />}
]);