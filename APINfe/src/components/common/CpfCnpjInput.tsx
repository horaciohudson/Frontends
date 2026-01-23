import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { formatCpfCnpj, validateCpfCnpj } from '../../utils/formatters';

type CpfCnpjInputProps = Omit<TextFieldProps, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
    onValidation?: (isValid: boolean) => void;
};

export const CpfCnpjInput: React.FC<CpfCnpjInputProps> = ({
    value,
    onChange,
    onValidation,
    ...props
}) => {
    const [error, setError] = React.useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpfCnpj(e.target.value);
        onChange(formatted);

        if (formatted.length > 0) {
            const isValid = validateCpfCnpj(formatted);
            setError(isValid ? '' : 'CPF/CNPJ inválido');
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
                maxLength: 18,
                ...props.inputProps,
            }}
        />
    );
};
