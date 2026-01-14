import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/companies/FormCompanyAddress.module.css";

interface Address {
  id: number | null;
  companyId: number | null;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  companyAddressType: "COMMERCIAL" | "CORRESPONDENCE";
}

interface Props {
  entityType: string;
  entityId: number;
  onSave: () => void;
}

const initial: Address = {
  id: null,
  companyId: null,
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  companyAddressType: "COMMERCIAL",
};

function initializeForm(entityId: number) {
  return {
    ...initial,
    companyId: entityId,
  };
}

function FormCompanyAddress({ entityId, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<Address>(initializeForm(entityId));
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tradeName, setTradeName] = useState<string>("");

  const streetRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadTradeName = useCallback(async () => {
    try {
      const res = await api.get(`/companies/${entityId}`);
      setTradeName(res.data.tradeName || res.data.corporateName || "");
    } catch (err: any) {
      console.error("Error loading trade name:", err);
      setError(err.response?.data?.message || t("companyAddress.loadError"));
    }
  }, [entityId, t]);

  const loadAddresses = useCallback(async (companyId: number) => {
    try {
      if (!companyId) {
        setError(t("companyAddress.companyNotSelected"));
        return;
      }

      const res = await api.get(`/company-addresses/company/${companyId}`);
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedList = list.map((a: any) => ({
        id: Number(a.id) || null,
        companyId: Number(a.companyId) || null,
        street: a.street || "",
        number: a.number || "",
        district: a.district || "",
        city: a.city || "",
        state: a.state || "",
        zipCode: a.zipCode || "",
        companyAddressType: a.companyAddressType || "COMMERCIAL",
      }));

      setAddresses(mappedList);
      if (mappedList.length > 0) {
        setError(null);
      } else {
        setForm(initializeForm(companyId));
      }
    } catch (err: any) {
      console.error("Error loading addresses:", err);
      setError(err.response?.data?.message || t("companyAddress.loadError"));
    }
  }, [t]);

  // initial
  useEffect(() => {
    if (entityId) {
      loadTradeName();
      loadAddresses(entityId);
    }
  }, [entityId, loadTradeName, loadAddresses]);

  // ---- helpers ----
  const resetForm = useCallback((keepData: boolean = false) => {
    if (keepData) {
      setForm((prev) => ({
        ...prev,
        id: null,
        companyAddressType: "COMMERCIAL",
      }));
      setEditingMode(true);
    } else {
      setForm(initializeForm(entityId));
      setEditingMode(false);
    }
    setError(null);
    setSaving(false);
  }, [entityId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "zipCode") {
      const formattedZipCode = value.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
      setForm((prev) => ({
        ...prev,
        [name]: formattedZipCode,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const validate = (): string | null => {
    if (!form.companyId) return t("companyAddress.companyNotSelected");
    if (!form.street.trim()) return t("companyAddress.streetRequired");
    if (!form.state || !/^[A-Z]{2}$/.test(form.state)) return t("companyAddress.stateInvalid");
    if (!form.zipCode || !/^\d{5}-\d{3}$/.test(form.zipCode)) return t("companyAddress.zipCodeInvalid");
    return null;
  };

  // ---- handlers ----
  const handleNew = useCallback(() => {
    if (!entityId) {
      setError(t("companyAddress.selectCompany"));
      return;
    }
    setForm(initializeForm(entityId));
    setEditingMode(true);
    setError(null);
    setTimeout(() => streetRef.current?.focus(), 0);
  }, [entityId, t]);

  const handleEdit = useCallback((address: Address) => {
    setForm({ ...address });
    setEditingMode(true);
    setError(null);
    setTimeout(() => streetRef.current?.focus(), 0);
  }, []);

  const handleDelete = useCallback(async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("companyAddress.confirmDelete"))) return;
    
    try {
      setDeleting(true);
      await api.delete(`/company-addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      resetForm();
      onSave();
    } catch (err: any) {
      console.error("Error deleting:", err);
      setError(err.response?.data?.message || t("companyAddress.deleteError"));
    } finally {
      setDeleting(false);
    }
  }, [onSave, resetForm, t]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const msg = validate();
    if (msg) { 
      setError(msg); 
      return; 
    }

    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        id: form.id,
        companyId: form.companyId,
        street: form.street,
        number: form.number || null,
        district: form.district || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode.replace(/\D/g, ""),
        companyAddressType: form.companyAddressType,
      };

      let res: any;
      if (form.id) {
        res = await api.put(`/company-addresses/${form.id}`, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === res.data.id ? { ...res.data } : a))
        );
      } else {
        res = await api.post("/company-addresses", payload);
        setAddresses((prev) => [...prev, { ...res.data }]);
      }

      resetForm(true);
      onSave();
    } catch (err: any) {
      console.error("Error saving:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("companyAddress.saveError");
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [form, onSave, resetForm, t]);

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      <form onSubmit={handleSave}>
        {/* Row: Company / Street / Number */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.company")}:</label>
            <input
              value={tradeName}
              className={styles["form-input"]}
              disabled={true}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.street")}:</label>
            <input
              ref={streetRef}
              name="street"
              value={form.street}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              required
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.number")}:</label>
            <input
              name="number"
              value={form.number}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>
        </div>

        {/* Row: District / City / State */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.district")}:</label>
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.city")}:</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.state")}:</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              maxLength={2}
              placeholder="SP"
            />
          </div>
        </div>

        {/* Row: ZIP Code / Type */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.zipCode")}:</label>
            <input
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              maxLength={9}
              placeholder="00000-000"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companyAddress.type")}:</label>
            <select
              name="companyAddressType"
              value={form.companyAddressType}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="COMMERCIAL">{t("enums:addressTypes.COMMERCIAL")}</option>
              <option value="CORRESPONDENCE">{t("enums:addressTypes.CORRESPONDENCE")}</option>
            </select>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={saving}>
                {form.id ? t("companyAddress.update") : t("companyAddress.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={() => resetForm(false)}
                disabled={saving}
              >
                {t("companyAddress.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
              disabled={!entityId}
            >
              {t("companyAddress.newAddress")}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["address-table"]}>
        <thead>
          <tr>
            <th>{t("companyAddress.street")}</th>
            <th>{t("companyAddress.number")}</th>
            <th>{t("companyAddress.district")}</th>
            <th>{t("companyAddress.city")}</th>
            <th>{t("companyAddress.state")}</th>
            <th>{t("companyAddress.zipCode")}</th>
            <th>{t("companyAddress.type")}</th>
            <th>{t("companyAddress.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((a) => (
            <tr key={a.id ?? `no-id-${a.street}`}>
              <td>{a.street}</td>
              <td>{a.number}</td>
              <td>{a.district}</td>
              <td>{a.city}</td>
              <td>{a.state}</td>
              <td>{a.zipCode}</td>
              <td>{a.companyAddressType}</td>
              <td>
                <button
                  className={styles["button-edit"]}
                  onClick={() => handleEdit(a)}
                  disabled={editingMode || saving}
                >
                  {t("companyAddress.edit")}
                </button>
                <button
                  className={styles["button-delete"]}
                  onClick={() => handleDelete(a.id)}
                  disabled={a.id == null || deleting || editingMode || saving}
                >
                  {t("companyAddress.delete")}
                </button>
              </td>
            </tr>
          ))}
          {addresses.length === 0 && (
            <tr>
              <td colSpan={8}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormCompanyAddress);
