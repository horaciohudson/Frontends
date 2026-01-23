import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { formatCurrency, parseCurrency } from '../../utils/formatters';

type CurrencyInputProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
    value: number;
    onChange: (value: number) => void;
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value,
    onChange,
    ...props
}) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
        formatCurrency(value)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = parseCurrency(inputValue);

        onChange(numericValue);
        setDisplayValue(formatCurrency(numericValue));
    };

    const handleFocus = () => {
        setDisplayValue(value.toString());
    };

    const handleBlur = () => {
        setDisplayValue(formatCurrency(value));
    };

    return (
        <TextField
            {...props}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};
