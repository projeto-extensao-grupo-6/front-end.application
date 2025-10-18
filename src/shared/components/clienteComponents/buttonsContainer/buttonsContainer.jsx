import React from "react";
import "./buttonsContainer.css";

function ButtonsContainer({ children }) {
  return <div className="buttons-container">{children}</div>;
}

export default ButtonsContainer;