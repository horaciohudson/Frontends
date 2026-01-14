// src/components/salesperson/FormSalesPerson.tsx (General)
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/salesPersons/FormSalesPerson.module.css";
import { SalesPerson } from "../../models/SalesPerson";
import { createSalesPerson, updateSalesPerson, getSalesPersons, deleteSalesPerson } from "../../service/SalesPerson";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface FormSalesPersonProps {
  onSelectSalesPerson: (salesPerson: SalesPerson | null) => void;
  onDoubleClickSalesPerson?: (salesPerson: SalesPerson) => void;
}

export default function FormSalesPerson({ onSelectSalesPerson, onDoubleClickSalesPerson }: FormSalesPersonProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [form, setForm] = useState<SalesPerson>({
    id: 0,
    name: "",
    codeName: "",
    taxId: "",
    profession: "",
    role: "",
    birthDate: "",
    user: false,
    broker: false,
  });

  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSalesPersons();
  }, []);

  const loadSalesPersons = async () => {
    try {
      const res = await getSalesPersons();
      setSalesPersons(res);
    } catch (err: any) {
      setError(t("salesperson.loadError"));
      console.error(t("salesperson.loadError"), err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError(t("salesperson.nameRequired"));
    if (!form.codeName.trim()) return setError(t("salesperson.codeNameRequired"));

    try {
      // Only include ID for updates, omit for new entities
      const payload: any = {
        name: form.name,
        codeName: form.codeName,
        taxId: form.taxId,
        profession: form.profession,
        role: form.role,
        birthDate: form.birthDate,
        user: form.user,
        isBroker: form.broker, // Backend expects 'isBroker'
      };

      // Add ID only when updating
      if (form.id) {
        payload.id = form.id;
      }

      const saved = form.id
        ? await updateSalesPerson(form.id, payload)
        : await createSalesPerson(payload);

      setSalesPersons((prev) =>
        form.id ? prev.map((sp) => (sp.id === form.id ? saved : sp)) : [...prev, saved]
      );
      setForm(saved);
      onSelectSalesPerson(saved);
      setEditingMode(false);
      setError(null);
      setSuccessMessage(t("salesperson.salesPersonSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
    } catch (err: any) {
      console.error(t("salesperson.saveError"), {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t("salesperson.saveError") + " " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (salesPerson: SalesPerson) => {
    setForm(salesPerson);
    setEditingMode(true);
    onSelectSalesPerson(salesPerson);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("salesperson.confirmDelete"))) return;
    try {
      await deleteSalesPerson(id);
      setSalesPersons((prev) => prev.filter((sp) => sp.id !== id));
      onSelectSalesPerson(null);
      setSuccessMessage(t("salesperson.salesPersonDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(t("salesperson.deleteError"));
      console.error(t("salesperson.deleteError"), err);
    }
  };

  const handleNew = () => {
    setForm({
      id: 0,
      name: "",
      codeName: "",
      taxId: "",
      profession: "",
      role: "",
      birthDate: "",
      user: false,
      broker: false,
    });
    setEditingMode(true);
    onSelectSalesPerson(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetForm = () => {
    setForm({
      id: 0,
      name: "",
      codeName: "",
      taxId: "",
      profession: "",
      role: "",
      birthDate: "",
      user: false,
      broker: false,
    });
    setEditingMode(false);
    setError(null);
    onSelectSalesPerson(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.name")}:</label>
            <input
              ref={inputRef}
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.codeName")}:</label>
            <input
              name="codeName"
              value={form.codeName}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.taxId")}:</label>
            <input
              name="taxId"
              value={form.taxId}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.profession")}:</label>
            <input
              name="profession"
              value={form.profession}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.role")}:</label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.general.birthDate")}:</label>
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <div className={styles["checkbox-container"]}>
              <input
                name="user"
                type="checkbox"
                checked={form.user}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
                id="user-checkbox"
              />
              <label htmlFor="user-checkbox" className={styles["checkbox-label"]}>
                {t("salesperson.general.user")}
              </label>
            </div>
          </div>
          <div className={styles.coluna}>
            <div className={styles["checkbox-container"]}>
              <input
                name="broker"
                type="checkbox"
                checked={form.broker}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
                id="broker-checkbox"
              />
              <label htmlFor="broker-checkbox" className={styles["checkbox-label"]}>
                {t("salesperson.general.isBroker")}
              </label>
            </div>
          </div>
          <div className={styles.coluna}>
            {/* Espaçador para manter alinhamento */}
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button}>
                {form.id ? t("salesperson.update") : t("salesperson.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
              >
                {t("salesperson.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("salesperson.newSalesPerson")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["salesperson-table"]}>
        <thead>
          <tr>
            <th>{t("salesperson.general.name")}</th>
            <th>{t("salesperson.general.codeName")}</th>
            <th>{t("salesperson.general.taxId")}</th>
            <th>{t("salesperson.general.profession")}</th>
            <th>{t("salesperson.general.role")}</th>
            <th>{t("salesperson.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {salesPersons.map((sp) => (
            <tr
              key={sp.id}
              className={onDoubleClickSalesPerson ? styles["clickable-row"] : ""}
              onDoubleClick={() => onDoubleClickSalesPerson?.(sp)}
              title={onDoubleClickSalesPerson ? t("salespersons.doubleClickToSelect") : ""}
            >
              <td>{sp.name}</td>
              <td>{sp.codeName}</td>
              <td>{sp.taxId}</td>
              <td>{sp.profession}</td>
              <td>{sp.role}</td>
              <td>
                <button
                  className={styles["button-editar"]}
                  onClick={() => handleEdit(sp)}
                >
                  {t("salesperson.edit")}
                </button>
                <button
                  className={styles["button-excluir"]}
                  type="button"
                  onClick={() => handleDelete(sp.id)}
                >
                  {t("salesperson.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
