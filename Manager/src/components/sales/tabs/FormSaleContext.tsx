import { SalesContext } from "../../../models/Sale";
import styles from "../../../styles/sales/FormSale.module.css";

interface FormSaleContextProps {
    context: SalesContext;
    onUpdate: (data: SalesContext) => void;
}

export default function FormSaleContext({ context, onUpdate }: FormSaleContextProps) {

    const handleChange = (field: keyof SalesContext, value: any) => {
        onUpdate({ ...context, [field]: value });
    };

    return (
        <div className={styles.formGrid}>
            {/* Price Table */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Tabela de Preço</label>
                <select
                    value={context.priceTable || ""}
                    onChange={(e) => handleChange('priceTable', e.target.value)}
                    className={styles.select}
                >
                    <option value="">Padrão</option>
                    <option value="TABELA_ATACADO">Atacado</option>
                    <option value="TABELA_VAREJO">Varejo</option>
                    <option value="TABELA_ESPECIAL">Especial</option>
                </select>
            </div>

            {/* Region */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Região do Cliente</label>
                <input
                    type="text"
                    value={context.clientRegion || ""}
                    onChange={(e) => handleChange('clientRegion', e.target.value)}
                    className={styles.input}
                    placeholder="Ex: SUL, NORTE"
                />
            </div>

            {/* Agreement Code */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Código de Acordo</label>
                <input
                    type="text"
                    value={context.agreementCode || ""}
                    onChange={(e) => handleChange('agreementCode', e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Observations / Notes (using custom field not in interface but common) */}
            <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
                <label className={styles.label}>Observações Internas</label>
                <textarea
                    rows={3}
                    className={styles.input}
                    placeholder="Observações sobre o contexto da venda..."
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    );
}
