import { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Product as ProductModel } from "../../models/Product";
import { ProductHistory as ProductHistoryModel } from "../../models/ProductHistory";
import { ProductOperationType } from "../../enums/ProductOperationType";
import { useAuth } from "../../routes/AuthContext";
import api from "../../service/api";
import styles from "../../styles/products/ProductHistory.module.css";

interface Props {
  product?: ProductModel;
  onDoubleClickProduct?: (product: ProductModel) => void;
}

const initial: ProductHistoryModel = {
  id: null,
  productId: null,
  operationType: null,
  operationDate: new Date().toISOString().slice(0, 16),
  quantity: null,
  totalValue: null,
  userName: "",
  note: "",
  lastSaleUser: "",
  lastPurchaseUser: "",
};

function initializeForm(product?: ProductModel, currentUser?: string, existingHistory?: ProductHistoryModel): ProductHistoryModel {
  return {
    ...initial,
    productId: product?.id ?? null,
    userName: currentUser || "",
    // Campos de última venda e compra começam vazios por padrão
    lastSaleUser: "",
    lastPurchaseUser: "",
  };
}

function ProductHistory({ product, onDoubleClickProduct }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const { user } = useAuth();
  const [histories, setHistories] = useState<ProductHistoryModel[]>([]);
  const [form, setForm] = useState<ProductHistoryModel>(initializeForm(product, user?.sub));
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const operationTypeOptions = [ProductOperationType.SALE, ProductOperationType.BUY, ProductOperationType.TRANSFER];

  useEffect(() => {
    setHistories([]);
    if (product?.id) {
      loadHistories(product.id);
    } else {
      setHistories([]);
      setForm(initializeForm(product, user?.sub));
      setEditingMode(false);
      setWarning(t("productHistory.selectProduct"));
      setError(null);
    }
  }, [product?.id, user?.sub]);

  const loadHistories = async (productId: number) => {
    try {
      if (!productId) {
        setError(t("common.invalidProductId"));
        return;
      }
      const res = await api.get(`/product-histories?productId=${productId}`);
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedList = list.map((h: any) => ({
        id: Number(h.id) || null,
        productId: Number(h.productId) || null,
        operationType: h.operationType || null,
        operationDate: h.operationDate ? new Date(h.operationDate).toISOString().slice(0, 16) : null,
        quantity: Number(h.quantity) || null,
        totalValue: Number(h.totalValue) || null,
        userName: h.userName || "",
        note: h.note || "",
        lastSaleUser: h.lastSaleUser || "",
        lastPurchaseUser: h.lastPurchaseUser || "",
      }));
      setHistories(mappedList);
      if (mappedList.length > 0) {
        setWarning(t("productHistory.historyLoaded"));
      } else {
        setForm(initializeForm(product, user?.sub));
        setWarning(t("productHistory.noHistoryFound"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productHistory.loadError"));
    }
  };

  const resetForm = () => {
    setForm(initializeForm(product, user?.sub));
    setEditingMode(false);
    setError(null);
    setWarning(histories.length > 0 ? t("productHistory.historyLoaded") : t("productHistory.noHistoryFound"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (): string | null => {
    if (!form.productId) {
      return t("common.productNotSelected");
    }
    if (!form.operationType) {
      return t("productHistory.operationTypeRequired");
    }
    if (!form.operationDate || (typeof form.operationDate === 'string' && !form.operationDate.trim())) {
      return t("productHistory.operationDateRequired");
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      return t("productHistory.quantityRequired");
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
      // Lógica inteligente para os campos de usuário baseada no tipo de operação
      let lastSaleUser = "";
      let lastPurchaseUser = "";

      if (form.operationType === ProductOperationType.SALE) {
        // Se for venda, atualiza APENAS o usuário da última venda
        lastSaleUser = user?.sub || "";
        // Para última compra, mantém o valor anterior se existir
        lastPurchaseUser = form.lastPurchaseUser || "";
      } else if (form.operationType === ProductOperationType.BUY) {
        // Se for compra, atualiza APENAS o usuário da última compra
        lastPurchaseUser = user?.sub || "";
        // Para última venda, mantém o valor anterior se existir
        lastSaleUser = form.lastSaleUser || "";
      } else {
        // Para TRANSFER, mantém ambos os valores anteriores se existirem
        lastSaleUser = form.lastSaleUser || "";
        lastPurchaseUser = form.lastPurchaseUser || "";
      }

      const payload = {
        id: form.id,
        productId: form.productId,
        operationType: form.operationType,
        operationDate: typeof form.operationDate === 'string' ? form.operationDate : form.operationDate?.toISOString() || "",
        quantity: Number(form.quantity) || 0,
        totalValue: Number(form.totalValue) || 0,
        userName: user?.sub || "",
        note: form.note || "",
        lastSaleUser: lastSaleUser,
        lastPurchaseUser: lastPurchaseUser,
      };

      const res = form.id
        ? await api.put(`/product-histories/${form.id}`, payload)
        : await api.post("/product-histories", payload);

      const savedHistory = {
        id: Number(res.data.id) || null,
        productId: Number(res.data.productId) || null,
        operationType: res.data.operationType || null,
        operationDate: res.data.operationDate ? new Date(res.data.operationDate).toISOString().slice(0, 16) : null,
        quantity: Number(res.data.quantity) || null,
        totalValue: Number(res.data.totalValue) || null,
        userName: res.data.userName || "",
        note: res.data.note || "",
        lastSaleUser: res.data.lastSaleUser || "",
        lastPurchaseUser: res.data.lastPurchaseUser || "",
      };

      if (form.id) {
        setHistories((prev) =>
          prev.map((h) => (h.id === form.id ? savedHistory : h))
        );
      } else {
        setHistories((prev) => [...prev, savedHistory]);
      }

      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || t("productHistory.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (history: ProductHistoryModel) => {
    // Ao editar, mantém os valores existentes dos campos de usuário
    setForm({
      ...history,
      // Garante que o usuário atual seja sempre o responsável pela operação
      userName: user?.sub || "",
    });
    setEditingMode(true);
    setError(null);
    setWarning(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productHistory.confirmDelete"))) return;

    try {
      await api.delete(`/product-histories/${id}`);
      setHistories((prev) => prev.filter((h) => h.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("productHistory.deleteError"));
    }
  };

  const handleNew = () => {
    setForm(initializeForm(product, user?.sub));
    setEditingMode(true);
    setError(null);
    setWarning(null);
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {warning && <p className={styles.warning}>{warning}</p>}
      
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.name")}:</label>
            <input
              value={product?.name ?? ""}
              className={styles["form-input"]}
              disabled={true}
              type="text"
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.operationType")}:</label>
            <select
              name="operationType"
              value={form.operationType || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("productHistory.select")}</option>
              {operationTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`enums:operationTypes.${option}`)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.operationDate")}:</label>
            <input
              name="operationDate"
              value={typeof form.operationDate === 'string' ? form.operationDate : form.operationDate?.toISOString().slice(0, 16) || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="datetime-local"
              required
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.quantity")}:</label>
            <input
              name="quantity"
              value={form.quantity || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.totalValue")}:</label>
            <input
              name="totalValue"
              value={form.totalValue || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              type="number"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.observations")}:</label>
            <textarea
              name="note"
              value={form.note || ""}
              onChange={handleChange}
              className={styles["form-textarea"]}
              disabled={!editingMode}
              rows={3}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.user")}:</label>
            <input
              name="userName"
              value={form.userName || ""}
              className={styles["form-input"]}
              disabled={true}
              type="text"
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.lastSaleUser")}:</label>
            <input
              name="lastSaleUser"
              value={form.lastSaleUser || ""}
              className={styles["form-input"]}
              disabled={true}
              type="text"
            />
          </div>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("productHistory.lastPurchaseUser")}:</label>
            <input
              name="lastPurchaseUser"
              value={form.lastPurchaseUser || ""}
              className={styles["form-input"]}
              disabled={true}
              type="text"
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={saving}>
                {form.id ? t("productHistory.update") : t("productHistory.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("productHistory.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
              disabled={!product?.id}
            >
              {t("productHistory.newProductHistory")}
            </button>
          )}
        </div>
      </form>

      <table className={styles["history-table"]}>
        <thead>
          <tr>
            <th>{t("productHistory.name")}</th>
            <th>{t("productHistory.operationType")}</th>
            <th>{t("productHistory.operationDate")}</th>
            <th>{t("productHistory.quantity")}</th>
            <th>{t("productHistory.totalValue")}</th>
            <th>{t("productHistory.user")}</th>
            <th>{t("productHistory.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {histories.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles["no-data"]}>
                {t("productHistory.noData")}
              </td>
            </tr>
          ) : (
            histories.map((h) => (
              <tr key={h.id ?? `no-id-${h.productId}`}>
                <td>{product?.name}</td>
                <td>{t(`enums:operationTypes.${h.operationType}`)}</td>
                <td>{h.operationDate ? new Date(h.operationDate).toLocaleString() : ""}</td>
                <td>{h.quantity}</td>
                <td>R$ {h.totalValue}</td>
                <td>{h.userName}</td>
                <td>
                  <button
                    className={styles["button-edit"]}
                    onClick={() => handleEdit(h)}
                  >
                    {t("productHistory.edit")}
                  </button>
                  <button
                    className={styles["button-delete"]}
                    type="button"
                    onClick={() => handleDelete(h.id)}
                  >
                    {t("productHistory.delete")}
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

export default memo(ProductHistory);
