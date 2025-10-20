import React from "react";

export default function InputText({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-gray-500">{icon}</div>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
        />
      </div>
    </div>
  );
}