import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function SearchBar({ placeholder = "Pesquisar...", value, onChange }) {
  return (
    <div className="relative w-full max-w-[629px] flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <input
        type="text"
        className="min-w-[300px] w-full max-w-[629px] h-[38px] relative rounded-md border border-gray-200 opacity-100 pl-10 pr-3 py-2 flex items-center box-border bg-white text-gray-800 font-roboto font-normal text-sm leading-5 tracking-normal transition-colors focus:outline-none focus:border-blue-500 hover:border-gray-300 placeholder:text-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar;