import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { formatCep, validateCep } from '../../utils/formatters';

type CepInputProps = Omit<TextFieldProps, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
    onValidation?: (isValid: boolean) => void;
};

export const CepInput: React.FC<CepInputProps> = ({
    value,
    onChange,
    onValidation,
    ...props
}) => {
    const [error, setError] = React.useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value);
        onChange(formatted);

        if (formatted.length > 0) {
            const isValid = validateCep(formatted);
            setError(isValid ? '' : 'CEP inválido');
            onValidation?.(isValid);
        } else {
            setError('');
            onValidation?.(false);
        }
    };

    return (
        <TextField
            {...props}
            value={value}
            onChange={handleChange}
            error={!!error || props.error}
            helperText={error || props.helperText}
            inputProps={{
                maxLength: 9,
                ...props.inputProps,
            }}
        />
    );
};
