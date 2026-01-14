import { useState, useEffect, useRef } from 'react';
import './EditableCell.css';

interface EditableCellProps {
    value: number | string | null;
    productId: number;
    field: string;
    type: 'number' | 'text';
    min?: number;
    max?: number;
    isEditing: boolean;
    isSaving: boolean;
    onEdit: (productId: number, field: string) => void;
    onSave: (productId: number, field: string, value: any) => void;
    onCancel: () => void;
}

function EditableCell({
    value,
    productId,
    field,
    type,
    min,
    max,
    isEditing,
    isSaving,
    onEdit,
    onSave,
    onCancel
}: EditableCellProps) {
    const [editValue, setEditValue] = useState(value ?? '');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        setEditValue(value ?? '');
    }, [value]);

    const validate = (val: string): boolean => {
        if (type === 'number') {
            const num = parseFloat(val);
            
            if (val !== '' && isNaN(num)) {
                setError('Valor deve ser numérico');
                return false;
            }

            if (val !== '' && num < 0) {
                setError('Valor não pode ser negativo');
                return false;
            }

            if (min !== undefined && num < min) {
                setError(`Valor mínimo: ${min}`);
                return false;
            }

            if (max !== undefined && num > max) {
                setError(`Valor máximo: ${max}`);
                return false;
            }
        }

        setError('');
        return true;
    };

    const handleDoubleClick = () => {
        if (!isEditing && !isSaving) {
            onEdit(productId, field);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setEditValue(newValue);
        validate(newValue);
    };

    const handleSave = () => {
        if (!validate(editValue.toString())) {
            return;
        }

        const finalValue = type === 'number' && editValue !== '' 
            ? parseFloat(editValue.toString()) 
            : editValue;

        onSave(productId, field, finalValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditValue(value ?? '');
            setError('');
            onCancel();
        }
    };

    const handleBlur = () => {
        if (isEditing) {
            handleSave();
        }
    };

    const displayValue = value ?? '-';

    return (
        <div 
            className={`editable-cell ${isEditing ? 'editing' : ''} ${isSaving ? 'saving' : ''} ${error ? 'error' : ''}`}
            onDoubleClick={handleDoubleClick}
            title={isEditing ? '' : 'Duplo clique para editar'}
        >
            {isEditing ? (
                <div className="edit-container">
                    <input
                        ref={inputRef}
                        type={type === 'number' ? 'number' : 'text'}
                        value={editValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        className="cell-input"
                        min={min}
                        max={max}
                    />
                    {error && <span className="cell-error">{error}</span>}
                </div>
            ) : (
                <span className="cell-value">
                    {isSaving ? (
                        <span className="saving-indicator">💾</span>
                    ) : (
                        displayValue
                    )}
                </span>
            )}
        </div>
    );
}

export default EditableCell;
