import EditableCell from './EditableCell';
import './ProductStockRow.css';

interface ProductWithStock {
    id: number;
    name: string;
    sku: string;
    stockId: number | null;
    quantity: number;
    minQuantity: number;
    location: string | null;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface ProductStockRowProps {
    product: ProductWithStock;
    editingCell: { productId: number; field: string } | null;
    savingCells: Set<string>;
    onCellEdit: (productId: number, field: string) => void;
    onCellSave: (productId: number, field: string, value: any) => void;
    onCellCancel: () => void;
}

function ProductStockRow({
    product,
    editingCell,
    savingCells,
    onCellEdit,
    onCellSave,
    onCellCancel
}: ProductStockRowProps) {
    const isEditing = (field: string) => {
        return editingCell?.productId === product.id && editingCell?.field === field;
    };

    const isSaving = (field: string) => {
        return savingCells.has(`${product.id}-${field}`);
    };

    const getRowClass = () => {
        if (product.status === 'OUT_OF_STOCK') return 'row-out-of-stock';
        if (product.status === 'LOW_STOCK') return 'row-low-stock';
        return 'row-normal';
    };

    const getStatusBadge = () => {
        const badges = {
            'IN_STOCK': { label: '✓ Em Estoque', class: 'badge-in-stock' },
            'LOW_STOCK': { label: '⚠ Estoque Baixo', class: 'badge-low-stock' },
            'OUT_OF_STOCK': { label: '✗ Sem Estoque', class: 'badge-out-stock' }
        };
        const badge = badges[product.status];
        return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
    };

    return (
        <tr className={`product-stock-row ${getRowClass()}`}>
            <td className="cell-product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-sku">{product.sku}</div>
            </td>
            <td>
                <EditableCell
                    value={product.quantity}
                    productId={product.id}
                    field="quantity"
                    type="number"
                    min={0}
                    isEditing={isEditing('quantity')}
                    isSaving={isSaving('quantity')}
                    onEdit={onCellEdit}
                    onSave={onCellSave}
                    onCancel={onCellCancel}
                />
            </td>
            <td>
                <EditableCell
                    value={product.minQuantity}
                    productId={product.id}
                    field="minQuantity"
                    type="number"
                    min={0}
                    isEditing={isEditing('minQuantity')}
                    isSaving={isSaving('minQuantity')}
                    onEdit={onCellEdit}
                    onSave={onCellSave}
                    onCancel={onCellCancel}
                />
            </td>
            <td>
                <EditableCell
                    value={product.location}
                    productId={product.id}
                    field="location"
                    type="text"
                    isEditing={isEditing('location')}
                    isSaving={isSaving('location')}
                    onEdit={onCellEdit}
                    onSave={onCellSave}
                    onCancel={onCellCancel}
                />
            </td>
            <td className="cell-status">
                {getStatusBadge()}
            </td>
        </tr>
    );
}

export default ProductStockRow;
