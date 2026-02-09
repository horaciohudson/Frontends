import { useEffect, useState } from "react";
import { CustomerAddress } from "../../../models/CustomerAddress";
import { Company } from "../../../models/Company";
import { getCompanies } from "../../../service/Company";
import { SaleAddress, SaleTransport } from "../../../models/Sale";
import styles from "../../../styles/sales/FormSale.module.css";

interface FormSaleLogisticsProps {
    address: SaleAddress;
    transport: SaleTransport;
    onUpdateAddress: (data: SaleAddress) => void;
    onUpdateTransport: (data: SaleTransport) => void;
    customerAddresses?: CustomerAddress[];
}

export default function FormSaleLogistics({
    address,
    transport,
    onUpdateAddress,
    onUpdateTransport,
    customerAddresses = []
}: FormSaleLogisticsProps) {
    const [transporters, setTransporters] = useState<Company[]>([]);

    useEffect(() => {
        getCompanies().then(companies => {
            const filtered = companies.filter(c => c.transporterFlag);
            setTransporters(filtered);
        });
    }, []);

    const handleAddressChange = (field: keyof SaleAddress, value: any) => {
        onUpdateAddress({ ...address, [field]: value });
    };

    const handleTransportChange = (field: keyof SaleTransport, value: any) => {
        onUpdateTransport({ ...transport, [field]: value });
    };

    const handleCustomerAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = e.target.value;
        if (!addressId) return; // "Nova / Manual" selected

        const selected = customerAddresses?.find(addr => String(addr.id) === addressId);
        if (selected) {
            onUpdateAddress({
                ...address,
                street: selected.street,
                number: selected.number,
                district: selected.district,
                city: selected.city,
                state: selected.state,
                zipCode: selected.zipCode
            });
        }
    };

    return (
        <div className={styles.formGrid}>
            <div className={styles.section} style={{ gridColumn: '1/-1', borderBottom: 'none', padding: '0 0 1rem 0' }}>
                <h4 className="text-md font-semibold mb-2">🚚 Endereço e Frete</h4>
            </div>

            {/* Address Type */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Endereço</label>
                <select
                    value={address.type || "DELIVERY"}
                    onChange={(e) => handleAddressChange('type', e.target.value)}
                    className={styles.select}
                >
                    <option value="DELIVERY">Entrega</option>
                    <option value="BILLING">Cobrança</option>
                    <option value="COMMERCIAL">Comercial</option>
                    <option value="CORRESPONDENCE">Correspondência</option>
                    <option value="REGISTERED">Sede/Registro</option>
                    <option value="OTHER">Outro</option>
                </select>
            </div>

            {/* Select Customer Address */}
            <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
                <label className={styles.label}>Selecionar Endereço do Cliente</label>
                <select
                    onChange={handleCustomerAddressSelect}
                    className={styles.select}
                    defaultValue=""
                >
                    <option value="">-- Preencher Manualmente --</option>
                    {customerAddresses?.map(addr => (
                        <option key={addr.id} value={addr.id}>
                            {addr.street}, {addr.number} - {addr.city}/{addr.state} ({addr.addressType})
                        </option>
                    ))}
                </select>
            </div>

            {/* Address Fields */}
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.label}>Logradouro</label>
                <input
                    type="text"
                    value={address.street || ""}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className={styles.input}
                    placeholder="Rua, Avenida, etc."
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Número</label>
                <input
                    type="text"
                    value={address.number || ""}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Bairro</label>
                <input
                    type="text"
                    value={address.district || ""}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Cidade</label>
                <input
                    type="text"
                    value={address.city || ""}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Estado (UF)</label>
                <input
                    type="text"
                    value={address.state || ""}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={styles.input}
                    maxLength={2}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>CEP</label>
                <input
                    type="text"
                    value={address.zipCode || ""}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Freight Value */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Valor do Frete</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={address.freightValue || 0}
                    onChange={(e) => handleAddressChange('freightValue', Number(e.target.value))}
                    className={styles.input}
                />
            </div>

            {/* Departure information */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Data de Saída</label>
                <input
                    type="date"
                    value={address.departureDate || ""}
                    onChange={(e) => handleAddressChange('departureDate', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Hora de Saída</label>
                <input
                    type="time"
                    value={address.departureTime || ""}
                    onChange={(e) => handleAddressChange('departureTime', e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.section} style={{ gridColumn: '1/-1', borderBottom: 'none', padding: '1rem 0 1rem 0' }}>
                <h4 className="text-md font-semibold mb-2">🏢 Transportadora</h4>
            </div>

            {/* Carrier ID */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Transportadora</label>
                <select
                    value={transport.carrierId || ""}
                    onChange={(e) => handleTransportChange('carrierId', e.target.value)}
                    className={styles.select}
                >
                    <option value="">-- Selecione --</option>
                    {transporters.map(t => (
                        <option key={t.id} value={t.id || ""}>
                            {t.tradeName || t.corporateName}
                        </option>
                    ))}
                </select>
            </div>
            {/* Logistics Summary Table */}
            <div className={styles.financialSummary} style={{ gridColumn: '1/-1' }}>
                <h4 className={styles.summaryTitle}>Resumo Logístico</h4>
                <table className={styles.summaryTable}>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Detalhe</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Endereço Completo</td>
                            <td className={styles.amountNeutral}>
                                {address.street ? `${address.street}, ${address.number || 'S/N'} - ${address.district || ''} - ${address.city || ''}/${address.state || ''} - ${address.zipCode || ''}` : <span style={{ color: '#999' }}>(Endereço não informado)</span>}
                            </td>
                        </tr>
                        <tr>
                            <td>Valor do Frete</td>
                            <td className={styles.amountNeutral}>
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(address.freightValue || 0)}
                            </td>
                        </tr>
                        <tr>
                            <td>Data/Hora Saída</td>
                            <td className={styles.amountNeutral}>
                                {address.departureDate ? `${address.departureDate.split('-').reverse().join('/')} ${address.departureTime || ''}` : '-'}
                            </td>
                        </tr>
                        <tr>
                            <td>Transportadora</td>
                            <td className={styles.amountNeutral}>
                                {transporters.find(t => t.id === transport.carrierId)?.tradeName || transporters.find(t => t.id === transport.carrierId)?.corporateName || '-'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
