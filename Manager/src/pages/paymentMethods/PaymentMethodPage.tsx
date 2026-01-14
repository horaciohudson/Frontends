// ✅ pages/PaymentMethodPage.tsx
import { useEffect, useState } from "react";
import { PaymentMethod } from "../../models/PaymentMethod";
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "../../service/PaymentMethod";
import FormPaymentMethod from "./FormPaymentMethod";
import ListPaymentMethod from "./ListPaymentMethod";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function PaymentMethodPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const methods = await getPaymentMethods();
      setItems(methods);
    } catch (err) {
      console.error(t("paymentMethods.loadError"), err);
      setError(t("paymentMethods.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [t]);

  const handleSave = async (item: PaymentMethod) => {
    try {
      setError(null);
      if (item.id && item.id !== 0) {
        const updated = await updatePaymentMethod(item.id, { ...item, id: item.id });
        setItems(prev => prev.map(g => g.id === item.id ? updated : g));
      } else {
        const { id, createdAt, updatedAt, supportsInstallments, supportsInterest, maxTotalInstallments, isCashPayment, isCardPayment, isPixPayment, isEnabledForPos, ...itemWithoutId } = item;
        const created = await createPaymentMethod(itemWithoutId);
        setItems(prev => [...prev, created]);
      }
      setEditing(null);
    } catch (err) {
      console.error(t("paymentMethods.saveError"), err);
      setError(t("paymentMethods.saveError"));
    }
  };

  const handleEdit = (item: PaymentMethod) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    if (!confirm(t("paymentMethods.confirmDelete"))) {
      return;
    }
    
    try {
      setError(null);
      await deletePaymentMethod(id);
      setItems(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(t("paymentMethods.deleteError"), err);
      setError(t("paymentMethods.deleteError"));
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(filter.toLowerCase()) ||
    i.code.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "2rem" }}>{t("paymentMethods.loading")}</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("paymentMethods.title")}</h2>

      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffebee", 
          padding: "1rem", 
          marginBottom: "1rem", 
          borderRadius: "4px" 
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder={t("paymentMethods.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <FormPaymentMethod item={editing} onSave={handleSave} onCancel={handleCancel} />
      <ListPaymentMethod items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
