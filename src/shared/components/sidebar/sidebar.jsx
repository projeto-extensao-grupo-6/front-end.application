import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dashboard,
  Inventory,
  Event,
  People,
  Lock,
  Work,
  Logout,
  ChevronLeft,
  Assignment,
} from "@mui/icons-material";
import Logo from "../../../assets/logo/logo-sidebar.png";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { text: "Painel de Controle", icon: <Dashboard /> },
    { text: "Controle de Estoque", icon: <Inventory /> },
    { text: "Agendamentos", icon: <Event /> },
    { text: "Clientes", icon: <People /> },
    { text: "Controle de Acesso", icon: <Lock /> },
    { text: "Controle de Funcionários", icon: <Work /> },
    { text: "Pedidos e Serviços", icon: <Assignment /> },
  ];

  return (
    <>
      {/* Overlay escurecido */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[1300] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed top-0 left-0 h-full w-[270px] bg-white text-gray-700 shadow-2xl z-[1400] flex flex-col"
      >
        <div
          className="relative flex flex-col items-center px-4"
          style={{ paddingTop: "16px", paddingBottom: "32px" }}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition cursor-pointer"
          >
            <ChevronLeft style={{ fontSize: 36 }} />
          </button>

          <img
            src={Logo}
            alt="Logo"
            className="w-[50%] h-auto object-contain my-4"
          />
        </div>

        <div className="flex-grow overflow-y-auto flex flex-col items-start">
          <ul
            className="flex flex-col gap-4 w-full mt-2"
            style={{ paddingLeft: "2rem" }}
          >
            {menuItems.map((item, i) => (
              <li key={i} className="w-full flex justify-start">
                <button
                  className="flex items-center gap-2 w-fit text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  style={{ marginLeft: 0 }}
                >
                  <span
                    className="text-gray-600"
                    style={{ fontSize: "1.5rem" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-base font-medium">{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mt-auto pt-8 flex justify-start"
          style={{ paddingLeft: "2rem", paddingBottom: "3rem" }}
        >
          <button
            className="flex items-center gap-2 w-full text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-xl transition text-lg font-bold cursor-pointer"
            style={{ fontSize: "1.125rem" }}
          >
            <Logout style={{ fontSize: 28 }} />
            <span>Sair</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
