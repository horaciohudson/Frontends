import { Customer } from "../../../models/Customer";
import { SalesPerson } from "../../../models/SalesPerson";
import { SaleType, SaleCreateDTO } from "../../../models/Sale";
import styles from "../../../styles/sales/FormSale.module.css";
import { useState } from "react";

interface FormSaleGeneralProps {
    formData: SaleCreateDTO;
    customers: Customer[];
    salesPersons: SalesPerson[];
    onUpdate: (field: keyof SaleCreateDTO, value: any) => void;
    onCustomerSearch: (term: string) => void;
    customerSearchTerm: string;
}

export default function FormSaleGeneral({
    formData,
    customers,
    salesPersons,
    onUpdate,
    onCustomerSearch,
    customerSearchTerm
}: FormSaleGeneralProps) {

    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const handleCustomerSelect = (customer: Customer) => {
        onUpdate('customerId', customer.customerId);
        onCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    return (
        <div className={styles.formGrid}>
            {/* Customer Autocomplete */}
            <div className={styles.formGroup}>
                <label className={styles.label}>
                    Cliente <span className={styles.required}>*</span>
                </label>
                <div className={styles.autocompleteContainer}>
                    <input
                        type="text"
                        value={customerSearchTerm}
                        onChange={(e) => {
                            onCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)} // Delay to allow click
                        placeholder="Digite para buscar cliente..."
                        className={styles.input}
                        required
                    />
                    {showCustomerDropdown && customers.length > 0 && (
                        <div className={styles.dropdown}>
                            {customers.slice(0, 10).map((customer) => (
                                <div
                                    key={customer.customerId}
                                    className={styles.dropdownItem}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                    onClick={() => handleCustomerSelect(customer)}
                                >
                                    <div className={styles.dropdownItemName}>
                                        {customer.name}
                                    </div>
                                    {customer.email && (
                                        <div className={styles.dropdownItemDetail}>
                                            {customer.email}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Salesperson Select */}
            <div className={styles.formGroup}>
                <label className={styles.label}>
                    Vendedor <span className={styles.required}>*</span>
                </label>
                <select
                    value={formData.salespersonId}
                    onChange={(e) => onUpdate('salespersonId', e.target.value)}
                    className={styles.select}
                    required
                >
                    <option value="">Selecione um vendedor</option>
                    {salesPersons.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                            {sp.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Type */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Tipo</label>
                <select
                    value={formData.type || ""}
                    onChange={(e) => onUpdate('type', e.target.value as SaleType)}
                    className={styles.select}
                >
                    <option value="">Selecione o tipo</option>
                    <option value="RETAIL">Varejo</option>
                    <option value="WHOLESALE">Atacado</option>
                </select>
            </div>
        </div>
    );
}
