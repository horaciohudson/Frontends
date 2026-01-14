import { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Product as ProductModel } from "../../models/Product";
import { ProductCost as ProductCostModel } from "../../models/ProductCost";
import api from "../../service/api";
import styles from "../../styles/products/ProductCost.module.css";

interface Props {
  product?: ProductModel;
  onDoubleClickProduct?: (product: ProductModel) => void;
}

const initial: ProductCostModel = {
  id: null,
  productId: null,
  averageCost: null,
  grossValue: null,
  netValue: null,
  acquisitionValue: null,
  meanValue: null,
  freightValue: null,
  ipiValue: null,
  taxValue: null,
  commissionValue: null,
  icmsCreditValue: null,
  sellerCommission: null,
  brokerCommission: null,
  commissionPercentage: null,
};

function initializeForm(product?: ProductModel): ProductCostModel {
  return {
    ...initial,
    productId: product?.id ?? null,
  };
}

function ProductCost({ product, onDoubleClickProduct }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [costs, setCosts] = useState<ProductCostModel[]>([]);
  const [form, setForm] = useState<ProductCostModel>(initializeForm(product));
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product?.id) {
      loadCosts(product.id);
    } else {
      setCosts([]);
      setForm(initial);
      setEditingMode(false);
      setWarning(t("productCost.selectProduct"));
      setError(null);
    }
  }, [product?.id]);

  const loadCosts = async (productId: number) => {
    try {
      const res = await api.get(`/product-costs?productId=${productId}`);
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedList = list.map((c: any) => ({
        id: Number(c.id) || null,
        productId: Number(c.productId) || null,
        averageCost: Number(c.averageCost) || null,
        grossValue: Number(c.grossValue) || null,
        netValue: Number(c.netValue) || null,
        acquisitionValue: Number(c.acquisitionValue) || null,
        meanValue: Number(c.meanValue) || null,
        freightValue: Number(c.freightValue) || null,
        ipiValue: Number(c.ipiValue) || null,
        taxValue: Number(c.taxValue) || null,
        commissionValue: Number(c.commissionValue) || null,
        icmsCreditValue: Number(c.icmsCreditValue) || null,
        sellerCommission: Number(c.sellerCommission) || null,
        brokerCommission: Number(c.brokerCommission) || null,
        commissionPercentage: Number(c.commissionPercentage) || null,
      }));
      setCosts(mappedList);
      if (mappedList.length > 0) {
        setWarning(t("productCost.hasCostRecord"));
      } else {
        setForm(initializeForm(product));
        setWarning(t("productCost.noCostRecord"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productCost.loadError"));
    }
  };

  const resetForm = () => {
    setForm(initializeForm(product));
    setEditingMode(false);
    setError(null);
    setWarning(costs.length > 0 ? t("productCost.hasCostRecord") : t("productCost.noCostRecord"));
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
        averageCost: form.averageCost,
        grossValue: form.grossValue,
        netValue: form.netValue,
        acquisitionValue: form.acquisitionValue,
        meanValue: form.meanValue,
        freightValue: form.freightValue,
        ipiValue: form.ipiValue,
        taxValue: form.taxValue,
        commissionValue: form.commissionValue,
        icmsCreditValue: form.icmsCreditValue,
        sellerCommission: form.sellerCommission,
        brokerCommission: form.brokerCommission,
        commissionPercentage: form.commissionPercentage,
      };

      const res = form.id
        ? await api.put(`/product-costs/${form.id}`, payload)
        : await api.post("/product-costs", payload);

      const savedCost = {
        id: Number(res.data.id) || null,
        productId: Number(res.data.productId) || null,
        averageCost: Number(res.data.averageCost) || null,
        grossValue: Number(res.data.grossValue) || null,
        netValue: Number(res.data.netValue) || null,
        acquisitionValue: Number(res.data.acquisitionValue) || null,
        meanValue: Number(res.data.meanValue) || null,
        freightValue: Number(res.data.freightValue) || null,
        ipiValue: Number(res.data.ipiValue) || null,
        taxValue: Number(res.data.taxValue) || null,
        commissionValue: Number(res.data.commissionValue) || null,
        icmsCreditValue: Number(res.data.icmsCreditValue) || null,
        sellerCommission: Number(res.data.sellerCommission) || null,
        brokerCommission: Number(res.data.brokerCommission) || null,
        commissionPercentage: Number(res.data.commissionPercentage) || null,
      };

      if (form.id) {
        setCosts((prev) =>
          prev.map((c) => (c.id === form.id ? savedCost : c))
        );
      } else {
        setCosts((prev) => [...prev, savedCost]);
      }

      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || t("productCost.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cost: ProductCostModel) => {
    setForm(cost);
    setEditingMode(true);
    setError(null);
    setWarning(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productCost.confirmDelete"))) return;

    try {
      await api.delete(`/product-costs/${id}`);
      setCosts((prev) => prev.filter((c) => c.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productCost.deleteError"));
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
             <label className={styles["form-label"]}>{t("productCost.name")}:</label>
             <input
               value={product?.name ?? ""}
               className={styles["form-input"]}
               disabled={true}
               type="text"
             />
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.averageCost")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="averageCost"
                 value={form.averageCost || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.grossValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="grossValue"
                 value={form.grossValue || ""}
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

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.netValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="netValue"
                 value={form.netValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.acquisitionValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="acquisitionValue"
                 value={form.acquisitionValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.meanValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="meanValue"
                 value={form.meanValue || ""}
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

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.freightValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="freightValue"
                 value={form.freightValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.ipiValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="ipiValue"
                 value={form.ipiValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.taxValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="taxValue"
                 value={form.taxValue || ""}
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

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.commissionValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="commissionValue"
                 value={form.commissionValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.icmsCreditValue")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="icmsCreditValue"
                 value={form.icmsCreditValue || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.sellerCommission")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="sellerCommission"
                 value={form.sellerCommission || ""}
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

         <div className={styles["form-row"]}>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.brokerCommission")}:</label>
             <div className={styles["field-suffix"]}>
               <input
                 name="brokerCommission"
                 value={form.brokerCommission || ""}
                 onChange={handleChange}
                 className={styles["form-input"]}
                 disabled={!editingMode}
                 type="number"
                 step="0.01"
               />
               <span className={styles.suffix}>R$</span>
             </div>
           </div>
           <div className={styles.column}>
             <label className={styles["form-label"]}>{t("productCost.commissionPercentage")}:</label>
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
         </div>

         <div className={styles["form-actions"]}>
           {!editingMode && (
             <button
               type="button"
               className={styles["button-new"]}
               onClick={handleNew}
               disabled={!product?.id || costs.length > 0}
             >
               {t("productCost.newProductCost")}
             </button>
           )}
           {editingMode && (
             <>
               <button type="button" className={styles.button} onClick={handleSave} disabled={saving}>
                 {form.id ? t("productCost.update") : t("productCost.save")}
               </button>
               <button
                 type="button"
                 className={`${styles.button} ${styles.cancel}`}
                 onClick={resetForm}
                 disabled={saving}
               >
                 {t("productCost.cancel")}
               </button>
             </>
           )}
         </div>
       </div>

      <table className={styles["cost-table"]}>
        <thead>
          <tr>
            <th>{t("productCost.name")}</th>
            <th>{t("productCost.averageCost")}</th>
            <th>{t("productCost.grossValue")}</th>
            <th>{t("productCost.netValue")}</th>
            <th>{t("productCost.acquisitionValue")}</th>
            <th>{t("productCost.freightValue")}</th>
            <th>{t("productCost.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {costs.length > 0 ? (
            costs.map((c) => (
              <tr key={c.id ?? `no-id-${c.productId}`} onDoubleClick={() => onDoubleClickProduct?.(product!)}>
                <td>{product?.name}</td>
                <td>R$ {c.averageCost}</td>
                <td>R$ {c.grossValue}</td>
                <td>R$ {c.netValue}</td>
                <td>R$ {c.acquisitionValue}</td>
                <td>R$ {c.freightValue}</td>
                <td>
                  <button
                    className={styles["button-edit"]}
                    onClick={() => handleEdit(c)}
                  >
                    {t("productCost.edit")}
                  </button>
                  <button
                    className={styles["button-delete"]}
                    type="button"
                    onClick={() => handleDelete(c.id)}
                  >
                    {t("productCost.delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={styles["no-data"]}>
                {t("productCost.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProductCost);
