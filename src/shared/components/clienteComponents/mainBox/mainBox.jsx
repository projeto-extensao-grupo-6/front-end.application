import React from "react";

function MainBox({ children }) {
  return (
    <div className="w-[90vw] h-[80vh] absolute top-[15%] left-[5%]
     right-[5%] rounded border border-gray-200 opacity-100 bg-white box-border">
      {children}
    </div>
  );
}

export default MainBox; 