import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Select options",
}) => {
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] =
    useState<string[]>(defaultSelected);
  const selectedOptions = isControlled ? value! : internalSelected;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.text.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const updateSelection = (newSelected: string[]) => {
    if (!isControlled) setInternalSelected(newSelected);
    onChange?.(newSelected);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    const newSelected = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((v) => v !== optionValue)
      : [...selectedOptions, optionValue];
    updateSelection(newSelected);
  };

  const removeOption = (optionValue: string) => {
    updateSelection(selectedOptions.filter((v) => v !== optionValue));
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>

      <div
        className={`flex min-h-11 cursor-pointer flex-wrap gap-2 rounded-lg border px-3 py-2 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((value) => {
            const text =
              options.find((o) => o.value === value)?.text || value;
            return (
              <span
                key={value}
                className="flex items-center gap-1 rounded-full bg-neutral-200 dark:bg-neutral-800 px-3 py-1 text-sm"
              >
                {text}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(value);
                  }}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-sm text-neutral-400">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-neutral-50 dark:bg-neutral-900 shadow-lg">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded border px-3 py-1 text-sm outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="p-3 text-sm text-neutral-400">
                No result
              </div>
            )}

            {filteredOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.value);

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    isSelected ? "bg-neutral-200 dark:bg-neutral-800 font-medium" : ""
                  }`}
                >
                  {option.text}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
