import { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Product as ProductModel } from "../../models/Product";
import { ProductFinancial as ProductFinancialInterface } from "../../models/ProductFinancial";
import api from "../../service/api";
import styles from "../../styles/products/ProductFinancial.module.css";

interface Props {
  product?: ProductModel;
  onDoubleClickProduct?: (product: ProductModel) => void;
}

const initial: ProductFinancialInterface = {
  id: null,
  productId: null,
  averagePaymentTerm: null,
  averageReceiptTerm: null,
  commissionPercentage: null,
  maxDiscountPercentage: null,
  creditLimit: null,
};

function initializeForm(product?: ProductModel): ProductFinancialInterface {
  return {
    ...initial,
    productId: product?.id ?? null,
  };
}

function ProductFinancial({ product, onDoubleClickProduct }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [financials, setFinancials] = useState<ProductFinancialInterface[]>([]);
  const [form, setForm] = useState<ProductFinancialInterface>(initializeForm(product));
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFinancials([]);
    if (product?.id) {
      loadFinancials(product.id);
    } else {
      setFinancials([]);
      setForm(initial);
      setEditingMode(false);
      setWarning(t("productFinancial.selectProduct"));
      setError(null);
    }
  }, [product?.id]);

  const loadFinancials = async (productId: number) => {
    try {
      if (!productId) {
        setError(t("common.invalidProductId"));
        return;
      }
      const res = await api.get(`/product-financials?productId=${productId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const mappedList = list.map((f: any) => ({
        id: Number(f.id) || null,
        productId: Number(f.productId) || null,
        averagePaymentTerm: Number(f.averagePaymentTerm) || null,
        averageReceiptTerm: Number(f.averageReceiptTerm) || null,
        commissionPercentage: Number(f.commissionPercentage) || null,
        maxDiscountPercentage: Number(f.maxDiscountPercentage) || null,
        creditLimit: Number(f.creditLimit) || null,
      }));
      setFinancials(mappedList);
      if (mappedList.length > 0) {
        setWarning(t("productFinancial.hasFinancialRecord"));
      } else {
        setForm(initializeForm(product));
        setWarning(t("productFinancial.noFinancialRecord"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productFinancial.loadError"));
    }
  };

  const resetForm = () => {
    setForm(initializeForm(product));
    setEditingMode(false);
    setError(null);
    setWarning(financials.length > 0 ? t("productFinancial.hasFinancialRecord") : t("productFinancial.noFinancialRecord"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const validate = (): string | null => {
    if (!form.productId) {
      return t("common.productNotSelected");
    }
    return null;
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }

    setSaving(true);
    setError(null);
    setWarning(null);

    try {
      const payload = {
        id: form.id,
        productId: form.productId,
        averagePaymentTerm: form.averagePaymentTerm,
        averageReceiptTerm: form.averageReceiptTerm,
        commissionPercentage: form.commissionPercentage,
        maxDiscountPercentage: form.maxDiscountPercentage,
        creditLimit: form.creditLimit,
      };

      const res = form.id
        ? await api.put(`/product-financials/${form.id}`, payload)
        : await api.post("/product-financials", payload);

      const savedFinancial = {
        id: Number(res.data.id) || null,
        productId: Number(res.data.productId) || null,
        averagePaymentTerm: Number(res.data.averagePaymentTerm) || null,
        averageReceiptTerm: Number(res.data.averageReceiptTerm) || null,
        commissionPercentage: Number(res.data.commissionPercentage) || null,
        maxDiscountPercentage: Number(res.data.maxDiscountPercentage) || null,
        creditLimit: Number(res.data.creditLimit) || null,
      };

      if (form.id) {
        setFinancials((prev) =>
          prev.map((f) => (f.id === form.id ? savedFinancial : f))
        );
      } else {
        setFinancials((prev) => [...prev, savedFinancial]);
      }

      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || t("productFinancial.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (financial: ProductFinancialInterface) => {
    setForm(financial);
    setEditingMode(true);
    setError(null);
    setWarning(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productFinancial.confirmDelete"))) return;

    try {
      await api.delete(`/product-financials/${id}`);
      setFinancials((prev) => prev.filter((f) => f.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productFinancial.deleteError"));
    }
  };

  const handleNew = () => {
    setForm(initializeForm(product));
    setEditingMode(true);
    setError(null);
    setWarning(null);
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {warning && <p className={styles.warning}>{warning}</p>}
      
             <div className={styles["form-section"]}>
         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.name")}:</label>
             <input
               value={product?.name ?? ""}
               className={styles["form-input"]}
               disabled={true}
               type="text"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.averagePaymentTerm")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="averagePaymentTerm"
                 value={form.averagePaymentTerm || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>{t("productFinancial.days")}</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.averageReceiptTerm")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="averageReceiptTerm"
                 value={form.averageReceiptTerm || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>{t("productFinancial.days")}</span>
             </div>
           </div>
         </div>

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.commissionPercentage")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="commissionPercentage"
                 value={form.commissionPercentage || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>%</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.maxDiscountPercentage")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="maxDiscountPercentage"
                 value={form.maxDiscountPercentage || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>%</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productFinancial.creditLimit")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="creditLimit"
                 value={form.creditLimit || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
         </div>

         <div className={styles["form-actions"]}>
           {!editingMode && (
             <button
               type="button"
               className={styles["button-new"]}
               onClick={handleNew}
               disabled={!product?.id || financials.length > 0}
             >
               {t("productFinancial.newProductFinancial")}
             </button>
           )}
           {editingMode && (
             <>
               <button type="button" className={styles.button} onClick={handleSave} disabled={saving}>
                 {form.id ? t("productFinancial.update") : t("productFinancial.save")}
               </button>
               <button
                 type="button"
                 className={`${styles.button} ${styles.cancel}`}
                 onClick={resetForm}
                 disabled={saving}
               >
                 {t("productFinancial.cancel")}
               </button>
             </>
           )}
         </div>
       </div>

      <table className={styles["financial-table"]}>
        <thead>
          <tr>
            <th>{t("productFinancial.name")}</th>
            <th>{t("productFinancial.averagePaymentTerm")}</th>
            <th>{t("productFinancial.averageReceiptTerm")}</th>        
            <th>{t("productFinancial.creditLimit")}</th>
            <th>{t("productFinancial.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {financials.length > 0 ? (
            financials.map((f) => (
              <tr key={f.id ?? `no-id-${f.productId}`} onDoubleClick={() => onDoubleClickProduct?.(product!)}>
                <td>{product?.name}</td>
                <td>{f.averagePaymentTerm} {t("productFinancial.days")}</td>
                <td>{f.averageReceiptTerm} {t("productFinancial.days")}</td>
            
                <td>R$ {f.creditLimit}</td>
                <td>
                  <button
                    className={styles["button-edit"]}
                    onClick={() => handleEdit(f)}
                  >
                    {t("productFinancial.edit")}
                  </button>
                  <button
                    className={styles["button-delete"]}
                    type="button"
                    onClick={() => handleDelete(f.id)}
                  >
                    {t("productFinancial.delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={styles["no-data"]}>
                {t("productFinancial.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProductFinancial);
