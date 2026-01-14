// components/customers/FormCustomerFinancial.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerFinancial } from "../../models/CustomerFinancial";
import { apiNoPrefix } from "../../service/api";
import styles from "../../styles/customers/FormCustomerFinancial.module.css";

interface Props {
  customer: Customer;
  onSave?: () => void;
}

type PaymentMethod = { id?: string | number; code?: string; name?: string };

export default function FormCustomerFinancial({ customer, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const { t: tCommon } = useTranslation(TRANSLATION_NAMESPACES.COMMON);
  const [financialData, setFinancialData] = useState<CustomerFinancial[]>([]);
  const [financial, setFinancial] = useState<CustomerFinancial>({
    id: 0,
    customer,
    creditLimit: null,
    debtBalance: null,
    paymentMethod: "",
    paymentMethodId: null,
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFinancialData = async () => {
    try {
      console.log("💰 Loading financial data for customer:", customer.customerId);
      const res = await apiNoPrefix.get(
        `/api/customer-financials/customer/${customer.customerId}`
      );
      console.log("📊 Financial data response:", res.data);

      if (res.data && res.data.length > 0) {
        console.log("✅ Setting financial data:", res.data);
        
        // Processar dados financeiros para garantir que têm os nomes dos métodos de pagamento
        const processedData = res.data.map((item: any) => {
          const paymentMethod = paymentMethods.find(pm => pm.id === item.paymentMethodId);
          console.log(`💳 Processing item ${item.id}: paymentMethodId=${item.paymentMethodId}, found method:`, paymentMethod);
          
          return {
            ...item,
            paymentMethod: paymentMethod?.name ?? item.paymentMethod ?? item.paymentMethodName ?? ""
          };
        });
        
        console.log("📊 Processed financial data:", processedData);
        
        const firstItem = processedData[0];
        setFinancial({
          id: firstItem.id,
          customer,
          creditLimit: firstItem.creditLimit ?? null,
          debtBalance: firstItem.debtBalance ?? null,
          paymentMethod: firstItem.paymentMethod ?? "",
          paymentMethodId: firstItem.paymentMethodId ?? null,
        });
        setFinancialData(processedData);
        // IMPORTANTE: NÃO entrar em modo de edição automaticamente
        setEditMode(false);
      } else {
        console.log("❌ No financial data found, resetting form");
        resetForm();
        setFinancialData([]);
      }
    } catch (err: any) {
      console.error("❌ Error loading financial data:", err);
      setError(t("customerFinancial.loadError"));
      // Em caso de erro, garantir que não está em modo de edição
      setEditMode(false);
    }
  };

  const loadPaymentMethods = async (): Promise<void> => {
    try {
      console.log("💳 Loading payment methods...");
      const res = await apiNoPrefix.get(`/api/payment-methods`);
      console.log("💳 Payment methods raw response:", res.data);
      console.log("💳 Response status:", res.status);
      console.log("💳 Response type:", typeof res.data);
      console.log("💳 Is array?", Array.isArray(res.data));

      // Verificar se os dados estão em uma propriedade específica (paginação)
      let paymentMethodsData = res.data;
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        console.log("💳 Response is object, checking for nested arrays...");
        if (res.data.content && Array.isArray(res.data.content)) {
          console.log("💳 Found content array with", res.data.content.length, "items");
          paymentMethodsData = res.data.content;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          console.log("💳 Found data array with", res.data.data.length, "items");
          paymentMethodsData = res.data.data;
        } else {
          console.log("💳 No nested array found, using response.data directly");
        }
      }

      console.log("💳 Final payment methods data:", paymentMethodsData);
      console.log("💳 Data length:", Array.isArray(paymentMethodsData) ? paymentMethodsData.length : "Not an array");

      const finalMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : [];
      setPaymentMethods(finalMethods);
      console.log("💳 Payment methods set in state:", finalMethods.length, "methods");
    } catch (err: any) {
      console.error("❌ Error loading payment methods:", err);
      console.error("❌ Error details:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setPaymentMethods([]);
    }
  };

  useEffect(() => {
    console.log("🔄 FormCustomerFinancial useEffect triggered");
    console.log("📋 Customer object:", customer);
    console.log("🆔 Customer ID:", customer?.customerId);

    if (customer?.customerId) {
      console.log("✅ Valid customer ID found, loading data...");
      // Carregar métodos de pagamento primeiro, depois dados financeiros
      loadPaymentMethods().then(() => {
        console.log("💳 Payment methods loaded, now loading financial data...");
        loadFinancialData();
      });
    } else {
      console.log("❌ No valid customer ID found");
      // Reset form when no customer is selected
      resetForm();
      setFinancialData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.customerId]);

  const resetForm = () => {
    console.log("🔄 Resetting form to initial state");
    const newFinancial = {
      id: 0, // ID = 0 força POST (criação)
      customer,
      creditLimit: null,
      debtBalance: null,
      paymentMethod: "",
      paymentMethodId: null,
    };
    setFinancial(newFinancial);
    setEditMode(false);
    setError(null);
    console.log("✅ Form reset completed - editMode:", false, "financial.id:", newFinancial.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    console.log("🚨 handleSave CALLED - this should only happen on form submit!");
    console.log("🚨 Event type:", e.type);
    console.log("🚨 Event target:", e.target);
    
    e.preventDefault();
    setError(null);

    try {
      console.log("💾 Saving financial data...");
      console.log("📋 Current financial:", financial);
      console.log("📊 Existing financialData:", financialData);
      console.log("👤 Customer:", customer);
      console.log("🆔 Customer ID:", customer.customerId);

      // Validação básica
      if (!customer.customerId) {
        console.error("❌ No customer ID available");
        setError("Cliente não selecionado");
        return;
      }

      const payload = {
        customerId: customer.customerId,
        creditLimit: financial.creditLimit,
        debtBalance: financial.debtBalance,
        paymentMethodId: financial.paymentMethodId,
      };

      console.log("📤 Payload to send:", payload);
      console.log("📤 Payload validation:");
      console.log("  - customerId:", payload.customerId, typeof payload.customerId);
      console.log("  - creditLimit:", payload.creditLimit, typeof payload.creditLimit);
      console.log("  - debtBalance:", payload.debtBalance, typeof payload.debtBalance);
      console.log("  - paymentMethodId:", payload.paymentMethodId, typeof payload.paymentMethodId);

      // Verificar se estamos editando um registro específico
      const isEditing = financial.id && financial.id !== 0;

      console.log("🔍 isEditing:", isEditing, "financial.id:", financial.id);

      let res;
      if (isEditing) {
        console.log("✏️ Updating existing financial record:", financial.id);
        res = await apiNoPrefix.put(`/api/customer-financials/${financial.id}`, payload);
      } else {
        console.log("➕ Creating new financial record (POST)");
        res = await apiNoPrefix.post(`/api/customer-financials`, payload);
      }

      console.log("✅ Save response:", res.data);

      // Buscar o nome do método de pagamento selecionado
      const selectedPaymentMethod = paymentMethods.find(pm => pm.id === financial.paymentMethodId);
      console.log("💳 Selected payment method:", selectedPaymentMethod);

      const saved: CustomerFinancial = {
        id: res.data.id,
        customer,
        creditLimit: res.data.creditLimit ?? null,
        debtBalance: res.data.debtBalance ?? null,
        paymentMethod: selectedPaymentMethod?.name ?? res.data.paymentMethod ?? res.data.paymentMethodName ?? "",
        paymentMethodId: res.data.paymentMethodId ?? null,
      };

      console.log("💾 Saved financial data:", saved);

      // Atualizar a lista de dados financeiros
      if (isEditing) {
        // Se estava editando, substituir o registro existente
        console.log("🔄 Updating existing record in list");
        setFinancialData(prev => prev.map(f => f.id === saved.id ? saved : f));
      } else {
        // Se era criação, adicionar à lista
        console.log("➕ Adding new record to list");
        setFinancialData(prev => [...prev, saved]);
      }

      setFinancial(saved);
      setEditMode(false);
      
      // Recarregar dados financeiros para garantir sincronização
      console.log("🔄 Reloading financial data to ensure sync...");
      setTimeout(() => {
        loadFinancialData();
      }, 500);
      
      onSave?.();

      console.log("✅ Financial data saved successfully");
    } catch (err: any) {
      console.error("❌ Error saving financial:", err);
      console.error("📋 Error response:", err.response);
      console.error("📋 Error status:", err.response?.status);
      console.error("📋 Error data:", err.response?.data);
      console.error("📋 Error message:", err.message);
      
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || t("customerFinancial.saveError");
      setError(errorMessage);
      console.error("📋 Final error message:", errorMessage);
    }
  };

  const handleEdit = (f: CustomerFinancial) => {
    setFinancial({ ...f, customer });
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("customerFinancial.confirmDelete"))) return;
    try {
      await apiNoPrefix.delete(`/api/customer-financials/${id}`);
      setFinancialData(prev => prev.filter(f => f.id !== id));
      if (financial.id === id) resetForm();
      onSave?.();
    } catch (err: any) {
      console.error("Error deleting financial:", err);
      setError(err.response?.data?.message || t("customerFinancial.deleteError"));
    }
  };

  const handleNew = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevenir qualquer comportamento padrão
    e?.stopPropagation(); // Parar propagação do evento
    
    console.log("🆕 handleNew called by user click");
    console.log("📊 Current financialData:", financialData);
    console.log("📋 Current editMode:", editMode);

    // Sempre criar novo registro, independente de existir dados
    console.log("➕ Creating new financial record - ONLY setting edit mode");
    resetForm();
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
    console.log("✅ handleNew completed - editMode set to true, NO API CALL");
  };

  const fmtMoney = (v: number | null) =>
    v == null ? "-" : v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // Helper para traduzir o nome do payment method
  // O banco pode retornar a chave i18n (ex: "payment.method.pix") ou o nome traduzido
  const translatePaymentMethod = (name: string | null | undefined): string => {
    if (!name) return "-";
    // Se o nome parece ser uma chave i18n (contém pontos), tentar traduzir
    if (name.includes('.')) {
      const translated = tCommon(name);
      // Se a tradução retornar a própria chave, mostrar o fallback
      return translated === name ? name.split('.').pop() || name : translated;
    }
    return name;
  };

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerFinancial.title")}</h3>
      {error && <p className={styles.error}>{error}</p>}

      {/* Botão Novo fora do formulário */}
      {!editMode && (
        <div className={styles["form-actions"]} style={{marginBottom: '1rem'}}>
          <button
            type="button"
            className={styles["button-new"]}
            onClick={handleNew}
          >
            {t("customerFinancial.newFinancialData")}
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-creditLimit"]}`}>
            <label className={styles["form-label"]}>{t("customerFinancial.creditLimit")}:</label>
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              value={financial.creditLimit ?? ""}
              onChange={(e) =>
                setFinancial({
                  ...financial,
                  creditLimit: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>

          <div className={`${styles.column} ${styles["column-debtBalance"]}`}>
            <label className={styles["form-label"]}>{t("customerFinancial.debtBalance")}:</label>
            <input
              type="number"
              step="0.01"
              value={financial.debtBalance ?? ""}
              onChange={(e) =>
                setFinancial({
                  ...financial,
                  debtBalance: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>

          <div className={`${styles.column} ${styles["column-paymentMethod"]}`}>
            <label className={styles["form-label"]}>
              {t("customerFinancial.paymentMethod")}:
              {editMode && (
                <button 
                  type="button" 
                  onClick={() => {
                    console.log("🔄 Reloading payment methods...");
                    loadPaymentMethods();
                  }}
                  style={{marginLeft: '5px', fontSize: '12px', padding: '2px 6px'}}
                >
                  🔄
                </button>
              )}
            </label>
            <select
              value={financial.paymentMethodId ?? ""}
              onChange={(e) => {
                const selectedId = e.target.value ? Number(e.target.value) : null;
                const selectedMethod = paymentMethods.find(m => m.id === selectedId);
                console.log("💳 Payment method selected:", selectedId, selectedMethod);
                setFinancial({
                  ...financial,
                  paymentMethodId: selectedId,
                  paymentMethod: selectedMethod?.name ?? selectedMethod?.code ?? ""
                });
              }}
              className={styles["form-input"]}
              disabled={!editMode}
            >
              <option value="">{t("customers.select")}... ({paymentMethods.length} disponíveis)</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {translatePaymentMethod(m.name) || m.code || m.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botões de ação dentro do formulário apenas quando em modo de edição */}
        {editMode && (
          <div className={styles["form-actions"]}>
            <button type="submit" className={styles.button}>
              {financial.id ? t("customerFinancial.update") : t("customerFinancial.save")}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.cancel}`}
              onClick={resetForm}
            >
              {t("customerFinancial.cancel")}
            </button>
          </div>
        )}
      </form>

      <table className={styles["financial-table"]}>
        <thead>
          <tr>
            <th>{t("customerFinancial.creditLimit")}</th>
            <th>{t("customerFinancial.debtBalance")}</th>
            <th>{t("customerFinancial.paymentMethod")}</th>
            <th>{t("customerFinancial.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {financialData.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles["no-data"]}>
                {t("customerFinancial.noFinancialData")}
              </td>
            </tr>
          ) : (
            financialData.map((f) => {
              // Buscar o nome do método de pagamento se não estiver disponível
              const paymentMethodName = f.paymentMethod || 
                (paymentMethods.find(pm => pm.id === f.paymentMethodId)?.name) || 
                "-";
              
              console.log(`🎯 Rendering financial ${f.id}: paymentMethodId=${f.paymentMethodId}, paymentMethod="${f.paymentMethod}", resolved="${paymentMethodName}"`);
              
              return (
                <tr key={f.id}>
                  <td>{fmtMoney(f.creditLimit)}</td>
                  <td>{fmtMoney(f.debtBalance)}</td>
                  <td>{translatePaymentMethod(paymentMethodName)}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(f)}
                      className={styles["button-edit"]}
                    >
                      {t("customerFinancial.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className={styles["button-delete"]}
                    >
                      {t("customerFinancial.delete")}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
