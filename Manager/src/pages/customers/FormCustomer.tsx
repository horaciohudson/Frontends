import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../../service/Customer";
import styles from "../../styles/customers/FormCustomer.module.css";

interface Props {
  onSelectCustomer: (customer: Customer | null) => void;
}

export default function FormCustomer({ onSelectCustomer }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer>({ customerId: "", name: "", email: "", telephone: "", mobile: "" });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading customers...");
      
      // Teste de conectividade primeiro
      console.log("🌐 Testing backend connectivity...");
      
      const customersData = await getCustomers();
      console.log("✅ Customers loaded:", customersData.length, "customers");
      console.log("📊 Raw data:", customersData);
      
      if (customersData.length === 0) {
        console.log("⚠️ No customers returned - checking if backend is responding...");
      }
      
      setCustomers(customersData);
    } catch (err: any) {
      console.error("❌ Error loading customers:", err);
      console.error("❌ Error details:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      setError(t("customers.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const resetForm = () => {
    setCustomer({ customerId: "", name: "", email: "", telephone: "", mobile: "" });
    setEditMode(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!customer.name.trim() || !customer.email.trim()) {
      setError(t("customers.validationFailed"));
      return;
    }

    try {
      let savedCustomer: Customer;
      
      if (customer.customerId) {
        console.log("🔄 Updating existing customer:", customer.customerId);
        savedCustomer = await updateCustomer(customer.customerId, customer);
      } else {
        console.log("💾 Creating new customer");
        const { customerId, phone, ...customerData } = customer;
        savedCustomer = await createCustomer(customerData);
      }
      
      console.log("✅ Customer saved:", savedCustomer);
      
      setCustomers(prev =>
        customer.customerId
          ? prev.map(c => (c.customerId === customer.customerId ? savedCustomer : c))
          : [...prev, savedCustomer]
      );
      onSelectCustomer(savedCustomer);
      resetForm();
    } catch (err: any) {
      console.error("❌ Error saving customer:", err);
      setError(err.message || t("customers.saveError"));
    }
  };

  const handleEdit = (c: Customer) => {
    setCustomer(c);
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
    onSelectCustomer(c);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("customers.confirmDelete"))) return;
    
    try {
      console.log("🗑️ Deleting customer:", id);
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.customerId !== id));
      onSelectCustomer(null);
      console.log("✅ Customer deleted successfully");
    } catch (err: any) {
      console.error("❌ Error deleting customer:", err);
      setError(err.message || t("customers.deleteError"));
    }
  };

  const handleNew = () => {
    resetForm();
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSave}>
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customers.name")}:</label>
            <input
              ref={inputRef}
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className={styles["form-input"]}
              required
              disabled={!editMode}
              aria-label={t("customers.name")}
            />
          </div>
          
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customers.email")}:</label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className={styles["form-input"]}
              required
              disabled={!editMode}
              aria-label={t("customers.email")}
            />
          </div>
          
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customers.phone")}:</label>
            <input
              value={customer.telephone}
              onChange={(e) => setCustomer({ ...customer, telephone: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
              aria-label={t("customers.phone")}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customers.mobile")}:</label>
            <input
              value={customer.mobile || ""}
              onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
              aria-label={t("customers.mobile")}
            />
          </div>
          <div className={styles.column}>
            {/* Espaçador para manter alinhamento */}
          </div>
          <div className={styles.column}>
            {/* Espaçador para manter alinhamento */}
          </div>
        </div>
        
        <div className={styles["form-actions"]}>
          {!editMode ? (
            <button type="button" onClick={handleNew} className={`${styles.button} ${styles["button-new"]}`}>
              {t("customers.new")}
            </button>
          ) : (
            <>
              <button type="submit" className={styles.button}>
                {customer.customerId ? t("customers.update") : t("customers.save")}
              </button>
              <button type="button" onClick={resetForm} className={`${styles.button} ${styles.cancel}`}>
                {t("customers.cancel")}
              </button>
            </>
          )}
        </div>
      </form>
      
      <table className={styles["customer-table"]}>
        <thead>
          <tr>
            <th>{t("customers.name")}</th>
            <th>{t("customers.email")}</th>
            <th>{t("customers.phone")}</th>
            <th>{t("customers.mobile")}</th>
            <th>{t("customers.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            console.log("🔍 Rendering - loading:", loading, "customers.length:", customers.length);
            
            if (loading) {
              return (
                <tr>
                  <td colSpan={5} className={styles["no-data"]}>
                    Carregando clientes...
                  </td>
                </tr>
              );
            }
            
            if (customers.length === 0) {
              return (
                <tr>
                  <td colSpan={5} className={styles["no-data"]}>
                    {t("customers.noCustomers")}
                  </td>
                </tr>
              );
            }
            
            return customers.map((c) => {
              console.log("🎯 Rendering customer:", c.name, c.customerId);
              return (
                <tr key={c.customerId}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.telephone}</td>
                  <td>{c.mobile || ""}</td>
                  <td>
                    <button onClick={() => handleEdit(c)} className={styles["button-edit"]}>
                      {t("customers.edit")}
                    </button>
                    <button onClick={() => handleDelete(c.customerId)} className={styles["button-delete"]}>
                      {t("customers.delete")}
                    </button>
                  </td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  );
}
