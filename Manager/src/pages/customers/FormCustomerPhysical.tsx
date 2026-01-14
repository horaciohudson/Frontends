import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerPhysical } from "../../models/CustomerPhysical";
import { apiNoPrefix } from "../../service/api";
import styles from "../../styles/customers/FormCustomerPhysical.module.css";

interface Props {
  customer: Customer;
  onSave?: () => void;
}

export default function FormCustomerPhysical({ customer, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [physicalData, setPhysicalData] = useState<CustomerPhysical[]>([]);
  const [physical, setPhysical] = useState<CustomerPhysical>({
    id: "",
    customer: customer,
    nationalIdNumber: "",
    identityDocument: "",
    fatherName: "",
    motherName: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPhysicalData = async () => {
    try {
      console.log("🔍 Loading physical data for customer:", customer.customerId);
      const res = await apiNoPrefix.get(`/api/customer-physicals/customer/${customer.customerId}`);
      console.log("📊 Physical data response:", res.data);
      
      if (res.data && res.data.length > 0) {
        console.log("✅ Setting physical data:", res.data);
        setPhysical(res.data[0]);
        setPhysicalData(res.data); // Adicionar esta linha para atualizar a tabela
      } else {
        console.log("❌ No physical data found, resetting form");
        setPhysical({
          id: "",
          customer: customer,
          nationalIdNumber: "",
          identityDocument: "",
          fatherName: "",
          motherName: "",
        });
        setPhysicalData([]); // Adicionar esta linha para limpar a tabela
      }
    } catch (err: any) {
      console.error("❌ Error loading physical data:", err);
      setError(t("customerPhysical.loadError"));
    }
  };

  useEffect(() => {
    console.log("🔄 FormCustomerPhysical useEffect triggered. Customer:", customer);
    if (customer?.customerId) {
      console.log("📞 Calling loadPhysicalData for customer:", customer.customerId);
      loadPhysicalData();
    } else {
      console.log("⚠️ No customer ID, skipping load");
    }
  }, [customer.customerId]);

  const resetForm = () => {
    // Reset form but preserve table data
    setPhysical({
      id: "",
      customer: customer,
      nationalIdNumber: "",
      identityDocument: "",
      fatherName: "",
      motherName: "",
    });
    setEditMode(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!physical.nationalIdNumber.trim()) {
      setError(t("customerPhysical.nationalIdRequired"));
      return;
    }

    try {
      const payload = {
        customerId: customer.customerId,
        nationalIdNumber: physical.nationalIdNumber,
        identityDocument: physical.identityDocument,
        fatherName: physical.fatherName,
        motherName: physical.motherName,
      };

      console.log("💾 Saving physical data. Payload:", payload);
      console.log("🆔 Physical ID:", physical.id, "Is editing:", physical.id && physical.id !== "");

      let res;
      if (physical.id && physical.id.trim() !== "") {
        console.log("✏️ Updating existing physical data");
        res = await apiNoPrefix.put(`/api/customer-physicals/${physical.id}`, payload);
      } else {
        console.log("🆕 Creating new physical data");
        res = await apiNoPrefix.post("/api/customer-physicals", payload);
      }

      console.log("📤 Save response:", res.data);

      const savedPhysical: CustomerPhysical = {
        id: res.data.id,
        customer: customer,
        nationalIdNumber: res.data.nationalIdNumber,
        identityDocument: res.data.identityDocument,
        fatherName: res.data.fatherName,
        motherName: res.data.motherName,
      };

      console.log("📝 Updating physicalData state with:", savedPhysical);
      setPhysicalData(prev => {
        const updated = physical.id && physical.id.trim() !== ""
          ? prev.map(p => (p.id === physical.id ? savedPhysical : p))
          : [...prev, savedPhysical];
        console.log("📊 New physicalData state:", updated);
        return updated;
      });
      
      // Reset form but preserve table data
      setPhysical({
        id: "",
        customer: customer,
        nationalIdNumber: "",
        identityDocument: "",
        fatherName: "",
        motherName: "",
      });
      setEditMode(false);
      setError(null);
      
      onSave?.();
    } catch (err: any) {
      console.error("❌ Error saving physical customer:", err);
      setError(err.response?.data?.message || t("customerPhysical.saveError"));
    }
  };

  const handleEdit = (p: CustomerPhysical) => {
    setPhysical(p);
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("customerPhysical.confirmDelete"))) return;
    try {
      await apiNoPrefix.delete(`/api/customer-physicals/${id}`);
      setPhysicalData(prev => prev.filter(p => p.id !== id));
      onSave?.();
    } catch (err: any) {
      console.error("Error deleting physical customer:", err);
      setError(err.response?.data?.message || t("customerPhysical.deleteError"));
    }
  };

  const handleNew = () => {
    // Reset form but preserve table data
    setPhysical({
      id: "",
      customer: customer,
      nationalIdNumber: "",
      identityDocument: "",
      fatherName: "",
      motherName: "",
    });
    setEditMode(true);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Filtro para os dados físicos
  const filteredPhysicalData = useMemo(() => {
    if (!filter.trim()) return physicalData;
    
    const filterLower = filter.toLowerCase();
    return physicalData.filter(p => 
      p.nationalIdNumber.toLowerCase().includes(filterLower) ||
      p.identityDocument.toLowerCase().includes(filterLower) ||
      p.fatherName.toLowerCase().includes(filterLower) ||
      p.motherName.toLowerCase().includes(filterLower)
    );
  }, [physicalData, filter]);

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerPhysical.title", "Physical Data")}</h3>
      {error && <p className={styles.error}>{error}</p>}
      
      {/* Campo de busca */}
      <div className={styles["search-container"]}>
        <input
          type="text"
          placeholder={t("customerPhysical.search", "Search physical data...")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles["search-input"]}
        />
      </div>
      
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-idNumber"]}`}>
            <label className={styles["form-label"]}>{t("customerPhysical.nationalIdNumber", "National ID Number")}:</label>
            <input
              ref={inputRef}
              value={physical.nationalIdNumber}
              onChange={(e) => setPhysical({ ...physical, nationalIdNumber: e.target.value })}
              className={styles["form-input"]}
              required
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-identityDocument"]}`}>
            <label className={styles["form-label"]}>{t("customerPhysical.identityDocument", "Identity Document")}:</label>
            <input
              value={physical.identityDocument}
              onChange={(e) => setPhysical({ ...physical, identityDocument: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-fatherName"]}`}>
            <label className={styles["form-label"]}>{t("customerPhysical.fatherName", "Father's Name")}:</label>
            <input
              value={physical.fatherName}
              onChange={(e) => setPhysical({ ...physical, fatherName: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-motherName"]}`}>
            <label className={styles["form-label"]}>{t("customerPhysical.motherName", "Mother's Name")}:</label>
            <input
              value={physical.motherName}
              onChange={(e) => setPhysical({ ...physical, motherName: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editMode ? (
            <>
              <button type="submit" className={styles.button}>
                {physical.id && physical.id.trim() !== "" ? t("customerPhysical.update", "Update") : t("customerPhysical.save", "Save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
              >
                {t("customerPhysical.cancel", "Cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {t("customerPhysical.newPhysicalData", "Add Physical Data")}
            </button>
          )}
        </div>
      </form>
      
      <table className={styles["physical-table"]}>
        <thead>
          <tr>
            <th>{t("customerPhysical.nationalIdNumber", "National ID Number")}</th>
            <th>{t("customerPhysical.identityDocument", "Identity Document")}</th>
            <th>{t("customerPhysical.fatherName", "Father's Name")}</th>
            <th>{t("customerPhysical.motherName", "Mother's Name")}</th>
            <th>{t("customerPhysical.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredPhysicalData.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles["no-data"]}>
                {filter.trim() 
                  ? t("customerPhysical.noResults", "No results found for this search")
                  : t("customerPhysical.noPhysicalData", "No physical data found")
                }
              </td>
            </tr>
          ) : (
            filteredPhysicalData.map((p) => (
              <tr key={p.id}>
                <td>{p.nationalIdNumber}</td>
                <td>{p.identityDocument}</td>
                <td>{p.fatherName}</td>
                <td>{p.motherName}</td>
                <td>
                  <button
                    onClick={() => handleEdit(p)}
                    className={styles["button-edit"]}
                  >
                    {t("customerPhysical.edit", "Edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className={styles["button-delete"]}
                  >
                    {t("customerPhysical.delete", "Delete")}
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