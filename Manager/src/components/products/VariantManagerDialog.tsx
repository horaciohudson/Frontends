
import VariantGrid from './VariantGrid';
import styles from '../../styles/components/ProductSearchDialog.module.css'; // Reusing existing dialog styles

interface VariantManagerDialogProps {
    isOpen: boolean;
    productId: string | null;
    productName: string;
    onClose: () => void;
}

export default function VariantManagerDialog({
    isOpen,
    productId,
    productName,
    onClose
}: VariantManagerDialogProps) {
    if (!isOpen || !productId) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog} style={{ maxWidth: '1200px', width: '95%' }}>
                <div className={styles.header}>
                    <h2>Gerenciar Variantes</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                        Produto: <strong>{productName}</strong>
                    </p>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    <VariantGrid
                        productId={productId}
                        onVariantsChange={() => {
                            // Optional: Refresh logic if needed in parent, 
                            // but VariantGrid handles its own saving/loading
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
