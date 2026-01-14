import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/purchases/FormPurchase.module.css";
import { Purchase } from "../../models/Purchase";
import { PurchaseStatus } from "../../enums";

interface FormPurchaseProps {
  onSelectPurchase?: (purchase: Purchase | null) => void;
  onDoubleClickPurchase?: (purchase: Purchase) => void;
}

const todayISO = () => new Date().toISOString().split("T")[0];

const emptyForm: Omit<Purchase, "id"> & { id?: number } = {
  id: undefined,
  supplierId: 0,
  paymentMethodId: 0,
  invoiceNumber: "",
  issueDate: todayISO(),
  purchaseDate: todayISO(),
  deliveryDate: todayISO(),
  totalAmount: 0,
  totalDiscount: 0,
  additionalExpenses: 0,
  purchaseStatus: PurchaseStatus.PENDING,
  note: "",
  companyId: 0,
};

export default function FormPurchase({ onSelectPurchase, onDoubleClickPurchase }: FormPurchaseProps) {
  const { t } = useTranslation(['commercial', 'common']);
  const { t: tEnums } = useTranslation('enums');

  const [rows, setRows] = useState<Purchase[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // relationships
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  // initial load
  useEffect(() => {
    loadRows();
    loadRelations();
  }, []);

  // Load purchase items and calculate totals when form.id changes
  useEffect(() => {
    if (form.id) {
      loadPurchaseItemsAndCalculateTotals(form.id);
    }
  }, [form.id]);

  const loadRows = async () => {
    try {
      setLoading(true);
      console.log("📦 FormPurchase - Carregando compras...");
      const res = await api.get("/purchases");
      console.log("📦 FormPurchase - Resposta da API:", res);
      console.log("📦 FormPurchase - res.data:", res.data);

      const data = res.data?.content || res.data || [];
      console.log("📦 FormPurchase - Dados processados:", data);
      console.log("📦 FormPurchase - É array?", Array.isArray(data));

      setRows(Array.isArray(data) ? data : []);
      console.log("✅ FormPurchase - Compras carregadas:", Array.isArray(data) ? data.length : 0);
    } catch (e: any) {
      console.error("❌ FormPurchase - Erro ao carregar compras:", e);
      console.error("❌ FormPurchase - Erro response:", e?.response);
      setError(t("purchases.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const loadRelations = async () => {
    try {
      const [supRes, payRes, compRes] = await Promise.all([
        api.get("/companies/suppliers"),
        api.get("/payment-methods"),
        api.get("/companies"),
      ]);

      const supData = supRes.data?.content || supRes.data || [];
      const payData = payRes.data?.content || payRes.data || [];
      const compData = compRes.data?.content || compRes.data || [];

      setSuppliers(Array.isArray(supData) ? supData : []);
      setPaymentMethods(Array.isArray(payData) ? payData : []);
      setCompanies(Array.isArray(compData) ? compData : []);
    } catch (e) {
      console.error("❌ Error loading relations:", e);
      setError(t("purchases.loadRelationsError"));
    }
  };

  const loadPurchaseItemsAndCalculateTotals = async (purchaseId: number) => {
    try {
      const res = await api.get(`/purchase-items?purchaseId=${purchaseId}`);
      const items = Array.isArray(res.data) ? res.data : res.data?.content || [];

      // Calculate totals from items
      let totalAmount = 0;
      let totalDiscount = 0;

      items.forEach((item: any) => {
        totalAmount += Number(item.totalItemValue || 0);
        totalDiscount += Number(item.totalDiscountItem || 0);
      });

      // Update form with calculated totals
      setForm(prev => ({
        ...prev,
        totalAmount,
        totalDiscount
      }));
    } catch (e) {
      console.error("❌ Error loading purchase items:", e);
    }
  };

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditing(false);
    setError(null);
    onSelectPurchase?.(null);
  }, [onSelectPurchase]);

  const handleNew = useCallback(() => {
    resetForm();
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [resetForm]);

  const handleEdit = useCallback(
    (p: Purchase) => {
      setForm({ ...p });
      setEditing(true);
      onSelectPurchase?.(p);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [onSelectPurchase]
  );

  const handleDelete = useCallback(
    async (id?: number) => {
      if (!id) return;
      if (!confirm(t("purchases.confirmDelete"))) return;
      try {
        setLoading(true);
        await api.delete(`/purchases/${id}`);
        setRows((prev) => Array.isArray(prev) ? prev.filter((r) => r.id !== id) : []);
        onSelectPurchase?.(null);
        setSuccess(t("purchases.deleteSuccess"));
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        setError(t("purchases.deleteError"));
      } finally {
        setLoading(false);
      }
    },
    [onSelectPurchase, t]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsed: any = value;

    // Only convert to number for actual number fields
    if (type === "number") {
      parsed = value === "" ? 0 : Number(value);
    }

    // DO NOT convert IDs to numbers - they can be UUIDs (strings)
    // Just use the value as-is, converting empty string to 0 for consistency
    if (["supplierId", "paymentMethodId", "companyId"].includes(name)) {
      parsed = value === "" ? 0 : value;  // Keep as string if not empty
    }

    setForm((prev) => ({ ...prev, [name]: parsed }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (!form.supplierId) return t("purchases.supplierRequired");
    if (!form.paymentMethodId) return t("purchases.paymentMethodRequired");
    if (!form.companyId) return t("purchases.companyRequired");
    if (form.totalAmount < 0) return t("purchases.totalAmountInvalid");
    if (form.totalDiscount < 0) return t("purchases.totalDiscountInvalid");
    if (form.additionalExpenses < 0) return t("purchases.additionalExpensesInvalid");
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      const payload = { ...form };
      const res = form.id
        ? await api.put(`/purchases/${form.id}`, payload)
        : await api.post("/purchases", { ...payload, id: undefined });

      const saved: Purchase = res.data;
      setRows((prev) => {
        if (!Array.isArray(prev)) return [saved];
        return form.id ? prev.map((r) => (r.id === form.id ? saved : r)) : [...prev, saved];
      });
      setSuccess(t("purchases.saveSuccess"));
      setTimeout(() => setSuccess(null), 3000);
      onSelectPurchase?.(saved);
      resetForm();
    } catch (err: any) {
      setError(
        t("purchases.saveError") +
        " " +
        (err?.response?.data?.message || err?.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => Array.isArray(rows) ? rows : [], [rows]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.supplier")}:</label>
            <select
              name="supplierId"
              value={form.supplierId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            >
              <option value="">{t("buttons.select")}</option>
              {Array.isArray(suppliers) && suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.tradeName || s.id}</option>
              ))}
            </select>
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.paymentMethod")}:</label>
            <select
              name="paymentMethodId"
              value={form.paymentMethodId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            >
              <option value="">{t("buttons.select")}</option>
              {Array.isArray(paymentMethods) && paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.kind ? tEnums(`paymentMethods.${pm.kind}`) : (pm.name || pm.code || `ID: ${pm.id}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.company")}:</label>
            <select
              name="companyId"
              value={form.companyId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            >
              <option value="">{t("buttons.select")}</option>
              {Array.isArray(companies) && companies.map((c) => (
                <option key={c.id} value={c.id}>{c.corporateName || c.tradeName || c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.invoiceNumber")}:</label>
            <input
              ref={inputRef}
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.issueDate")}:</label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.purchaseDate")}:</label>
            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.deliveryDate")}:</label>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.totalAmount")}:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="totalAmount"
              value={form.totalAmount}
              className={styles["form-input"]}
              disabled={true}
              readOnly
              style={{ backgroundColor: '#e9ecef', color: '#495057', fontWeight: 'bold' }}
              title="Calculado automaticamente a partir dos itens"
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.totalDiscount")}:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="totalDiscount"
              value={form.totalDiscount}
              className={styles["form-input"]}
              disabled={true}
              readOnly
              style={{ backgroundColor: '#e9ecef', color: '#495057', fontWeight: 'bold' }}
              title="Calculado automaticamente a partir dos itens"
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.additionalExpenses")}:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="additionalExpenses"
              value={form.additionalExpenses}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.status")}:</label>
            <select
              name="purchaseStatus"
              value={form.purchaseStatus}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            >
              <option value={PurchaseStatus.PENDING}>{t("purchases.statuses.PENDING")}</option>
              <option value={PurchaseStatus.APPROVED}>{t("purchases.statuses.APPROVED")}</option>
              <option value={PurchaseStatus.RECEIVED}>{t("purchases.statuses.RECEIVED")}</option>
              <option value={PurchaseStatus.CANCELLED}>{t("purchases.statuses.CANCELLED")}</option>
            </select>
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchases.note")}:</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className={styles["form-textarea"]}
              rows={2}
              disabled={!editing}
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editing ? (
            <>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? t("buttons.saving") : form.id ? t("buttons.update") : t("buttons.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={loading}
              >
                {t("buttons.cancel")}
              </button>
            </>
          ) : (
            <button type="button" className={styles["button-novo"]} onClick={handleNew}>
              {t("buttons.new")}
            </button>
          )}
        </div>

        {success && <p className={styles.success}>{success}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["purchase-table"]}>
        <thead>
          <tr>
            <th>{t("purchases.invoiceNumber")}</th>
            <th>{t("purchases.supplier")}</th>
            <th>{t("purchases.purchaseDate")}</th>
            <th>{t("purchases.totalAmount")}</th>
            <th>{t("purchases.status")}</th>
            <th>{t("buttons.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className={styles.loading}>{t("buttons.loading")}</td></tr>
          ) : (Array.isArray(tableRows) && tableRows.length === 0) ? (
            <tr><td colSpan={6} className={styles.noData}>{t("purchases.noPurchases")}</td></tr>
          ) : (
            Array.isArray(tableRows) && tableRows.map((r) => (
              <tr key={r.id} onDoubleClick={() => onDoubleClickPurchase?.(r)} style={{ cursor: 'pointer' }}>
                <td>{r.invoiceNumber || t("buttons.noData")}</td>
                <td>{Array.isArray(suppliers) ? (suppliers.find(s => s.id === r.supplierId)?.name || r.supplierId) : r.supplierId}</td>
                <td>{new Date(r.purchaseDate).toLocaleDateString()}</td>
                <td>${Number(r.totalAmount || 0).toFixed(2)}</td>
                <td>{t(`purchases.statuses.${r.purchaseStatus}`)}</td>
                <td>
                  <button className={styles["button-editar"]} onClick={() => handleEdit(r)} disabled={loading}>
                    {t("buttons.edit")}
                  </button>
                  <button className={styles["button-excluir"]} onClick={() => handleDelete(r.id)} disabled={loading}>
                    {t("buttons.delete")}
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
