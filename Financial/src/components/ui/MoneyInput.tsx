import React, { useState, useEffect } from 'react';
import { formatNumber, parseCurrency } from '../../utils/formatting';
import './MoneyInput.css';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  currency = 'R$',
  disabled = false,
  error,
  placeholder = '0,00',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value, 2));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permite apenas números, vírgula e ponto
    const cleaned = inputValue.replace(/[^\d.,]/g, '');
    setDisplayValue(cleaned);
  };

  const handleBlur = () => {
    const numericValue = parseCurrency(displayValue);
    onChange(numericValue);
    setDisplayValue(formatNumber(numericValue, 2));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className={`money-input-wrapper ${error ? 'has-error' : ''} ${className}`}>
      <span className="money-input-currency">{currency}</span>
      <input
        type="text"
        className="money-input"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        inputMode="decimal"
      />
      {error && <span className="money-input-error">{error}</span>}
    </div>
  );
};

export default MoneyInput;
