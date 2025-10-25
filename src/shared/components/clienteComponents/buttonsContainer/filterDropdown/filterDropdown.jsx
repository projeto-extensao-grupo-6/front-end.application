import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

function FilterDropdown({ label, options, onSelect, hasRadioOptions = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const [radioSelected, setRadioSelected] = useState(options[0]);

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
    <div className="relative min-w-[150px] h-10 z-[100]">
      <div 
        className="w-full h-full px-4 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-md cursor-pointer font-roboto text-sm text-gray-800 transition-colors hover:border-blue-500" 
        onClick={handleToggle}
      >
        <span>{selected}</span>
        <span className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <FontAwesomeIcon icon={faAngleDown} />
        </span>
      </div>
      
      <div className={`absolute top-[calc(100%+4px)] left-0 w-full min-w-[200px] bg-white border border-gray-200 rounded-md shadow-md py-2 z-[1001] transition-all duration-300 ${
        isOpen 
          ? 'opacity-100 visible translate-y-0' 
          : 'opacity-0 invisible -translate-y-2.5'
      }`}>
        {hasRadioOptions ? (
          <div className="px-4 py-3 flex flex-col gap-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${label}-${index}`}
                  name={`${label}-order`}
                  value={option}
                  checked={radioSelected === option}
                  onChange={(e) => handleRadioChange(e.target.value)}
                  className="w-4 h-4 cursor-pointer accent-blue-500"
                />
                <label 
                  htmlFor={`${label}-${index}`}
                  className="font-roboto text-sm text-gray-800 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
            <button 
              className="mt-2 px-4 py-2 w-full bg-blue-500 text-white border-none rounded-md font-roboto font-semibold text-sm cursor-pointer transition-colors hover:bg-blue-600"
              onClick={handleApplyFilter}
            >
              Aplicar
            </button>
          </div>
        ) : (
          options.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2.5 cursor-pointer font-roboto text-sm text-gray-800 transition-colors hover:bg-gray-100"
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