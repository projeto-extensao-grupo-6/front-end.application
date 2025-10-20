import React from "react";
import { Button as MUIButton } from "@mui/material";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
}) {
  const base =
    "rounded-lg font-semibold transition-all duration-300 flex justify-center items-center";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <MUIButton
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disableElevation
    >
      {children}
    </MUIButton>
  );
}
