import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerProfessional } from "../../models/CustomerProfessional";
import { apiNoPrefix } from "../../service/api";
import styles from "../../styles/customers/FormCustomerProfessional.module.css";

interface Props {
  customer: Customer;
  onSave?: () => void;
}

export default function FormCustomerProfessional({ customer, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [professionalData, setProfessionalData] = useState<CustomerProfessional[]>([]);
  const [professional, setProfessional] = useState<CustomerProfessional>({
    id: "",
    customer: customer,
    company: "",
    position: "",
    companyPhone: "",
    admissionDate: "",
    companyPostalCode: "",
    companyCity: "",
    companyState: "",
    previousCompany: "",
    serviceTime: "",
    observations: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadProfessionalData = async () => {
    try {
      console.log("👔 Loading professional data for customer:", customer.customerId);
      const res = await apiNoPrefix.get(`/api/customer-professionals/customer/${customer.customerId}`);
      console.log("📊 Professional data response:", res.data);

      if (res.data && res.data.length > 0) {
        console.log("✅ Setting professional data:", res.data);
        const it = res.data[0];
        setProfessional({
          id: it.id,
          customer,
          company: it.company,
          position: it.position,
          companyPhone: it.companyPhone,
          admissionDate: it.admissionDate,
          companyPostalCode: it.companyPostalCode,
          companyCity: it.companyCity,
          companyState: it.companyState,
          previousCompany: it.previousCompany,
          serviceTime: it.serviceTime,
          observations: it.observations,
        });
        setProfessionalData(res.data);
      } else {
        console.log("❌ No professional data found, resetting form");
        resetForm();
        setProfessionalData([]);
      }
    } catch (err: any) {
      console.error("❌ Error loading professional data:", err);
      setError(t("customerProfessional.loadError"));
    }
  };

  useEffect(() => {
    console.log("🔄 FormCustomerProfessional useEffect triggered");
    console.log("📋 Customer object:", customer);
    console.log("🆔 Customer ID:", customer?.customerId);

    if (customer?.customerId) {
      console.log("✅ Valid customer ID found, loading professional data...");
      loadProfessionalData();
    } else {
      console.log("❌ No valid customer ID found");
    }
  }, [customer.customerId]);

  const resetForm = () => {
    setProfessional({
      id: "",
      customer,
      company: "",
      position: "",
      companyPhone: "",
      admissionDate: "",
      companyPostalCode: "",
      companyCity: "",
      companyState: "",
      previousCompany: "",
      serviceTime: "",
      observations: "",
    });
    setEditMode(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação: pelo menos o campo empresa deve estar preenchido
    if (!professional.company?.trim()) {
      setError(t("customerProfessional.companyRequired") || "Campo empresa é obrigatório");
      return;
    }

    try {
      const payload = {
        customerId: customer.customerId,
        company: professional.company,
        position: professional.position,
        companyPhone: professional.companyPhone,
        admissionDate: professional.admissionDate,
        companyPostalCode: professional.companyPostalCode,
        companyCity: professional.companyCity,
        companyState: professional.companyState,
        previousCompany: professional.previousCompany,
        serviceTime: professional.serviceTime,
        observations: professional.observations,
      };

      const res = professional.id
        ? await apiNoPrefix.put(`/api/customer-professionals/${professional.id}`, payload)
        : await apiNoPrefix.post(`/api/customer-professionals`, payload);

      const saved: CustomerProfessional = {
        id: res.data.id,
        customer,
        company: res.data.company,
        position: res.data.position,
        companyPhone: res.data.companyPhone,
        admissionDate: res.data.admissionDate,
        companyPostalCode: res.data.companyPostalCode,
        companyCity: res.data.companyCity,
        companyState: res.data.companyState,
        previousCompany: res.data.previousCompany,
        serviceTime: res.data.serviceTime,
        observations: res.data.observations,
      };

      setProfessionalData(prev =>
        professional.id ? prev.map(p => (p.id === professional.id ? saved : p)) : [...prev, saved]
      );
      setProfessional(saved);
      setEditMode(false);
      onSave?.();
    } catch (err: any) {
      console.error("Error saving professional:", err);
      setError(err.response?.data?.message || t("customerProfessional.saveError"));
    }
  };

  const handleEdit = (p: CustomerProfessional) => {
    setProfessional({ ...p, customer });
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("customerProfessional.confirmDelete"))) return;
    try {
      await apiNoPrefix.delete(`/api/customer-professionals/${id}`);
      setProfessionalData(prev => prev.filter(p => p.id !== id));
      if (professional.id === id) resetForm();
      onSave?.();
    } catch (err: any) {
      console.error("Error deleting professional:", err);
      setError(err.response?.data?.message || t("customerProfessional.deleteError"));
    }
  };

  const handleNew = () => {
    console.log("🔄 handleNew called - checking existing professional data");
    console.log("📊 Current professionalData:", professionalData);

    // Se já existe dados profissionais, editar ao invés de criar novo
    if (professionalData.length > 0) {
      console.log("✏️ Existing professional data found, switching to edit mode");
      const existingProfessional = professionalData[0];
      setProfessional({ ...existingProfessional, customer });
      setEditMode(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      console.log("➕ No existing professional data, creating new");
      resetForm();
      setEditMode(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerProfessional.title")}</h3>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-company"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.company")}:</label>
            <input
              ref={inputRef}
              value={professional.company}
              onChange={(e) => setProfessional({ ...professional, company: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-companyPhone"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.companyPhone")}:</label>
            <input
              value={professional.companyPhone}
              onChange={(e) => setProfessional({ ...professional, companyPhone: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-admission"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.admission")}:</label>
            <input
              type="date"
              value={professional.admissionDate}
              onChange={(e) => setProfessional({ ...professional, admissionDate: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-companyPostalCode"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.companyZipCode")}:</label>
            <input
              value={professional.companyPostalCode}
              onChange={(e) => setProfessional({ ...professional, companyPostalCode: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-companyCity"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.companyCity")}:</label>
            <input
              value={professional.companyCity}
              onChange={(e) => setProfessional({ ...professional, companyCity: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-companyState"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.companyState")}:</label>
            <input
              value={professional.companyState}
              onChange={(e) => setProfessional({ ...professional, companyState: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-position"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.position")}:</label>
            <input
              value={professional.position}
              onChange={(e) => setProfessional({ ...professional, position: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-previousCompany"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.previousCompany")}:</label>
            <input
              value={professional.previousCompany}
              onChange={(e) => setProfessional({ ...professional, previousCompany: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-serviceTime"]}`}>
            <label className={styles["form-label"]}>{t("customerProfessional.serviceTime")}:</label>
            <input
              value={professional.serviceTime}
              onChange={(e) => setProfessional({ ...professional, serviceTime: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("customerProfessional.observations")}:</label>
            <textarea
              value={professional.observations}
              onChange={(e) => setProfessional({ ...professional, observations: e.target.value })}
              className={styles["form-input"]}
              rows={3}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editMode ? (
            <>
              <button type="submit" className={styles.button}>
                {professional.id ? t("customerProfessional.update") : t("customerProfessional.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
              >
                {t("customerProfessional.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {professionalData.length > 0
                ? t("customerProfessional.editProfessionalData")
                : t("customerProfessional.newProfessionalData")
              }
            </button>
          )}
        </div>
      </form>

      <table className={styles["professional-table"]}>
        <thead>
          <tr>
            <th>{t("customerProfessional.company")}</th>
            <th>{t("customerProfessional.companyPhone")}</th>
            <th>{t("customerProfessional.admission")}</th>
            <th>{t("customerProfessional.position")}</th>
            <th>{t("customerProfessional.previousCompany")}</th>
            <th>{t("customerProfessional.serviceTime")}</th>
            <th>{t("customerProfessional.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {professionalData.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles["no-data"]}>
                {t("customerProfessional.noProfessionalData")}
              </td>
            </tr>
          ) : (
            professionalData.map((p) => (
              <tr key={p.id}>
                <td>{p.company || "-"}</td>
                <td>{p.companyPhone || "-"}</td>
                <td>{p.admissionDate || "-"}</td>
                <td>{p.position || "-"}</td>
                <td>{p.previousCompany || "-"}</td>
                <td>{p.serviceTime || "-"}</td>
                <td>
                  <button
                    onClick={() => handleEdit(p)}
                    className={styles["button-edit"]}
                  >
                    {t("customerProfessional.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className={styles["button-delete"]}
                  >
                    {t("customerProfessional.delete")}
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