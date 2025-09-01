import React from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './pages/login/login.jsx'
import Cadastro from './pages/cadastro/cadastro.jsx'
import FlowController from './pages/flowController/flowController.jsx';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/FlowController" element={<FlowController />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
  )
}

export default App
