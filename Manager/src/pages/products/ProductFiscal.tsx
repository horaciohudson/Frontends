import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/products/ProductFiscal.module.css";
import { Product as ProductModel } from "../../models/Product";
import { TaxSituation } from "../../models/taxSituation";
import { ProductTax } from "../../models/ProductTax";
import api from "../../service/api";

// Using ProductTax interface from models

interface ProductFiscalProps {
  product: ProductModel;
  onDoubleClickProduct?: (product: ProductModel) => void;
}

export default function ProductFiscal({ product, onDoubleClickProduct }: ProductFiscalProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [form, setForm] = useState<ProductTax>({
    id: null,
    productId: product.id!,
    ipiPercentage: null,
    cicmPercentage: null,
    icmsPercentage: null,
    impPercentage: null,
    freightPercentage: null,
    acquisitionPercentage: null,
  });

  const [editingMode, setEditingMode] = useState(false);
  const [fiscalRecords, setFiscalRecords] = useState<ProductTax[]>([]);
  const [taxSituations, setTaxSituations] = useState<TaxSituation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTaxSituations();
    loadFiscalData();
  }, [product.id]);

  const loadTaxSituations = async () => {
    try {
      const res = await api.get("/tax-situations");
      setTaxSituations(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch (err: any) {
      console.error("Error loading tax situations:", err);
    }
  };

  const loadFiscalData = async () => {
    if (!product.id) return;
    try {
      const res = await api.get(`/product-taxes?productId=${product.id}`);
      setFiscalRecords(Array.isArray(res.data) ? res.data : []);
      if (!editingMode) resetForm();
      setError(null);
    } catch (err: any) {
      setError(t("common.loadError"));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const validate = (): string | null => {
    // Basic validation - all fields are optional in ProductTax
    return null;
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        productId: product.id,
      };

      const res = form.id
        ? await api.put(`/product-taxes/${form.id}`, payload)
        : await api.post("/product-taxes", payload);

      const saved = res.data;
      setFiscalRecords((prev) =>
        form.id ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved]
      );

      resetForm();
      setError(null);
    } catch (err: any) {
      setError(t("productFiscal.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setEditingMode(true);
    setError(null);
  };

  const handleEdit = (record: ProductTax) => {
    setForm(record);
    setEditingMode(true);
    setError(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productFiscal.confirmDelete"))) return;

    try {
      await api.delete(`/product-taxes/${id}`);
      setFiscalRecords((prev) => prev.filter((r) => r.id !== id));
      if (form.id === id) {
        resetForm();
      }
      setError(null);
    } catch (err: any) {
      setError(t("productFiscal.deleteError"));
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      productId: product.id!,
      ipiPercentage: null,
      cicmPercentage: null,
      icmsPercentage: null,
      impPercentage: null,
      freightPercentage: null,
      acquisitionPercentage: null,
    });
    setEditingMode(false);
    setError(null);
  };



  return (
    <div className={styles.container}>
      <h3>{t("productFiscal.title")}</h3>
      
      {error && <p className={styles.error}>{error}</p>}
      
             <div className={styles["form-section"]}>
         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.name")}:</label>
             <input
               value={product.name}
               className={styles["form-input"]}
               disabled={true}
               type="text"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.icms")}:</label>
             <input
               name="icmsPercentage"
               value={form.icmsPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.ipi")}:</label>
             <input
               name="ipiPercentage"
               value={form.ipiPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
         </div>

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.pis")}:</label>
             <input
               name="cicmPercentage"
               value={form.cicmPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.imp")}:</label>
             <input
               name="impPercentage"
               value={form.impPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.freight")}:</label>
             <input
               name="freightPercentage"
               value={form.freightPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
         </div>

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFiscal.acquisition")}:</label>
             <input
               name="acquisitionPercentage"
               value={form.acquisitionPercentage || ""}
               onChange={handleChange}
               className={styles["form-input"]}
               disabled={!editingMode}
               type="number"
               step="0.01"
             />
           </div>
         </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button
                type="button"
                className={styles.button}
                onClick={handleSave}
                disabled={saving}
              >
                {form.id ? t("productFiscal.update") : t("productFiscal.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("productFiscal.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {t("productFiscal.newProductFiscal")}
            </button>
          )}
        </div>
      </div>

      <table className={styles["fiscal-table"]}>
        <thead>
          <tr>
            <th>{t("productFiscal.name")}</th>
            <th>{t("productFiscal.icms")}</th>
            <th>{t("productFiscal.ipi")}</th>
            <th>{t("productFiscal.cicm")}</th>
            <th>{t("productFiscal.imp")}</th>
            <th>{t("productFiscal.freight")}</th>
            <th>{t("productFiscal.acquisition")}</th>
            <th>{t("productFiscal.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {fiscalRecords.length > 0 ? (
            fiscalRecords.map((record) => (
              <tr key={record.id} onDoubleClick={() => onDoubleClickProduct?.(product)}>
                <td>{product.name}</td>
                <td>{record.icmsPercentage}%</td>
                <td>{record.ipiPercentage}%</td>
                <td>{record.cicmPercentage}%</td>
                <td>{record.impPercentage}%</td>
                <td>{record.freightPercentage}%</td>
                <td>{record.acquisitionPercentage}%</td>
                <td>
                  <button
                    className={styles["button-edit"]}
                    onClick={() => handleEdit(record)}
                  >
                    {t("productFiscal.edit")}
                  </button>
                  <button
                    className={styles["button-delete"]}
                    onClick={() => handleDelete(record.id)}
                  >
                    {t("productFiscal.delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className={styles["no-data"]}>
                {t("productFiscal.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
