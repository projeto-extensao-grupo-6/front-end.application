import React from "react";


function PaginationContainer({ currentPage, itemsPerPage, totalItems, children }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-[calc(100%-2vw)] h-[5vh] absolute bottom-[2vh] left-[1vw] 
                    flex items-center justify-between gap-3 px-4 border-t 
                  border-gray-200 opacity-100 box-border">
      
      <span className="font-roboto text-sm font-semibold text-black">
        Mostrando {startItem}-{endItem} de {totalItems} resultados
      </span>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
}

export default PaginationContainer;