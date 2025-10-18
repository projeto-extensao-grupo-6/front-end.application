import React from "react";
import "./searchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function SearchBar({ placeholder = "Pesquisar...", value, onChange }) {
  return (
    <div className="search-bar-container">
      <span className="search-bar-icon">
        <FontAwesomeIcon icon={faSearch} />
      </span>
      <input
        type="text"
        className="search-bar"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar;