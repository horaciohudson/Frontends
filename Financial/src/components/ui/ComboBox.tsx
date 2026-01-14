// Componente ComboBox reutilizável

import React from 'react';
import './ComboBox.css';

export interface ComboBoxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface ComboBoxProps {
  id?: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  options: ComboBoxOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  loading?: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  required = false,
  className = '',
  error,
  loading = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange('');
    } else {
      // Tentar converter para número se possível, senão manter como string
      const numValue = Number(selectedValue);
      onChange(isNaN(numValue) ? selectedValue : numValue);
    }
  };

  return (
    <div className={`combobox-container ${className}`} style={{position: 'relative', width: '100%'}}>
      <select
        id={id}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={`combobox ${error ? 'error' : ''} ${loading ? 'loading' : ''}`}
        style={{
          width: '100%',
          padding: '8px 32px 8px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: '#fff',
          appearance: 'none',
          backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '16px'
        }}
      >
        <option value="">
          {loading ? 'Carregando...' : placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default ComboBox;