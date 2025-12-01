import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/login/login.jsx';
import Cadastro from '../pages/cadastro/cadastro.jsx';
import PaginaInicial from '../pages/paginaInicial/paginaInicial.jsx';
import Funcionarios from '../pages/funcionarios/funcionarios.jsx';
import Clientes from '../pages/clientes/clientes.jsx';
import Estoque from '../pages/estoque/estoque.jsx';
import ProdutoDetalhe from '../pages/estoque/ProdutoDetalhe.jsx';
import Pedidos from '../pages/pedidos/pedidos.jsx';
import Solicitacoes from '../pages/solicitacoes/Solicitacoes.jsx';
import CalendarDashboard from '../pages/calendar-dashboard/index.jsx';
import Perfil from '../pages/perfil/perfil.jsx';
import MapContainer from '../pages/geoLocalizacao/MapContainer.jsx';
import NovaSenha from '../pages/novaSenha/novaSenha.jsx';
import EsqueceuSenha from '../pages/esqueceuSenha/EsqueceuSenha.jsx';

export const routes = createBrowserRouter([
  { path: '/', element: <Login /> }, 
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  { path: '/paginaInicial', element: <ProtectedRoute><PaginaInicial /></ProtectedRoute> },
  { path: '/funcionarios', element: <ProtectedRoute><Funcionarios /></ProtectedRoute> },
  { path: '/clientes', element: <ProtectedRoute><Clientes /></ProtectedRoute> },
  { path: '/estoque', element: <ProtectedRoute><Estoque /></ProtectedRoute> },
  { path: '/pedidos', element: <ProtectedRoute><Pedidos /></ProtectedRoute> },
  { path: '/acesso', element: <ProtectedRoute><Solicitacoes /></ProtectedRoute> },
  { path: '/agendamentos', element: <ProtectedRoute><CalendarDashboard /></ProtectedRoute> },
  { path: '/estoque/:id', element: <ProtectedRoute><ProdutoDetalhe /></ProtectedRoute> }, 
  { path: '/primeiroAcesso/:idUsuario', element: <ProtectedRoute><NovaSenha/></ProtectedRoute>},
  { path: '/perfil', element: <ProtectedRoute><Perfil /></ProtectedRoute> },
  { path: '/geoLocalizacao', element: <ProtectedRoute><MapContainer /></ProtectedRoute> },
  { path: '/esqueceuSenha', element: <EsqueceuSenha /> },

]);