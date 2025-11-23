import React, { useState } from "react";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";

export default function Acesso() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-20px" />
        <main className="flex-1 p-8">
          <div className="mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Acesso</h1>
            <p className="text-gray-500 text-lg">Visualize todos os funcionários de sua empresa</p>
          </div>
        </main>
      </div>
    </div>
  );
}