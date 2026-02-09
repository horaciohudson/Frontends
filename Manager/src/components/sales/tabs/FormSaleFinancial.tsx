import { SaleFinancial } from "../../../models/Sale";
import styles from "../../../styles/sales/FormSale.module.css";

interface FormSaleFinancialProps {
    financial: SaleFinancial;
    totalSale: number;
    onUpdate: (data: SaleFinancial) => void;
}

export default function FormSaleFinancial({ financial, totalSale, onUpdate }: FormSaleFinancialProps) {

    const handleChange = (field: keyof SaleFinancial, value: any) => {
        onUpdate({ ...financial, [field]: value });
    };

    const handleDiscountPercentageChange = (percentage: number) => {
        // Calculate discount value based on total sale amount
        const discountValue = (totalSale * percentage) / 100;

        onUpdate({
            ...financial,
            discountPercentage: percentage,
            discountAmount: parseFloat(discountValue.toFixed(2))
        });
    };

    return (
        <div className={styles.formGrid}>
            {/* Payment Method */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Forma de Pagamento</label>
                <select
                    value={financial.paymentMethod || "CASH"}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    className={styles.select}
                >
                    <option value="CASH">Dinheiro</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="DEBIT_CARD">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="BANK_SLIP">Boleto Bancário</option>
                </select>
            </div>

            {/* Amount Paid */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Valor Pago</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={financial.amountPaid || 0}
                    onChange={(e) => handleChange('amountPaid', Number(e.target.value))}
                    className={styles.input}
                />
            </div>

            {/* Discount % */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Desconto (%)</label>
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={financial.discountPercentage || 0}
                    onChange={(e) => handleDiscountPercentageChange(Number(e.target.value))}
                    className={styles.input}
                />
            </div>

            {/* Discount Value */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Desconto (Valor)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={financial.discountAmount || 0}
                    onChange={(e) => handleChange('discountAmount', Number(e.target.value))}
                    className={styles.input}
                />
            </div>

            {/* Financial Detail Grid */}
            <div className={styles.financialSummary}>
                <h4 className={styles.summaryTitle}>Resumo Financeiro</h4>
                <table className={styles.summaryTable}>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Bruto</td>
                            <td className={styles.amountNeutral}>
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSale)}
                            </td>
                        </tr>
                        <tr>
                            <td>Desconto ({financial.discountPercentage || 0}%)</td>
                            <td className={styles.amountNegative}>
                                - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financial.discountAmount || 0)}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Total Líquido</strong></td>
                            <td className={styles.amountPositive}>
                                <strong>
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSale - (financial.discountAmount || 0))}
                                </strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Valor Pago</td>
                            <td className={styles.amountNeutral}>
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financial.amountPaid || 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
