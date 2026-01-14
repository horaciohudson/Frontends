import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/companies/FormCompany.module.css";
import { Company } from "../../models/Company";
import { withConcurrencyRetry, isConcurrencyError, delay } from "../../utils/concurrencyUtils";

interface Currency { id: number; name: string; }
interface Activity { id: number; name: string; }

interface Props {
  company: Company | null;
  companies: Company[];
  onEdit: (company: Company) => void;
  onSave: () => void;
}

const initial: Company = {
  id: null, // Changed from 0 to null for new companies
  corporateName: "",
  tradeName: "",
  cnpj: "",
  stateRegistration: "",
  municipalRegistration: "",
  phone: "",
  mobile: "",
  email: "",
  whatsapp: "",
  issRate: 0,
  funruralRate: 0,
  manager: "",
  factory: false,
  currencyId: null,
  activityId: null,
  supplierFlag: false,
  customerFlag: false,
  transporterFlag: false,
  version: 1, // Initialize with version 1 for new companies
};

function FormCompany({ company, companies, onEdit, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  const [form, setForm] = useState<Company>(initial);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retryInfo, setRetryInfo] = useState<{ count: number; maxRetries: number; message: string } | null>(null);

  const corporateNameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadCurrencies = useCallback(async () => {
    try {
      const res = await api.get("/currencies");
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setCurrencies(list);
    } catch (err: any) {
      console.error("Error loading currencies:", err);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const res = await api.get("/activities");
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setActivities(list);
    } catch (err: any) {
      console.error("Error loading activities:", err);
    }
  }, []);

  // initial
  useEffect(() => {
    (async () => {
      await Promise.all([loadCurrencies(), loadActivities()]);
    })().catch(console.error);
  }, [loadCurrencies, loadActivities]);

  // Fill/Reset form when changing company
  useEffect(() => {
    if (company) {
      setForm({
        ...company,
        issRate: company.issRate || 0,
        funruralRate: company.funruralRate || 0,
        transporterFlag: company.transporterFlag || false,
        version: company.version || 1, // Ensure version is always defined
      });
      setEditingMode(true);
      setError(null);
      setTimeout(() => corporateNameRef.current?.focus(), 0);
    } else {
      resetForm();
    }
  }, [company]);

  // ---- helpers ----
  const resetForm = useCallback(() => {
    setForm(initial);
    setEditingMode(false);
    setError(null);
    setSaving(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const checked = (e.target as HTMLInputElement).checked;

      setForm((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "currencyId" || name === "activityId"
            ? value ? Number(value) : null
            : value,
      }));
    },
    []
  );

  const validate = (): string | null => {
    if (!form.corporateName.trim()) return t("companies.corporateNameRequired");
    if (!form.cnpj || !/^\d{14}$/.test(form.cnpj.replace(/\D/g, ""))) return t("companies.cnpjInvalid");
    if (!form.currencyId) return t("companies.currencyRequired");
    if (!form.activityId) return t("companies.activityRequired");
    if (form.issRate < 0) return t("companies.issRateInvalid");
    if (form.funruralRate < 0) return t("companies.funruralRateInvalid");
    return null;
  };

  // ---- handlers ----
  const handleNew = () => {
    setForm(initial);
    setEditingMode(true);
    setError(null);
    setTimeout(() => corporateNameRef.current?.focus(), 0);
  };

  const handleEdit = useCallback((c: Company) => {
    // Ensure ID is a valid number
    if (!c.id || c.id <= 0) {
      console.warn("Attempt to edit company without valid ID:", c);
      return;
    }
    
    setForm({ ...c });
    setEditingMode(true);
    setError(null);
    onEdit(c);
    setTimeout(() => corporateNameRef.current?.focus(), 0);
  }, [onEdit]);

  const handleDelete = useCallback(async (id: number | null) => {
    if (!id || id <= 0) return; // Check if ID is valid
    if (!window.confirm(t("companies.confirmDelete"))) return;
    
    try {
      setDeleting(true);
      await api.delete(`/companies/${id}`);
      onSave();
      resetForm();
    } catch (err: any) {
      console.error("Error deleting:", err);
      setError(err.response?.data?.message || t("companies.deleteError"));
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

    // For updates, check if company still exists
    if (form.id && form.id > 0) {
      try {
        const checkResponse = await api.get(`/companies/${form.id}`);
        if (!checkResponse.data) {
          setError(t("companies.companyNotFound") || "Company not found. It may have been removed.");
          resetForm();
          onSave();
          return;
        }
      } catch (checkErr: any) {
        if (checkErr.response?.status === 404) {
          setError(t("companies.companyNotFound") || "Company not found. It may have been removed.");
          resetForm();
          onSave();
          return;
        }
        console.warn("Error checking company existence:", checkErr);
      }
    }

    // Function to attempt save with automatic retry
    const attemptSave = async (retryCount = 0): Promise<any> => {
      try {
        const payload = {
          ...(form.id ? { id: form.id } : {}), // Only include ID if it exists
          corporateName: form.corporateName,
          tradeName: form.tradeName || null,
          cnpj: form.cnpj.replace(/\D/g, ""),
          stateRegistration: form.stateRegistration || null,
          municipalRegistration: form.municipalRegistration || null,
          phone: form.phone || null,
          mobile: form.mobile || null,
          email: form.email || null,
          whatsapp: form.whatsapp || null,
          issRate: Number(form.issRate) || 0,
          funruralRate: Number(form.funruralRate) || 0,
          manager: form.manager || null,
          factory: form.factory,
          supplierFlag: form.supplierFlag,
          customerFlag: form.customerFlag,
          transporterFlag: form.transporterFlag,
          currencyId: form.currencyId,
          activityId: form.activityId,
          ...(form.id && form.id > 0 ? { version: form.version } : {}), // Only include version for existing companies
        };

        let res;
        if (form.id && form.id > 0) {
          res = await api.put(`/companies/${form.id}`, payload);
        } else {
          res = await api.post("/companies", payload);
        }

        return res;
      } catch (err: any) {
        // Detailed error logging for debugging
        console.log("🔍 Analyzing error for concurrency detection:");
        console.log("   Status:", err.response?.status);
        console.log("   Message:", err.response?.data?.message);
        console.log("   Error:", err.message);
        console.log("   isConcurrencyError:", isConcurrencyError(err));
        
        // Handle entity not found error FIRST
        if (err.response?.status === 404 || 
            err.response?.data?.message?.includes("not found") ||
            err.response?.data?.message?.includes("Company not found") ||
            err.message?.includes("EntityNotFoundException") ||
            err.message?.includes("Company not found")) {
          console.log("❌ Entity not found, not a concurrency error");
          throw new Error("ENTITY_NOT_FOUND");
        }
        
        // Handle specific concurrency error
        if (isConcurrencyError(err)) {
          console.log("✅ Concurrency error detected, starting retry...");
          if (retryCount < 3) {
            const currentRetry = retryCount + 1;
            const maxRetries = 3;
            
            console.log(`🔄 Concurrency conflict detected, attempt ${currentRetry}/${maxRetries}`);
            
            // Show retry information to user
            setRetryInfo({
              count: currentRetry,
              maxRetries: maxRetries,
              message: t("companies.retryMessage") || `Attempt ${currentRetry} of ${maxRetries}...`
            });
            
            // Wait with more responsive exponential backoff
            const delay = Math.min(Math.pow(1.5, retryCount) * 300, 1500); // Maximum of 1.5s
            console.log(`⏳ Waiting ${delay}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Reload company data to get latest version
            try {
              console.log("📥 Reloading company data to get updated version...");
              
              // Only reload if company has valid ID
              if (form.id && form.id > 0) {
                const freshData = await api.get(`/companies/${form.id}`);
                
                // Update form with latest data
                setForm(prev => ({
                  ...prev,
                  ...freshData.data,
                  version: freshData.data.version
                }));
                
                console.log("✅ Data reloaded, version updated:", freshData.data.version);
              } else {
                console.log("⚠️ Company without valid ID, cannot reload data");
              }
              
              // Try again with updated data
              return await attemptSave(retryCount + 1);
            } catch (refreshErr) {
              console.error("❌ Error reloading data for retry:", refreshErr);
              throw err; // Re-throw original error if cannot reload
            }
          } else {
            console.log("❌ Maximum attempts exceeded");
            setRetryInfo(null);
            throw new Error("MAX_RETRIES_EXCEEDED");
          }
        } else {
          console.log("❌ Error is not concurrency-related, re-throwing...");
        }
        
        throw err; // Re-throw other types of errors
      }
    };

    try {
      setSaving(true);
      setError(null);
      
      console.log("🚀 Starting company save...");
      const res = await attemptSave();

      console.log("✅ Company saved successfully:", res.data);

      const updatedCompany = {
        ...res.data,
        issRate: res.data.issRate,
        funruralRate: res.data.funruralRate,
        factory: Boolean(res.data.factory),
        supplierFlag: Boolean(res.data.supplierFlag),
        customerFlag: Boolean(res.data.customerFlag),
        transporterFlag: Boolean(res.data.transporterFlag),
        currencyId: Number(res.data.currencyId) || null,
        activityId: Number(res.data.activityId) || null,
        version: res.data.version,
      };

      onEdit(updatedCompany);
      
      // Clear retry information
      setRetryInfo(null);
      
      // Wait a bit before reloading to avoid conflicts
      setTimeout(() => {
        onSave();
      }, 200); // Reduced from 500ms to 200ms

      resetForm();
    } catch (err: any) {
      console.error("❌ Error saving company:", err);
      console.log("🔍 Complete error details:");
      console.log("   Type:", typeof err);
      console.log("   Constructor:", err.constructor.name);
      console.log("   Status:", err.response?.status);
      console.log("   Data:", err.response?.data);
      console.log("   Message:", err.message);
      console.log("   Stack:", err.stack);
      
      // Clear retry information
      setRetryInfo(null);
      
      let msg: string;
      
      if (err.message === "ENTITY_NOT_FOUND") {
        msg = t("companies.companyNotFound") || "Company not found. It may have been removed.";
        resetForm();
        onSave();
      } else if (err.message === "MAX_RETRIES_EXCEEDED") {
        msg = t("companies.maxRetriesExceeded") || "Maximum attempts exceeded due to concurrency conflicts. Please try again.";
      } else if (err.response?.status === 409) {
        msg = t("companies.cnpjAlreadyExists") || "CNPJ already exists in the system.";
      } else if (isConcurrencyError(err)) {
        msg = t("companies.concurrencyError") || "Concurrency error detected. Data was modified by another user. Please try again.";
      } else {
        msg = err.response?.data?.message || t("companies.saveError") || "Error saving company.";
      }
      
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [form, onEdit, onSave, resetForm, t]);

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      <form onSubmit={handleSave}>
        {/* Row: Corporate Name / Trade Name / CNPJ */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.corporateName")}:</label>
            <input
              ref={corporateNameRef}
              name="corporateName"
              value={form.corporateName}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              required
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.tradeName")}:</label>
            <input
              name="tradeName"
              value={form.tradeName}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.cnpj")}:</label>
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
              required
            />
          </div>
        </div>

        {/* Row: IE / IM / Phone */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.stateRegistration")}:</label>
            <input
              name="stateRegistration"
              value={form.stateRegistration}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.municipalRegistration")}:</label>
            <input
              name="municipalRegistration"
              value={form.municipalRegistration}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.phone")}:</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>
        </div>

        {/* Row: Mobile / Email / WhatsApp */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.mobile")}:</label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.email")}:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="email"
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.whatsapp")}:</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>
        </div>

        {/* Row: ISS / FUNRURAL / Manager */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.issRate")}:</label>
            <input
              name="issRate"
              value={form.issRate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.funruralRate")}:</label>
            <input
              name="funruralRate"
              value={form.funruralRate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.manager")}:</label>
            <input
              name="manager"
              value={form.manager}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="text"
            />
          </div>
        </div>

        {/* Row: Currency / Activity */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.currency")}:</label>
            <select
              name="currencyId"
              value={form.currencyId ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("companies.select")}</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("companies.activity")}:</label>
            <select
              name="activityId"
              value={form.activityId ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("companies.select")}</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Flags */}
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>
              <input
                name="factory"
                type="checkbox"
                checked={form.factory}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
              />
              {t("enums:companyFlags.FACTORY")}
            </label>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>
              <input
                name="supplierFlag"
                type="checkbox"
                checked={form.supplierFlag}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
              />
              {t("enums:companyFlags.SUPPLIER")}
            </label>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>
              <input
                name="transporterFlag"
                type="checkbox"
                checked={form.transporterFlag}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
              />
              {t("enums:companyFlags.TRANSPORTER")}
            </label>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>
              <input
                name="customerFlag"
                type="checkbox"
                checked={form.customerFlag}
                onChange={handleChange}
                className={styles["form-checkbox"]}
                disabled={!editingMode}
              />
              {t("enums:companyFlags.CUSTOMER")}
            </label>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={saving}>
                {form.id ? t("companies.update") : t("companies.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("companies.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {t("companies.newCompany")}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        
        {retryInfo && (
          <div className={styles.retryInfo}>
            <div className={styles.retryProgress}>
              <span className={styles.retryIcon}>🔄</span>
              <span className={styles.retryMessage}>
                {retryInfo.message}
              </span>
              <div className={styles.retryCount}>
                Attempt {retryInfo.count} of {retryInfo.maxRetries}
              </div>
            </div>
          </div>
        )}
      </form>

      <table className={styles["company-table"]}>
        <thead>
          <tr>
            <th>{t("companies.corporateName")}</th>
            <th>{t("companies.tradeName")}</th>
            <th>{t("companies.cnpj")}</th>
            <th>{t("companies.email")}</th>
            <th>{t("companies.phone")}</th>
            <th>{t("enums:companyFlags.FACTORY")}</th>
            <th>{t("companies.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id ?? `no-id-${c.cnpj}`}>
              <td>{c.corporateName}</td>
              <td>{c.tradeName}</td>
              <td>{c.cnpj}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.factory ? t("common.yes") : t("common.no")}</td>
              <td>
                <button
                  className={styles["button-edit"]}
                  onClick={() => handleEdit(c)}
                  disabled={editingMode || saving || !c.id || c.id <= 0}
                >
                  {t("companies.edit")}
                </button>
                <button
                  className={styles["button-delete"]}
                  onClick={() => handleDelete(c.id)}
                  disabled={!c.id || c.id <= 0 || deleting || editingMode || saving}
                >
                  {t("companies.delete")}
                </button>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan={7}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormCompany);
