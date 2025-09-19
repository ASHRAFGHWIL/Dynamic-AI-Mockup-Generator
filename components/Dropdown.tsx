import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

interface DropdownProps {
  label: string;
  options: (DropdownOption | DropdownGroup)[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const isGroup = (option: DropdownOption | DropdownGroup): option is DropdownGroup => {
  return 'options' in option;
};

const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedValue, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSelectedLabel = () => {
    for (const option of options) {
      if (isGroup(option)) {
        const found = option.options.find(o => o.value === selectedValue);
        if (found) return found.label;
      } else {
        if (option.value === selectedValue) return option.label;
      }
    }
    return label;
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm pl-4 pr-10 py-3 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate text-gray-800 dark:text-gray-200">{getSelectedLabel()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          tabIndex={-1}
          role="listbox"
          aria-labelledby="listbox-label"
        >
          {options.map((option, index) =>
            isGroup(option) ? (
              <li key={`group-${option.label}-${index}`}>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{option.label}</div>
                {option.options.map(subOption => (
                   <li
                    key={subOption.value}
                    onClick={() => {
                      onValueChange(subOption.value);
                      setIsOpen(false);
                    }}
                    className="text-gray-900 dark:text-gray-200 cursor-pointer select-none relative py-2 pl-6 pr-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="option"
                    aria-selected={subOption.value === selectedValue}
                  >
                    <span className={`block truncate ${subOption.value === selectedValue ? 'font-semibold' : 'font-normal'}`}>{subOption.label}</span>
                  </li>
                ))}
              </li>
            ) : (
              <li
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className="text-gray-900 dark:text-gray-200 cursor-pointer select-none relative py-2 pl-4 pr-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="option"
                aria-selected={option.value === selectedValue}
              >
                <span className={`block truncate ${option.value === selectedValue ? 'font-semibold' : 'font-normal'}`}>{option.label}</span>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;