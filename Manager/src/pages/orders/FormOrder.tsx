// src/components/orders/FormOrder.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderDTO } from "../../models/Order";
import { OrderStatus, OrderType } from "../../enums";
import { UUID } from "../../types/common";
import { createOrder, updateOrder, listOrders, deleteOrder } from "../../service/Order";
import { getCustomers } from "../../service/Customer";
import { Customer } from "../../models/Customer";
import { getSalesPersons } from "../../service/SalesPerson";
import { SalesPerson } from "../../models/SalesPerson";
import { getPaymentMethods } from "../../service/PaymentMethod";
import { PaymentMethod } from "../../models/PaymentMethod";
import { getCompanies } from "../../service/Company";
import { Company } from "../../models/Company";
import styles from "../../styles/orders/FormOrder.module.css";

type Props = {
  item: OrderDTO | null;
  onSaved: (o: OrderDTO) => void;
  onAfterSave: (o: OrderDTO) => void;
  onSelectOrder?: (order: OrderDTO | null) => void;
  onDoubleClickOrder?: (order: OrderDTO) => void;
};

export default function FormOrder({ item, onSaved, onAfterSave, onSelectOrder, onDoubleClickOrder }: Props) {
  const { t: tCommercial } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const { t: tEnums } = useTranslation(TRANSLATION_NAMESPACES.ENUMS);
  const [data, setData] = useState<OrderDTO>({});
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<UUID | null>(null);
  const firstRef = useRef<HTMLSelectElement>(null);

  // Ensure paymentMethods is always an array
  const safePaymentMethods = paymentMethods || [];

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersList = await listOrders();
      setOrders(ordersList.content || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(tCommercial("orders.loadError"));
      console.error(tCommercial("orders.loadError"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tCommercial]);

  const loadFormData = useCallback(async () => {
    try {
      setIsLoadingData(true);

      const customersData = await getCustomers();
      const salesPersonsData = await getSalesPersons();
      const paymentMethodsData = await getPaymentMethods();
      const companiesData = await getCompanies();

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setSalesPersons(Array.isArray(salesPersonsData) ? salesPersonsData : []);
      setPaymentMethods(Array.isArray(paymentMethodsData) ? paymentMethodsData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(tCommercial("orders.loadFormDataError"));
      console.error(tCommercial("orders.loadFormDataError"), errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, [tCommercial]);

  useEffect(() => {
    loadOrders();
    loadFormData();
    // Only set editing mode if we explicitly have an item to edit
    if (item && Object.keys(item).length > 0) {
      setData(item);
      setEditingMode(true);
    } else {
      setEditingMode(false);
      setData({});
    }
    firstRef.current?.focus();
  }, [item, loadOrders, loadFormData]);

  // Test direct function getPaymentMethods
  useEffect(() => {
    const testPaymentMethods = async () => {
      try {
        await getPaymentMethods();
      } catch (error) {
        console.error("Error loading payment methods:", error);
      }
    };

    testPaymentMethods();
  }, []);

  // Log for debug states
  useEffect(() => {
    // Log removed for production
  }, [customers, salesPersons, paymentMethods, companies, isLoadingData]);

  const set = <K extends keyof OrderDTO>(k: K, v: OrderDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check if we are really editing
    if (!editingMode) {
      return;
    }

    // Required field validation
    console.log("🔍 Validando campos obrigatórios:", {
      customerId: data.customerId,
      orderType: data.orderType,
      status: data.status
    });

    if (!data.customerId) {
      console.error("❌ Campo obrigatório: customerId");
      setError(tCommercial("orders.validation.customerRequired"));
      return;
    }

    if (!data.orderType) {
      console.error("❌ Campo obrigatório: orderType");
      setError(tCommercial("orders.validation.orderTypeRequired"));
      return;
    }

    if (!data.status) {
      console.error("❌ Campo obrigatório: status");
      setError(tCommercial("orders.validation.statusRequired"));
      return;
    }

    console.log("✅ Todos os campos obrigatórios estão preenchidos");

    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      console.log("🔄 Salvando pedido:", data);

      let dataToSend = { ...data };

      // Se estamos criando (sem ID), remover o ID do objeto para evitar conflitos
      if (!data.id) {
        const { id, ...dataWithoutId } = dataToSend;
        dataToSend = dataWithoutId;
        console.log("📝 Criando pedido sem ID:", dataToSend);
      } else {
        console.log("✏️ Atualizando pedido existente:", dataToSend);
      }

      const saved = data.id ?
        await updateOrder(data.id as UUID, dataToSend) :
        await createOrder(dataToSend);

      console.log("✅ Pedido salvo com sucesso:", saved);

      onSaved(saved);
      onAfterSave(saved);
      setEditingMode(false);
      setSuccessMessage(data.id ? tCommercial("orders.updateSuccess") : tCommercial("orders.saveSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadOrders();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      console.error("❌ Erro ao salvar pedido:", err);
      console.error("📋 Dados do pedido que causou erro:", data);

      // Check if it's an Axios error and get response data
      const axiosError = err as any;
      const responseData = axiosError?.response?.data;
      const fullErrorMessage = responseData ? JSON.stringify(responseData) : errorMessage;

      console.error("🔍 Detalhes completos do erro:", fullErrorMessage);

      // Check if it's optimistic locking error (check both message and response)
      if (errorMessage.includes('ObjectOptimisticLockingFailureException') ||
        errorMessage.includes('Row was updated or deleted by another transaction') ||
        fullErrorMessage.includes('ObjectOptimisticLockingFailureException') ||
        fullErrorMessage.includes('Row was updated or deleted by another transaction')) {
        setError(tCommercial("orders.optimisticLockError"));
        console.error("🔄 Optimistic locking error detectado! Recarregando dados...");

        // Reload data to sync with backend
        setTimeout(async () => {
          try {
            await loadOrders();
            await loadFormData();
            setError(null);
            console.log("✅ Dados recarregados após optimistic locking error");
          } catch (reloadError) {
            console.error("Error reloading data:", reloadError);
          }
        }, 2000);
      } else {
        setError(tCommercial("orders.saveError"));
        console.error("💥 Erro geral ao salvar:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (order: OrderDTO) => {
    setData(order);
    setEditingMode(true);
    onSaved(order);
    onSelectOrder?.(order);
    setTimeout(() => firstRef.current?.focus(), 0);
  };

  const handleRowClick = (order: OrderDTO) => {
    console.log("🖱️ Single click - selecting order for sub-tabs");
    setSelectedOrderId(order.id || null);
    onSelectOrder?.(order);
  };

  const handleDoubleClick = (order: OrderDTO) => {
    console.log("🖱️ Double click - selecting order and navigating to items (no edit mode)");
    setSelectedOrderId(order.id || null);
    onSelectOrder?.(order);
    onDoubleClickOrder?.(order);
  };

  const handleDelete = async (id: UUID) => {
    if (!confirm(tCommercial("orders.confirmDelete"))) return;
    try {
      setIsLoading(true);
      await deleteOrder(id);
      setSuccessMessage(tCommercial("orders.deleteSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadOrders();
      if (data.id === id) {
        setData({});
        setEditingMode(false);
        onSaved({});
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(tCommercial("orders.deleteError"));
      console.error(tCommercial("orders.deleteError"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    setData({});
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    onSaved({});
    setTimeout(() => firstRef.current?.focus(), 0);
  };

  const resetForm = () => {
    console.log("🔄 resetForm called - clearing form and exiting edit mode");

    // Clear all form data
    setData({});

    // Exit editing mode
    setEditingMode(false);

    // Clear row selection
    setSelectedOrderId(null);

    // Clear messages
    setError(null);
    setSuccessMessage(null);

    // Notify parent components
    onSaved({});
    onSelectOrder?.(null);

    // Force focus back to first field after state updates
    setTimeout(() => {
      if (firstRef.current) {
        firstRef.current.focus();
      }
    }, 0);

    console.log("✅ resetForm completed");
  };

  const getCustomerName = (customerId?: UUID) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? customer.name : customerId;
  };

  const getSalesPersonName = (salesPersonId?: number) => {
    if (!salesPersonId) return '-';
    const salesPerson = salesPersons.find(sp => sp.id === salesPersonId);
    return salesPerson ? salesPerson.name : salesPersonId;
  };

  // Função para traduzir nomes de métodos de pagamento
  const translatePaymentMethodName = (method: PaymentMethod): string => {
    // Se o nome já está em português, retornar como está
    if (method.name && !method.name.includes('.')) {
      return method.name;
    }

    // Mapeamento de traduções baseado no kind ou code
    const translations: { [key: string]: string } = {
      'CASH': 'Dinheiro',
      'PIX': 'PIX',
      'CREDIT_CARD': 'Cartão de Crédito',
      'DEBIT_CARD': 'Cartão de Débito',
      'BOLETO': 'Boleto Bancário',
      'BANK_TRANSFER': 'Transferência Bancária',
      'CHECK': 'Cheque',
      'STORE_FINANCING': 'Crediário da Loja',
      'VOUCHER': 'Vale/Voucher',
      'OTHER': 'Outros'
    };

    // Tentar traduzir pelo kind primeiro, depois pelo code
    return translations[method.kind] || translations[method.code] || method.name || method.code;
  };

  const getPaymentMethodName = (paymentMethodId?: number) => {
    if (!paymentMethodId) return '-';
    const paymentMethod = safePaymentMethods.find(pm => pm.id === paymentMethodId);
    return paymentMethod ? translatePaymentMethodName(paymentMethod) : paymentMethodId;
  };

  const getCompanyName = (companyId?: UUID) => {
    if (!companyId) return '-';
    const company = companies.find(c => c.id === companyId);
    return company ? company.tradeName || company.corporateName : companyId;
  };

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles["form-container"]}>
        {/* Display selected customer when not editing */}
        {!editingMode && selectedOrderId && (
          <div className={styles["form-linha"]}>
            <div className={styles.coluna}>
              <label className={styles["form-label"]}>Cliente Selecionado</label>
              <input
                type="text"
                className={styles["form-input"]}
                value={getCustomerName(data.customerId) || "Nenhum cliente selecionado"}
                disabled={true}
                style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              />
            </div>
            <div className={styles.coluna}>
              <label className={styles["form-label"]}>ID do Pedido</label>
              <input
                type="text"
                className={styles["form-input"]}
                value={data.id || "Novo pedido"}
                disabled={true}
                style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
              />
            </div>
            <div className={styles.coluna}>
              {/* Espaço vazio ou informação adicional */}
            </div>
          </div>
        )}

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.customerId")}</label>
            <select
              ref={firstRef}
              className={styles["form-select"]}
              value={data.customerId || ""}
              onChange={e => set("customerId", e.target.value as UUID)}
              disabled={!editingMode || isLoadingData}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {Array.isArray(customers) && customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.salespersonId")}</label>
            <select
              className={styles["form-select"]}
              value={data.salesPersonId?.toString() ?? ""}
              onChange={e => set("salesPersonId", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode || isLoadingData}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {Array.isArray(salesPersons) && salesPersons.map((salesPerson) => (
                <option key={salesPerson.id} value={salesPerson.id?.toString()}>
                  {salesPerson.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.paymentMethodId")}</label>
            <select
              className={styles["form-select"]}
              value={data.paymentMethodId?.toString() ?? ""}
              onChange={e => set("paymentMethodId", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode || isLoadingData}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {safePaymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.id} value={paymentMethod.id?.toString()}>
                  {translatePaymentMethodName(paymentMethod)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.companyId")}</label>
            <select
              className={styles["form-select"]}
              value={data.companyId || ""}
              onChange={e => set("companyId", e.target.value as UUID)}
              disabled={!editingMode || isLoadingData}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {Array.isArray(companies) && companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.tradeName || company.corporateName}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.status")}</label>
            <select
              className={styles["form-select"]}
              value={data.status ?? ""}
              onChange={e => set("status", e.target.value as OrderStatus)}
              disabled={!editingMode}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {Object.values(OrderStatus).map(v => (
                <option key={v} value={v}>
                  {tEnums(`orderStatus.${v}`)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{tCommercial("orders.general.orderType")}</label>
            <select
              className={styles["form-select"]}
              value={data.orderType ?? ""}
              onChange={e => set("orderType", e.target.value as OrderType)}
              disabled={!editingMode}
            >
              <option value="">{tCommercial("buttons.select")}</option>
              {Object.values(OrderType).map(v => (
                <option key={v} value={v}>
                  {tEnums(`orderType.${v}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Pedido Movimentado</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.moved ? "Sim" : "Não"}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              title="Indica se o pedido já foi processado/movimentado no sistema"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Data de Movimentação</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.movementDate ? new Date(data.movementDate).toLocaleString('pt-BR') : "Não movimentado"}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              title="Data e hora em que o pedido foi processado/movimentado"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Total Produtos (Calculado)</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={`R$ ${data.totalProducts != null ? Number(data.totalProducts).toFixed(2) : "0,00"}`}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              title="Valor calculado automaticamente pela soma dos itens de produtos"
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Total Serviços (Calculado)</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={`R$ ${data.totalServices != null ? Number(data.totalServices).toFixed(2) : "0,00"}`}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              title="Valor calculado automaticamente pela soma dos itens de serviços"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Total Geral (Calculado)</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={`R$ ${data.totalOrder != null ? Number(data.totalOrder).toFixed(2) : "0,00"}`}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
              title="Valor total calculado: produtos + serviços + frete - desconto"
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button
                type="submit"
                className={styles.button}
                disabled={isLoading || !data.customerId}
              >
                {data.id ? tCommercial("buttons.update") : tCommercial("buttons.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={(e) => {
                  e.preventDefault();
                  resetForm();
                }}
                disabled={isLoading}
              >
                {tCommercial("buttons.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {tCommercial("orders.newOrder")}
            </button>
          )}
        </div>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {isLoading ? (
        <p className={styles.loading}>{tCommercial("buttons.loading")}</p>
      ) : orders.length > 0 ? (
        <table className={styles["order-table"]}>
          <thead>
            <tr>
              <th>{tCommercial("orders.general.customerId")}</th>
              <th>{tCommercial("orders.general.salespersonId")}</th>
              <th>{tCommercial("orders.general.paymentMethodId")}</th>
              <th>{tCommercial("orders.general.companyId")}</th>
              <th>{tCommercial("orders.general.status")}</th>
              <th>{tCommercial("orders.general.orderType")}</th>
              <th>{tCommercial("orders.general.totalOrder")}</th>
              <th>{tCommercial("buttons.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id || `no-id-${order.customerId}`}
                className={selectedOrderId === order.id ? styles.selectedRow : ''}
                onClick={() => handleRowClick(order)}
                onDoubleClick={() => handleDoubleClick(order)}
              >
                <td>{getCustomerName(order.customerId)}</td>
                <td>{getSalesPersonName(order.salesPersonId)}</td>
                <td>{getPaymentMethodName(order.paymentMethodId)}</td>
                <td>{getCompanyName(order.companyId)}</td>
                <td>{order.status ? tEnums(`orderStatus.${order.status}`) : '-'}</td>
                <td>{order.orderType ? tEnums(`orderType.${order.orderType}`) : '-'}</td>
                <td>R$ {order.totalOrder != null ? Number(order.totalOrder).toFixed(2) : "0.00"}</td>
                <td>
                  <button
                    className={styles["button-editar"]}
                    onClick={() => handleEdit(order)}
                  >
                    {tCommercial("buttons.edit")}
                  </button>
                  <button
                    className={styles["button-excluir"]}
                    onClick={() => handleDelete(order.id!)}
                  >
                    {tCommercial("buttons.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>{tCommercial("orders.noOrders")}</p>
      )}
    </div>
  );
}
