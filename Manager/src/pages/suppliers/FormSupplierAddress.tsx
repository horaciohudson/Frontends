import { useEffect, useRef, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import api from "../../service/api";
import styles from "../../styles/suppliers/FormSupplierAddress.module.css";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface Address {
  id: number | null;
  supplierId: number | null;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  companyAddressType: "COMMERCIAL"; // Can be extended to other types, ex: "RESIDENTIAL"
}

interface Props {
  entityId: number;
  onSave: () => void;
}

const initial: Address = {
  id: null,
  supplierId: null,
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  companyAddressType: "COMMERCIAL",
};

function initializeForm(entityId: number) {
  return {
    ...initial,
    supplierId: entityId,
  };
}

function FormSupplierAddress({ entityId, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  console.log("🔄 FormSupplierAddress rendered: entityId =", entityId);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<Address>(initializeForm(entityId));
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeName, setTradeName] = useState<string>(""); // New state for tradeName
  const streetRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load tradeName from supplier
  useEffect(() => {
    const loadTradeName = async () => {
      try {
        console.log("📤 Fetching supplier with ID:", entityId);
        const res = await api.get(`/fornecedores/${entityId}`);
        setTradeName(res.data.tradeName || "");
        console.log("📥 Trade Name received:", res.data.tradeName);
      } catch (err: any) {
        console.error(t("suppliers.loadError"), err);
        setError(err.response?.data?.message || t("suppliers.loadError"));
      }
    };

    if (entityId) {
      loadTradeName();
    }
  }, [entityId, t]);

  // Load addresses
  useEffect(() => {
    console.log("📡 useEffect triggered: entityId =", entityId);
    setAddresses([]);
    if (entityId && !isSubmitting) {
      loadAddresses(entityId);
    } else {
      setAddresses([]);
      setForm(initial);
      setEditingMode(false);
      setNotice(t("suppliers.selectSupplier"));
      setError(null);
    }
  }, [entityId, isSubmitting, t]);

  const loadAddresses = async (supplierId: number) => {
    try {
      if (!supplierId) {
        setError(t("suppliers.supplierNotSelected"));
        console.log("🚫 Invalid supplier ID:", supplierId);
        return;
      }
      console.log("📤 Sending GET to /supplier-addresses/supplier/", supplierId);
      const res = await api.get(`/supplier-addresses/supplier/${supplierId}`);
      console.log("📡 GET /supplier-addresses/supplier response:", JSON.stringify(res.data, null, 2));
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedList = list.map((a: any) => ({
        id: Number(a.id) || null,
        supplierId: Number(a.supplierId) || null,
        street: a.street || "",
        number: a.number || "",
        neighborhood: a.neighborhood || "",
        city: a.city || "",
        state: a.state || "",
        zipCode: a.zipCode || "",
        companyAddressType: a.companyAddressType || "COMMERCIAL",
      }));
      console.log("📥 Addresses received:", JSON.stringify(mappedList, null, 2));
      setAddresses(mappedList);
      if (mappedList.length > 0) {
        setNotice(t("suppliers.addressesLoaded"));
      } else {
        setForm(initializeForm(supplierId));
                  setNotice(t("suppliers.noAddresses"));
      }
          } catch (err: any) {
        console.error(t("suppliers.loadError"), err);
        setError(err.response?.data?.message || t("suppliers.loadError"));
      }
  };

  const resetForm = () => {
    console.log("🧹 Resetting form: entityId =", entityId);
    setForm(initializeForm(entityId));
    setEditingMode(false);
    setError(null);
            setNotice(addresses.length > 0 ? t("suppliers.addressesLoaded") : t("suppliers.noAddresses"));
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Changing ${name}:`, value);
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔥 handleSave called:", JSON.stringify(form, null, 2));
    if (!formRef.current || e.currentTarget !== formRef.current) {
      console.log("🚫 Submission ignored: event not originated from form");
      return;
    }
    if (isSubmitting) {
      console.log("🚫 Submission ignored: already in progress");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    if (!form.supplierId) {
              setError(t("suppliers.supplierNotSelected"));
      console.log("🚫 Validation failed: supplierId =", form.supplierId);
      setIsSubmitting(false);
      return;
    }
    if (!form.street) {
              setError(t("suppliers.streetRequired"));
      console.log("🚫 Validation failed: street =", form.street);
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        id: form.id,
        supplierId: form.supplierId,
        street: form.street,
        number: form.number || null,
        neighborhood: form.neighborhood || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
        companyAddressType: form.companyAddressType,
      };
      let res;
      if (form.id) {
        console.log("📤 Sending PUT to /supplier-addresses/", form.id);
        res = await api.put(`/supplier-addresses/${form.id}`, payload);
        console.log("✅ Update response:", JSON.stringify(res.data, null, 2));
        setNotice(t("suppliers.addressUpdated"));
        setAddresses((prev) =>
          prev.map((a) => (a.id === res.data.id ? { ...res.data } : a))
        );
      } else {
        console.log("📤 Sending POST to /supplier-addresses");
        res = await api.post("/supplier-addresses", payload);
        console.log("✅ Create response:", JSON.stringify(res.data, null, 2));
        setNotice(t("suppliers.addressCreated"));
        setAddresses((prev) => [...prev, { ...res.data }]);
      }
      resetForm();
      onSave(); // Call callback to update parent state
          } catch (err: any) {
        console.error(t("suppliers.saveError"), err);
        setError(err.response?.data?.message || t("suppliers.saveError"));
      } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    console.log("✏️ Editing address:", JSON.stringify(address, null, 2));
    setForm({ ...address });
    setEditingMode(true);
            setNotice(t("suppliers.editingAddress"));
    streetRef.current?.focus();
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleDelete = debounce(async (id: number | null) => {
    console.log("🗑️ handleDelete called: id =", id);
    if (!id) {
              setError(t("suppliers.invalidId"));
      return;
    }
    if (deleting) {
      console.log("🚫 Deletion already in progress");
      return;
    }
          if (!confirm(t("suppliers.confirmDelete"))) {
      console.log("❌ Deletion cancelled by user");
      return;
    }
    setDeleting(true);
    try {
      console.log("📤 Sending DELETE to /supplier-addresses/", id);
      await api.delete(`/supplier-addresses/${id}`);
      console.log("✅ Address deleted: id =", id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
              setNotice(t("suppliers.addressDeleted"));
      resetForm();
      onSave(); // Call callback to update parent state
          } catch (err: any) {
        console.error(t("suppliers.deleteError"), err);
        setError(err.response?.data?.message || t("suppliers.deleteError"));
      } finally {
      setDeleting(false);
    }
  }, 100);

  const handleNew = () => {
    console.log("➕ handleNew called: entityId =", entityId);
    if (!entityId) {
              setError(t("suppliers.selectSupplier"));
      console.log("🚫 Validation failed: entityId =", entityId);
      return;
    }
    setForm(initializeForm(entityId));
    setEditingMode(true);
            setNotice(t("suppliers.creatingNewAddress"));
    setError(null);
    streetRef.current?.focus();
    console.log("📜 Form after handleNew:", JSON.stringify(form, null, 2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⌨️ Enter blocked on input");
    }
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {notice && <p className={styles.notice}>{notice}</p>}
      <div className={styles["form-actions"]}>
        {!editingMode && (
          <button
            type="button"
            className={styles["button-new"]}
            onClick={handleNew}
            disabled={!entityId}
          >
                          {t("suppliers.newAddress")}
          </button>
        )}
      </div>
      <form ref={formRef} onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-name"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.supplier")}:</label>
            <input
              value={tradeName}
              className={styles["form-input"]}
              disabled={true}
              type="text"
                              aria-label={t("suppliers.supplier")}
            />
          </div>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.street")}:</label>
            <input
              ref={streetRef}
              name="street"
              value={form.street}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              required
                              aria-label={t("suppliers.street")}
            />
          </div>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.number")}:</label>
            <input
              name="number"
              value={form.number}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
                              aria-label={t("suppliers.number")}
            />
          </div>
        </div>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.neighborhood")}:</label>
            <input
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
                              aria-label={t("suppliers.neighborhood")}
            />
          </div>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.city")}:</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
                              aria-label={t("suppliers.city")}
            />
          </div>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.state")}:</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
                              aria-label={t("suppliers.state")}
            />
          </div>
        </div>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-value"]}`}>
                          <label className={styles["form-label"]}>{t("suppliers.zipCode")}:</label>
            <input
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
                              aria-label={t("suppliers.zipCode")}
            />
          </div>
        </div>
        {editingMode && (
          <div className={styles["form-actions"]}>
            <button type="submit" className={styles.button} disabled={isSubmitting}>
                              {form.id ? t("suppliers.update") : t("suppliers.save")}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.cancel}`}
              onClick={resetForm}
              disabled={isSubmitting}
            >
                              {t("suppliers.cancel")}
            </button>
          </div>
        )}
      </form>
      <table className={styles["supplier-table"]}>
        <thead>
          <tr>
                            <th>{t("suppliers.street")}</th>
                <th>{t("suppliers.number")}</th>
                <th>{t("suppliers.neighborhood")}</th>
                <th>{t("suppliers.city")}</th>
                <th>{t("suppliers.state")}</th>
                <th>{t("suppliers.zipCode")}</th>
                <th>{t("suppliers.type")}</th>
                <th>{t("suppliers.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((a) => (
            <tr key={a.id ?? `no-id-${a.street}`}>
              <td>{a.street}</td>
              <td>{a.number}</td>
              <td>{a.neighborhood}</td>
              <td>{a.city}</td>
              <td>{a.state}</td>
              <td>{a.zipCode}</td>
              <td>{a.companyAddressType}</td>
              <td>
                <button
                  className={styles["button-edit"]}
                  onClick={() => handleEdit(a)}
                  disabled={editingMode || isSubmitting}
                >
                  {t("suppliers.edit")}
                </button>
                <button
                  className={styles["button-delete"]}
                  onClick={() => handleDelete(a.id)}
                  disabled={a.id == null || deleting || editingMode || isSubmitting}
                >
                  {t("suppliers.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormSupplierAddress);
