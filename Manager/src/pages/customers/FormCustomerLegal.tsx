import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerLegal } from "../../models/CustomerLegal";
import { apiNoPrefix } from "../../service/api";
import styles from "../../styles/customers/FormCustomerLegal.module.css";

interface Props {
  customer: Customer;
  onSave?: () => void;
}

type ActivityOption = { id: number; name?: string };

export default function FormCustomerLegal({ customer, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [legal, setLegal] = useState<CustomerLegal>({
    id: "",
    customer,
    customerId: customer.customerId,
    cnpj: "",
    registration: "",
    icmsIpi: undefined,
    revenue: undefined,
    activityId: undefined,
  });
  const [legalData, setLegalData] = useState<CustomerLegal[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("🔄 FormCustomerLegal useEffect triggered");
    console.log("📋 Customer object:", customer);
    console.log("🆔 Customer ID:", customer?.customerId);
    
    if (customer?.customerId) {
      console.log("✅ Valid customer ID found, loading data...");
      loadLegalData();
      loadActivities();
    } else {
      console.log("❌ No valid customer ID found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.customerId]);

  const loadLegalData = async () => {
    try {
      console.log("🏢 Loading legal data for customer:", customer.customerId);
      const res = await apiNoPrefix.get(`/api/customer-legals/customer/${customer.customerId}`);
      console.log("📊 Legal data response:", res.data);
      
      if (res.data && res.data.length > 0) {
        console.log("✅ Setting legal data:", res.data);
        // assume one-per-customer
        const item = res.data[0];
        setLegal({
          id: item.id,
          customer,
          customerId: customer.customerId,
          cnpj: item.cnpj,
          registration: item.registration,
          icmsIpi: item.icmsIpi,
          revenue: item.revenue,
          activityId: item.activityId,
        });
        setLegalData(res.data);
      } else {
        console.log("❌ No legal data found, resetting form");
        resetForm();
        setLegalData([]);
      }
    } catch (err: any) {
      console.error("❌ Error loading legal data:", err);
      setError(err.response?.data?.message || t("customerLegal.loadError"));
    }
  };

  const loadActivities = async () => {
    try {
      console.log("Loading activities...");
      const res = await apiNoPrefix.get(`/api/activities`);
      console.log("Activities response:", res.data);
      
      // Verificar se os dados estão em uma propriedade específica (paginação)
      let activitiesData = res.data;
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        if (res.data.content && Array.isArray(res.data.content)) {
          activitiesData = res.data.content;
        }
      }
      
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      console.log("Activities loaded:", activitiesData);
    } catch (err: any) {
      console.error("Error loading activities:", err);
      // Fallback para dados mock se necessário
      setActivities([
        { id: 1, name: "Comércio Varejista" },
        { id: 2, name: "Prestação de Serviços" },
        { id: 3, name: "Indústria" },
      ]);
    }
  };

  const resetForm = () => {
    setLegal({
      id: "",
      customer,
      customerId: customer.customerId,
      cnpj: "",
      registration: "",
      icmsIpi: undefined,
      revenue: undefined,
      activityId: undefined,
    });
    setEditMode(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!legal.cnpj.trim()) {
      setError(t("customerLegal.cnpjRequired"));
      return;
    }

    try {
      const payload = {
        customerId: customer.customerId,
        cnpj: legal.cnpj,
        registration: legal.registration,
        icmsIpi: legal.icmsIpi ?? null,
        revenue: legal.revenue ?? null,
        activityId: legal.activityId ?? null,
      };

      const res = legal.id
        ? await apiNoPrefix.put(`/api/customer-legals/${legal.id}`, payload)
        : await apiNoPrefix.post(`/api/customer-legals`, payload);

      const saved: CustomerLegal = {
        id: res.data.id,
        customer,
        customerId: customer.customerId,
        cnpj: res.data.cnpj,
        registration: res.data.registration,
        icmsIpi: res.data.icmsIpi,
        revenue: res.data.revenue,
        activityId: res.data.activityId,
      };

      setLegalData(prev =>
        legal.id ? prev.map(l => (l.id === legal.id ? saved : l)) : [saved, ...prev]
      );
      setLegal(saved);
      setEditMode(false);
      onSave?.();
    } catch (err: any) {
      setError(err.response?.data?.message || t("customerLegal.saveError"));
    }
  };

  const handleEdit = (l: CustomerLegal) => {
    setLegal({ ...l, customer, customerId: customer.customerId });
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("customerLegal.confirmDelete"))) return;
    try {
      await apiNoPrefix.delete(`/api/customer-legals/${id}`);
      setLegalData(prev => prev.filter(l => l.id !== id));
      if (legal.id === id) resetForm();
      onSave?.();
    } catch (err: any) {
      setError(err.response?.data?.message || t("customerLegal.deleteError"));
    }
  };

  const handleNew = () => {
    resetForm();
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerLegal.title")}</h3>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-cnpj"]}`}>
            <label className={styles["form-label"]}>{t("customerLegal.cnpj")}:</label>
            <input
              ref={inputRef}
              value={legal.cnpj}
              onChange={(e) => setLegal({ ...legal, cnpj: e.target.value })}
              className={styles["form-input"]}
              required
              disabled={!editMode}
            />
          </div>

          <div className={`${styles.column} ${styles["column-registration"]}`}>
            <label className={styles["form-label"]}>{t("customerLegal.registration")}:</label>
            <input
              value={legal.registration}
              onChange={(e) => setLegal({ ...legal, registration: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customerLegal.icmsIpi")}:</label>
            <input
              type="number"
              value={legal.icmsIpi ?? ""}
              onChange={(e) =>
                setLegal({ ...legal, icmsIpi: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customerLegal.revenue")}:</label>
            <input
              type="number"
              step="0.01"
              value={legal.revenue ?? ""}
              onChange={(e) =>
                setLegal({ ...legal, revenue: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customerLegal.activity")}:</label>
            <select
              value={legal.activityId ?? ""}
              onChange={(e) =>
                setLegal({ ...legal, activityId: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className={styles["form-input"]}
              disabled={!editMode}
            >
              <option value="">{t("customers.select")}…</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name ?? a.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editMode ? (
            <>
              <button type="submit" className={styles.button}>
                {legal.id ? t("customerLegal.update") : t("customerLegal.save")}
              </button>
              <button type="button" className={`${styles.button} ${styles.cancel}`} onClick={resetForm}>
                {t("customerLegal.cancel")}
              </button>
            </>
          ) : (
            <button type="button" className={styles["button-new"]} onClick={handleNew}>
              {t("customerLegal.newLegalData")}
            </button>
          )}
        </div>
      </form>

      <table className={styles["legal-table"]}>
        <thead>
          <tr>
            <th>{t("customerLegal.cnpj")}</th>
            <th>{t("customerLegal.registration")}</th>
            <th>{t("customerLegal.icmsIpi")}</th>
            <th>{t("customerLegal.revenue")}</th>
            <th>{t("customerLegal.activity")}</th>
            <th>{t("customerLegal.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {legalData.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles["no-data"]}>
                {t("customerLegal.noLegalData")}
              </td>
            </tr>
          ) : (
            legalData.map((l) => (
              <tr key={l.id}>
                <td>{l.cnpj}</td>
                <td>{l.registration}</td>
                <td>{l.icmsIpi ?? "-"}</td>
                <td>{l.revenue ?? "-"}</td>
                <td>{l.activityId ?? "-"}</td>
                <td>
                  <button onClick={() => handleEdit(l)} className={styles["button-edit"]}>
                    {t("customerLegal.edit")}
                  </button>
                  <button onClick={() => handleDelete(l.id)} className={styles["button-delete"]}>
                    {t("customerLegal.delete")}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}