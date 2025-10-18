import React from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './pages/login/login.jsx'
import Cadastro from './pages/cadastro/cadastro.jsx'
import HistoricoClientes from './pages/clientes/historico-clientes.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/historico-clientes" element={<HistoricoClientes />} />
    </Routes>
  )
}

export default App
