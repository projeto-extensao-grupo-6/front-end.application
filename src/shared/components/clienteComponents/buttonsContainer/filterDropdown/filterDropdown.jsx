import { useState } from "react";
import "./filterDropdown.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

function FilterDropdown({ label, options, onSelect, hasRadioOptions = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const [radioSelected, setRadioSelected] = useState(options[0]); // Primeira opção selecionada por padrão

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  const handleRadioChange = (value) => {
    setRadioSelected(value);
  };

  const handleApplyFilter = () => {
    setIsOpen(false);
    setSelected(radioSelected);
    if (onSelect) onSelect(radioSelected);
  };

  return (
    <div className="filter-dropdown">
      <div className="filter-dropdown-trigger" onClick={handleToggle}>
        <span>{selected}</span>
        <span className="filter-dropdown-icon">
          <FontAwesomeIcon icon={faAngleDown} />
        </span>
      </div>
      
      <div className={`filter-dropdown-menu ${isOpen ? "active" : ""}`}>
        {hasRadioOptions ? (
          <div className="filter-dropdown-radio-container">
            {options.map((option, index) => (
              <div key={index} className="filter-dropdown-radio-option">
                <input
                  type="radio"
                  id={`${label}-${index}`}
                  name={`${label}-order`}
                  value={option}
                  checked={radioSelected === option}
                  onChange={(e) => handleRadioChange(e.target.value)}
                />
                <label htmlFor={`${label}-${index}`}>{option}</label>
              </div>
            ))}
            <button 
              className="filter-dropdown-apply-btn"
              onClick={handleApplyFilter}
            >
              Aplicar
            </button>
          </div>
        ) : (
          options.map((option, index) => (
            <div
              key={index}
              className="filter-dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {option}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FilterDropdown;