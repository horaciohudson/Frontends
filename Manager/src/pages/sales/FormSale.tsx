// src/pages/sales/FormSale.tsx
import { useState, useEffect } from "react";
import { Sale, SaleCreateDTO, SaleItemDTO, SaleType, SaleFinancial, SaleAddress, SaleTransport, SalesContext } from "../../models/Sale";
import { Customer } from "../../models/Customer";
import { SalesPerson } from "../../models/SalesPerson";
import { getSalesPersons } from "../../service/SalesPerson";
import { CustomerAddress } from "../../models/CustomerAddress";
import { searchCustomers, getCustomers, getCustomerAddresses } from "../../service/Customer";


import styles from "../../styles/sales/FormSale.module.css";

// Tab Components
import FormSaleGeneral from "../../components/sales/tabs/FormSaleGeneral";
import FormSaleItems from "../../components/sales/tabs/FormSaleItems";
import FormSaleFinancial from "../../components/sales/tabs/FormSaleFinancial";
import FormSaleLogistics from "../../components/sales/tabs/FormSaleLogistics";
import FormSaleContext from "../../components/sales/tabs/FormSaleContext";

interface FormSaleProps {
    sale: Sale | null;
    onSave: (data: SaleCreateDTO) => void;
    onCancel: () => void;
    loading: boolean;
}

type TabType = 'general' | 'items' | 'financial' | 'logistics' | 'context';

export default function FormSale({ sale, onSave, onCancel, loading }: FormSaleProps) {
    // Tab State
    const [activeTab, setActiveTab] = useState<TabType>('general');

    // Form State
    const [formData, setFormData] = useState<SaleCreateDTO>({
        customerId: "",
        salespersonId: "",
        type: undefined,
        items: [],
        financial: {
            paymentMethod: "CASH",
            amountPaid: 0
        } as SaleFinancial,
        address: { type: "DELIVERY" } as SaleAddress,
        transport: {} as SaleTransport,
        context: {} as SalesContext
    });

    // Autocomplete & Lists State
    const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);

    // Fetch addresses when customer changes
    useEffect(() => {
        if (formData.customerId) {
            getCustomerAddresses(formData.customerId).then(setCustomerAddresses);
        } else {
            setCustomerAddresses([]);
        }
    }, [formData.customerId]);

    // Init Data
    useEffect(() => {
        loadData();
    }, []);

    // Populate when editing
    useEffect(() => {
        if (sale) {
            populateForm(sale);
        }
    }, [sale]);

    // Customer Search Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (customerSearch) {
                try {
                    const results = await searchCustomers(customerSearch);
                    setFilteredCustomers(results);
                } catch (err) {
                    console.error("Error searching customers:", err);
                }
            } else {
                loadDefaultCustomers();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [customerSearch]);

    const loadData = async () => {
        try {
            const [spData, custData] = await Promise.all([
                getSalesPersons(),
                getCustomers()
            ]);
            setSalesPersons(spData);
            setFilteredCustomers(custData);
        } catch (err) {
            console.error("Error loading initial data:", err);
        }
    };

    const loadDefaultCustomers = async () => {
        try {
            const data = await getCustomers();
            setFilteredCustomers(data);
        } catch (err) { console.error(err); }
    };

    const populateForm = (sale: Sale) => {
        try {
            console.log("Populating form with sale:", sale);
            setCustomerSearch(sale.customer?.name || "");

            // Map Items
            const mappedItems: SaleItemDTO[] = sale.items?.map(item => {
                if (!item.product) {
                    console.error("Item validation error: Product is null for item", item);
                    // Safe fallback or throw? Falling back to empty string ID might cause other issues but prevents crash here
                    return {
                        itemNumber: item.itemNumber,
                        productId: "",
                        description: item.description || "Produto Desconhecido",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        unit: item.unit,
                        size: item.size,
                        weight: item.weight,
                        status: item.status,
                        sizeName: item.sizeName,
                        colorName: item.colorName
                    };
                }
                return {
                    itemNumber: item.itemNumber,
                    productId: String(item.product.id),
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    unit: item.unit,
                    size: item.size,
                    weight: item.weight,
                    status: item.status,
                    sizeName: item.sizeName,
                    colorName: item.colorName,
                    sizeId: item.sizeId,
                    colorId: item.colorId,
                    variantId: item.variantId
                };
            }) || [];

            console.log("Mapped items:", mappedItems);

            setFormData({
                customerId: sale.customer?.customerId || "",
                salespersonId: sale.salesperson?.id ? String(sale.salesperson.id) : "",
                type: (sale.type as SaleType) || undefined,
                items: mappedItems,
                financial: sale.financial || { paymentMethod: "CASH", amountPaid: 0 } as SaleFinancial,
                address: sale.address || { type: "DELIVERY" } as SaleAddress,
                transport: sale.transport || {} as SaleTransport,
                context: sale.context || {} as SalesContext
            });
        } catch (error) {
            console.error("Error populating form:", error);
        }
    };

    // Auto-update amountPaid when items change
    useEffect(() => {
        const totalSale = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);

        // Only update if financial exists and amountPaid is different from totalSale
        if (formData.financial && formData.financial.amountPaid !== totalSale) {
            setFormData(prev => ({
                ...prev,
                financial: {
                    ...prev.financial!,
                    amountPaid: totalSale
                }
            }));
        }
    }, [formData.items]);

    // Update Handlers
    const updateGeneral = (field: keyof SaleCreateDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateItems = (newItems: SaleItemDTO[]) => {
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const updateFinancial = (financial: SaleFinancial) => {
        setFormData(prev => ({ ...prev, financial }));
    };

    const updateLogistics = (address: SaleAddress, transport: SaleTransport) => {
        setFormData(prev => ({ ...prev, address, transport }));
    };

    const updateContext = (context: SalesContext) => {
        setFormData(prev => ({ ...prev, context }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation moved to final check
        if (!formData.customerId || !formData.salespersonId) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        onSave(formData);
    };

    const tabs: { id: TabType, label: string, icon: string }[] = [
        { id: 'general', label: 'Geral', icon: '📋' },
        { id: 'items', label: 'Itens', icon: '🛒' },
        { id: 'financial', label: 'Financeiro', icon: '💰' },
        { id: 'logistics', label: 'Endereço/Frete', icon: '🚚' },
        { id: 'context', label: 'Contexto', icon: '⚙️' },
    ];

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        style={{ // Fallback inline styles if Tailwind not fully integrated
                            borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                            color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                            padding: '10px 16px',
                            fontWeight: 500,
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.section}>
                {activeTab === 'general' && (
                    <FormSaleGeneral
                        formData={formData}
                        customers={filteredCustomers}
                        salesPersons={salesPersons}
                        onUpdate={updateGeneral}
                        onCustomerSearch={setCustomerSearch}
                        customerSearchTerm={customerSearch}
                    />
                )}

                {activeTab === 'items' && (
                    <FormSaleItems
                        items={formData.items}
                        onUpdateItems={updateItems}
                    />
                )}

                {activeTab === 'financial' && (
                    <FormSaleFinancial
                        financial={formData.financial!}
                        totalSale={formData.items.reduce((sum, item) => sum + item.totalPrice, 0)}
                        onUpdate={updateFinancial}
                    />
                )}

                {activeTab === 'logistics' && (
                    <FormSaleLogistics
                        address={formData.address!}
                        transport={formData.transport!}
                        onUpdateAddress={(addr) => updateLogistics(addr, formData.transport!)}
                        onUpdateTransport={(trans) => updateLogistics(formData.address!, trans)}
                        customerAddresses={customerAddresses}
                    />
                )}

                {activeTab === 'context' && (
                    <FormSaleContext
                        context={formData.context!}
                        onUpdate={updateContext}
                    />
                )}
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
