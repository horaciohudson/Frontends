// src/pages/sales/FormSale.tsx
import { useState, useEffect } from "react";
import { Sale, SaleCreateDTO, SaleItemDTO } from "../../models/Sale";
import { Customer } from "../../models/Customer";
import { SalesPerson } from "../../models/SalesPerson";
import { getCustomers } from "../../service/Customer";
import { getSalesPersons } from "../../service/SalesPerson";
import FormSaleItems from "./FormSaleItems";
import styles from "../../styles/sales/FormSale.module.css";

interface FormSaleProps {
    sale: Sale | null;
    onSave: (data: SaleCreateDTO) => void;
    onCancel: () => void;
    loading: boolean;
}

export default function FormSale({ sale, onSave, onCancel, loading }: FormSaleProps) {
    // Form state
    const [customerId, setCustomerId] = useState<string>("");
    const [salespersonId, setSalespersonId] = useState<number>(0);
    const [type, setType] = useState<string>("");
    const [items, setItems] = useState<SaleItemDTO[]>([]);

    // Autocomplete state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

    // Load customers and salespersons
    useEffect(() => {
        loadCustomers();
        loadSalesPersons();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (sale) {
            setCustomerId(sale.customer.customerId);
            setSalespersonId(sale.salesperson.id);
            setType(sale.type || "");

            // Convert sale items to DTO format
            const saleItems: SaleItemDTO[] = sale.items.map(item => ({
                itemNumber: item.itemNumber,
                productId: item.product.id || 0,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                unit: item.unit,
                size: item.size,
                weight: item.weight,
                status: item.status
            }));
            setItems(saleItems);

            // Set customer search to show selected customer name
            setCustomerSearch(sale.customer.name);
        }
    }, [sale]);

    // Filter customers based on search
    useEffect(() => {
        if (customerSearch) {
            const filtered = customers.filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase()))
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
    }, [customerSearch, customers]);

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (err) {
            console.error("Error loading customers:", err);
        }
    };

    const loadSalesPersons = async () => {
        try {
            const data = await getSalesPersons();
            setSalesPersons(data);
        } catch (err) {
            console.error("Error loading salespersons:", err);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setCustomerId(customer.customerId);
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!customerId) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        if (!salespersonId) {
            alert("Por favor, selecione um vendedor.");
            return;
        }
        if (items.length === 0) {
            alert("Por favor, adicione pelo menos um item à venda.");
            return;
        }

        const saleData: SaleCreateDTO = {
            customerId,
            salespersonId,
            type: type || undefined,
            items
        };

        onSave(saleData);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📋 Informações da Venda</h2>

                <div className={styles.formGrid}>
                    {/* Customer Autocomplete */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Cliente <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.autocompleteContainer}>
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustomerDropdown(true);
                                }}
                                onFocus={() => setShowCustomerDropdown(true)}
                                placeholder="Digite para buscar cliente..."
                                className={styles.input}
                                required
                            />
                            {showCustomerDropdown && filteredCustomers.length > 0 && (
                                <div className={styles.dropdown}>
                                    {filteredCustomers.slice(0, 10).map((customer) => (
                                        <div
                                            key={customer.customerId}
                                            className={styles.dropdownItem}
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
                            value={salespersonId}
                            onChange={(e) => setSalespersonId(Number(e.target.value))}
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
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            placeholder="Ex: Atacado, Varejo..."
                            className={styles.input}
                        />
                    </div>
                </div>
            </div>

            {/* Sale Items */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🛒 Itens da Venda</h2>
                <FormSaleItems items={items} setItems={setItems} />
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={styles.cancelButton}
                    disabled={loading}
                >
                    ❌ Cancelar
                </button>
                <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading}
                >
                    {loading ? "⏳ Salvando..." : "💾 Salvar Venda"}
                </button>
            </div>
        </form>
    );
}
