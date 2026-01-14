import React from 'react';
import './FormSelect.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Selecione uma opção',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`form-select ${className} ${error ? 'form-select--error' : ''}`}>
      <label htmlFor={name} className="form-select__label">
        {label}
        {required && <span className="form-select__required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="form-select__input"
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-select__error">{error}</span>}
    </div>
  );
};