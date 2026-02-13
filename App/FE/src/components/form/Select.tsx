import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: boolean | string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className = "",
  error = "",
}) => {
  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border ${
        error
          ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
          : "border-neutral-300"
      } bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white/90 ${
        value ? "text-neutral-800 dark:text-white/90" : "text-neutral-400"
      } ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value=''>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
