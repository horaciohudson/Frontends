import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/salesPersons/FormSalesPersonAddress.module.css";
import { SalesPersonAddress, AddressType } from "../../models/SalesPersonAddress";
import { 
  getSalesPersonAddresses, 
  createSalesPersonAddress, 
  updateSalesPersonAddress, 
  deleteSalesPersonAddress 
} from "../../service/SalesPersonAddress";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { SalesPerson } from "../../models/SalesPerson";

interface FormSalesPersonAddressProps {
  selectedSalesPerson: SalesPerson | null;
  onDoubleClickSalesPerson?: (salesPerson: SalesPerson) => void;
}

export default function FormSalesPersonAddress({ selectedSalesPerson, onDoubleClickSalesPerson }: FormSalesPersonAddressProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [addresses, setAddresses] = useState<SalesPersonAddress[]>([]);
  const [form, setForm] = useState<SalesPersonAddress>({
    id: 0,
    salespersonId: selectedSalesPerson?.id || 0,
    companyAddressId: 0,
    addressType: "RESIDENTIAL",
    phone: "",
    fax: "",
  });

  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (selectedSalesPerson?.id) {
      loadAddresses();
      setForm(prev => ({ ...prev, salespersonId: selectedSalesPerson.id }));
    } else {
      setAddresses([]);
    }
  }, [selectedSalesPerson?.id]);

  const loadAddresses = async () => {
    if (!selectedSalesPerson?.id) return;
    
    try {
      const res = await getSalesPersonAddresses(selectedSalesPerson.id);
      setAddresses(res);
    } catch (err: any) {
      setError(t("salesperson.address.loadError"));
      console.error(t("salesperson.address.loadError"), err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "companyAddressId" ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyAddressId) return setError(t("salesperson.address.companyAddressIdRequired"));

    try {
      const payload = {
        id: form.id || 0,
        salespersonId: selectedSalesPerson?.id || 0,
        companyAddressId: form.companyAddressId,
        addressType: form.addressType,
        phone: form.phone,
        fax: form.fax,
      };

      const saved = form.id
        ? await updateSalesPersonAddress(form.id, payload)
        : await createSalesPersonAddress(payload);

      setAddresses((prev) =>
        form.id ? prev.map((addr) => (addr.id === form.id ? saved : addr)) : [...prev, saved]
      );
      setForm(saved);
      setEditingMode(false);
      setError(null);
      setSuccessMessage(t("salesperson.address.addressSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
    } catch (err: any) {
      console.error(t("salesperson.address.saveError"), {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t("salesperson.address.saveError") + " " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (address: SalesPersonAddress) => {
    setForm(address);
    setEditingMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("salesperson.address.confirmDelete"))) return;
    try {
      await deleteSalesPersonAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      setSuccessMessage(t("salesperson.address.addressDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(t("salesperson.address.deleteError"));
      console.error(t("salesperson.address.deleteError"), err);
    }
  };

  const handleNew = () => {
    setForm({
      id: 0,
      salespersonId: selectedSalesPerson?.id || 0,
      companyAddressId: 0,
      addressType: "RESIDENTIAL",
      phone: "",
      fax: "",
    });
    setEditingMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetForm = () => {
    setForm({
      id: 0,
      salespersonId: selectedSalesPerson?.id || 0,
      companyAddressId: 0,
      addressType: "RESIDENTIAL",
      phone: "",
      fax: "",
    });
    setEditingMode(false);
    setError(null);
  };

  const getAddressTypeLabel = (type: AddressType) => {
    switch (type) {
      case "RESIDENTIAL": return t("salesperson.address.residential");
      case "BUSINESS": return t("salesperson.address.business");
      case "OTHER": return t("salesperson.address.other");
      default: return type;
    }
  };

  if (!selectedSalesPerson) {
    return (
      <div className={styles['no-selection']}>
        <p>{t("salesperson.address.noSalespersonSelected")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.address.addressType")}:</label>
            <select
              ref={inputRef}
              name="addressType"
              value={form.addressType}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="RESIDENTIAL">{t("salesperson.address.residential")}</option>
              <option value="BUSINESS">{t("salesperson.address.business")}</option>
              <option value="OTHER">{t("salesperson.address.other")}</option>
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.address.companyAddressId")}:</label>
            <input
              name="companyAddressId"
              type="number"
              value={form.companyAddressId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.address.phone")}:</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("salesperson.address.fax")}:</label>
            <input
              name="fax"
              value={form.fax}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
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
                {form.id ? t("salesperson.address.update") : t("salesperson.address.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
              >
                {t("salesperson.address.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("salesperson.address.newAddress")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["address-table"]}>
        <thead>
          <tr>
            <th>{t("salesperson.address.addressType")}</th>
            <th>{t("salesperson.address.companyAddressId")}</th>
            <th>{t("salesperson.address.phone")}</th>
            <th>{t("salesperson.address.fax")}</th>
            <th>{t("salesperson.actions")}</th>
          </tr>
        </thead>
        <tbody>
                     {addresses.map((addr) => (
             <tr 
               key={addr.id}
               className={onDoubleClickSalesPerson ? styles["clickable-row"] : ""}
               onDoubleClick={() => onDoubleClickSalesPerson?.(selectedSalesPerson!)}
               title={onDoubleClickSalesPerson ? t("salespersons.doubleClickToSelect") : ""}
             >
               <td>{getAddressTypeLabel(addr.addressType)}</td>
               <td>{addr.companyAddressId}</td>
               <td>{addr.phone}</td>
               <td>{addr.fax}</td>
               <td>
                 <button
                   className={styles["button-editar"]}
                   onClick={() => handleEdit(addr)}
                 >
                   {t("salesperson.edit")}
                 </button>
                 <button
                   className={styles["button-excluir"]}
                   type="button"
                   onClick={() => handleDelete(addr.id)}
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
