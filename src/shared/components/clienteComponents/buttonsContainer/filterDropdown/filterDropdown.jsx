import { useState } from "react";
import "./filterDropdown.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

function FilterDropdown({ label, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div className="filter-dropdown" onClick={handleToggle}>
      <span>{selected}</span>
      <span className="filter-dropdown-icon">
        <FontAwesomeIcon icon={faAngleDown} />
      </span>
      <div className={`filter-dropdown-menu ${isOpen ? "active" : ""}`}>
        {options.map((option, index) => (
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
        ))}
      </div>
    </div>
  );
}

export default FilterDropdown;