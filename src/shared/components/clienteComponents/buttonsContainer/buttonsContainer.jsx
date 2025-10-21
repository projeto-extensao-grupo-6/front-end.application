import React from "react";

function ButtonsContainer({ children }) {
  return (
    <div className="w-[calc(100%-2vw)] h-[5vh] 
                    absolute top-[2vh] left-[1vw] z-[100] flex items-center justify-between 
                    gap-3 opacity-100 rotate-0 box-border">
      {children}
    </div>
  );
}

export default ButtonsContainer;