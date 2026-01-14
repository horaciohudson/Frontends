import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/suppliers/FormSupplier.module.css";
import { Supplier } from "../../models/Supplier";
import api from "../../service/api";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface Company {
  id: number;
  tradeName: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Props {
  supplier: Supplier | null;
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onSave: () => void;
}

const initial: Supplier = {
  supplierId: 0,
  companyId: 0,
  tradeName: "",
  deliveryTime: 0,
  paymentMethod: 0,
};

export default function FormSupplier({ supplier, suppliers, onEdit, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [data, setData] = useState<Supplier>(initial);
  const [editingMode, setEditingMode] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error(t("suppliers.loadError"), err));

    api.get("/chart-accounts")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setPaymentMethods(data);
      })
      .catch((err) => console.error(t("suppliers.loadError"), err));
  }, [t]);

  useEffect(() => {
    if (supplier) {
      setData(supplier);
      setEditingMode(true);
    } else {
      setData(initial);
      setEditingMode(false);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: name === "companyId" || name === "paymentMethod" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      companyId: data.companyId,
      deliveryTime: data.deliveryTime,
      paymentMethod: data.paymentMethod,
    };
    try {
      if (data.supplierId) {
        await api.put(`/suppliers/${data.supplierId}`, payload);
      } else {
        await api.put(`/suppliers/${data.supplierId}`, payload);
      }
      onSave();
      setData(initial);
      setEditingMode(false);
    } catch (err) {
      console.error(t("suppliers.saveError"), err);
    }
  };

  const handleNew = () => {
    setData(initial);
    setEditingMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("supplier.confirmDelete"))) return;
    try {
      await api.delete(`/supplierId/${id}`);
      onSave();
    } catch (err) {
      console.error(t("suppliers.deleteError"), err);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles["form-container"]} onSubmit={handleSubmit}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-company"]}`}>  
            <label className={styles["form-label"]}>{t("supplier.company")}:</label>
            <select
              name="companyId"
              value={data.companyId}
              onChange={handleChange}
              required
              disabled={!editingMode}
              className={styles["form-input"]}
              ref={inputRef as React.Ref<HTMLSelectElement>}
            >
              <option value={0}>{t("supplier.select")}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.tradeName}</option>
              ))}
            </select>
          </div>
            
          <div className={`${styles.column} ${styles["column-payment-method"]}`}>  
            <label className={styles["form-label"]}>{t("supplier.paymentMethod")}:</label>
            <select
              name="paymentMethod"
              value={data.paymentMethod}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value={0}>{t("supplier.select")}</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>{pm.name}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.column} ${styles["column-delivery-term"]}`}>         
            <label className={styles["form-label"]}>{t("supplier.deliveryTerm")}:</label>
            <input
              type="number" 
              name="deliveryDays"
              value={data.deliveryTime}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              placeholder={t("supplier.deliveryTermPlaceholder")}
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button}>{t("supplier.save")}</button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={() => setEditingMode(false)}
              >
                {t("supplier.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {t("supplier.newSupplier")}
            </button>
          )}
        </div>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("supplier.company")}</th>            
            <th>{t("supplier.paymentMethod")}</th>
            <th>{t("supplier.deliveryTerm")}</th>
            <th>{t("supplier.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.supplierId}>
              <td>{companies.find(c => c.id === s.companyId)?.tradeName || "-"}</td>            
              <td>{paymentMethods.find(pm => pm.id === s.paymentMethod)?.name || "-"}</td>
              <td>{s.deliveryTime} {t("supplier.days")}</td>
              <td>
                <button className={styles["button-edit"]} onClick={() => onEdit(s)}>{t("supplier.edit")}</button>
                <button className={styles["button-delete"]} onClick={() => handleDelete(s.supplierId!)}>{t("supplier.delete")}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
