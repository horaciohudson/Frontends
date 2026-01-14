import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/salesPersons/FormSalesPersonCommission.module.css";
import { SalesPersonCommission } from "../../models/SalesPersonCommission";
import { 
  getCommissionsBySalesperson, 
  createCommission, 
  updateCommission, 
  deleteCommission 
} from "../../service/SalesPersonCommission";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { SalesPerson } from "../../models/SalesPerson";

interface FormSalesPersonCommissionProps {
  selectedSalesPerson: SalesPerson | null;
  onDoubleClickSalesPerson?: (salesPerson: SalesPerson) => void;
}

export default function FormSalesPersonCommission({ selectedSalesPerson, onDoubleClickSalesPerson }: FormSalesPersonCommissionProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [commissions, setCommissions] = useState<SalesPersonCommission[]>([]);
  const [form, setForm] = useState<SalesPersonCommission>({
    id: 0,
    salespersonId: selectedSalesPerson?.id || 0,
    salesCommissionRate: 0,
    brokerageCommissionRate: 0,
    salesCommissionAmount: 0,
    brokerageCommissionAmount: 0,
  });

  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedSalesPerson?.id) {
      loadCommissions();
      setForm(prev => ({ ...prev, salespersonId: selectedSalesPerson.id }));
    } else {
      setCommissions([]);
    }
  }, [selectedSalesPerson?.id]);

  const loadCommissions = async () => {
    if (!selectedSalesPerson?.id) return;
    
    try {
      const res = await getCommissionsBySalesperson(selectedSalesPerson.id);
      setCommissions(res);
    } catch (err: any) {
      setError(t("salesperson.commission.loadError"));
      console.error(t("salesperson.commission.loadError"), err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value ? Number(value) : 0,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.salesCommissionRate < 0) return setError(t("salesperson.commission.salesRateInvalid"));
    if (form.brokerageCommissionRate < 0) return setError(t("salesperson.commission.brokerRateInvalid"));

    try {
      const payload = {
        id: form.id || 0,
        salespersonId: selectedSalesPerson?.id || 0,
        salesCommissionRate: form.salesCommissionRate,
        brokerageCommissionRate: form.brokerageCommissionRate,
        salesCommissionAmount: form.salesCommissionAmount,
        brokerageCommissionAmount: form.brokerageCommissionAmount,
      };

      const saved = form.id
        ? await updateCommission(form.id, payload)
        : await createCommission(payload);

      setCommissions((prev) =>
        form.id ? prev.map((comm) => (comm.id === form.id ? saved : comm)) : [...prev, saved]
      );
      setForm(saved);
      setEditingMode(false);
      setError(null);
      setSuccessMessage(t("salesperson.commission.commissionSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
    } catch (err: any) {
      console.error(t("salesperson.commission.saveError"), {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t("salesperson.commission.saveError") + " " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (commission: SalesPersonCommission) => {
    setForm(commission);
    setEditingMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("salesperson.commission.confirmDelete"))) return;
    try {
      await deleteCommission(id);
      setCommissions((prev) => prev.filter((comm) => comm.id !== id));
      setSuccessMessage(t("salesperson.commission.commissionDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(t("salesperson.commission.deleteError"));
      console.error(t("salesperson.commission.deleteError"), err);
    }
  };

  const handleNew = () => {
    setForm({
      id: 0,
      salespersonId: selectedSalesPerson?.id || 0,
      salesCommissionRate: 0,
      brokerageCommissionRate: 0,
      salesCommissionAmount: 0,
      brokerageCommissionAmount: 0,
    });
    setEditingMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetForm = () => {
    setForm({
      id: 0,
      salespersonId: selectedSalesPerson?.id || 0,
      salesCommissionRate: 0,
      brokerageCommissionRate: 0,
      salesCommissionAmount: 0,
      brokerageCommissionAmount: 0,
    });
    setEditingMode(false);
    setError(null);
  };

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  if (!selectedSalesPerson) {
    return (
      <div className={styles['no-selection']}>
        <p>{t("salesperson.commission.noSalespersonSelected")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.commission.salesRate")}:</label>
            <input
              ref={inputRef}
              name="salesCommissionRate"
              type="number"
              step="0.01"
              value={form.salesCommissionRate || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              min="0"
              max="100"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.commission.brokerRate")}:</label>
            <input
              name="brokerageCommissionRate"
              type="number"
              step="0.01"
              value={form.brokerageCommissionRate || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              min="0"
              max="100"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.commission.salesAmount")}:</label>
            <input
              name="salesCommissionAmount"
              type="number"
              step="0.01"
              value={form.salesCommissionAmount || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              min="0"
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.commission.brokerAmount")}:</label>
            <input
              name="brokerageCommissionAmount"
              type="number"
              step="0.01"
              value={form.brokerageCommissionAmount || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              min="0"
            />
          </div>
          <div className={styles.coluna}>
            {/* Espaçador para manter alinhamento */}
          </div>
          <div className={styles.coluna}>
            {/* Espaçador para manter alinhamento */}
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button}>
                {form.id ? t("salesperson.commission.update") : t("salesperson.commission.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
              >
                {t("salesperson.commission.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("salesperson.commission.newCommission")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["commission-table"]}>
        <thead>
          <tr>
            <th>{t("salesperson.commission.salesRate")}</th>
            <th>{t("salesperson.commission.brokerRate")}</th>
            <th>{t("salesperson.commission.salesAmount")}</th>
            <th>{t("salesperson.commission.brokerAmount")}</th>
            <th>{t("salesperson.actions")}</th>
          </tr>
        </thead>
        <tbody>
                     {commissions.map((comm) => (
             <tr 
               key={comm.id}
               className={onDoubleClickSalesPerson ? styles["clickable-row"] : ""}
               onDoubleClick={() => onDoubleClickSalesPerson?.(selectedSalesPerson!)}
               title={onDoubleClickSalesPerson ? t("salespersons.doubleClickToSelect") : ""}
             >
               <td>{formatPercentage(comm.salesCommissionRate)}</td>
               <td>{formatPercentage(comm.brokerageCommissionRate)}</td>
               <td>{formatCurrency(comm.salesCommissionAmount)}</td>
               <td>{formatCurrency(comm.brokerageCommissionAmount)}</td>
               <td>
                 <button
                   className={styles["button-editar"]}
                   onClick={() => handleEdit(comm)}
                 >
                   {t("salesperson.edit")}
                 </button>
                 <button
                   className={styles["button-excluir"]}
                   type="button"
                   onClick={() => handleDelete(comm.id)}
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
