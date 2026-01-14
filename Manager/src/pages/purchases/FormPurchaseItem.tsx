import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../service/api";
import styles from "../../styles/purchases/FormPurchaseItem.module.css";
import { Purchase } from "../../models/Purchase";
import { PurchaseItem } from "../../models/Purchase";
import { UnitType } from "../../enums/UnitType";
import { Product } from "../../models/Product";
import { RawMaterial } from "../../models/RawMaterial";
import ProductSearchDialog from "../../components/ProductSearchDialog";
import RawMaterialSearchDialog from "../../components/RawMaterialSearchDialog";


interface FormPurchaseItemProps {
  purchase: Purchase; // active purchase from FormPurchaseTabs
  onDoubleClickPurchase?: (purchase: Purchase) => void;
}

type ProductLite = { id: number; name: string; unitType?: string };
type ItemType = 'product' | 'rawMaterial';

const emptyItem = (purchase: Purchase): Omit<PurchaseItem, "idPurchaseItem" | "createdAt" | "updatedAt"> & {
  idPurchaseItem?: number;
  createdAt?: string;
  updatedAt?: string;
} => ({
  idPurchaseItem: undefined,
  purchaseId: purchase.id,
  productId: undefined,
  rawMaterialId: undefined,
  productName: "",
  unitType: "",
  quantity: 0,
  unitPrice: 0,
  discountPercentage: 0,
  totalDiscountItem: 0,
  totalItemValue: 0,
  itemObservation: "",
  companyId: purchase.companyId,
  createdAt: undefined,
  updatedAt: undefined,
});

export default function FormPurchaseItem({ purchase, onDoubleClickPurchase }: FormPurchaseItemProps) {
  const { t } = useTranslation('commercial');

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [form, setForm] = useState(emptyItem(purchase));
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // New states for item type selection
  const [itemType, setItemType] = useState<ItemType>('product');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isRawMaterialDialogOpen, setIsRawMaterialDialogOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string>("");

  // load list and relationships
  useEffect(() => {
    loadItems();
    loadProducts();
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchase.id]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchase-items?purchaseId=${purchase.id}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setItems(data);
    } catch (e) {
      setError(t("purchaseItems.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      const data = res.data?.content || res.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(t("purchaseItems.loadProductsError"));
    }
  };

  const resetForm = () => {
    setForm(emptyItem(purchase));
    setEditing(false);
    setError(null);
    setItemType('product');
    setSelectedItemName("");
  };

  // Function to update purchase totals in backend
  const updatePurchaseTotals = async () => {
    try {
      // Load all items for this purchase
      const res = await api.get(`/purchase-items?purchaseId=${purchase.id}`);
      const allItems = Array.isArray(res.data) ? res.data : res.data?.content || [];

      // Calculate totals
      let totalAmount = 0;
      let totalDiscount = 0;

      allItems.forEach((item: any) => {
        totalAmount += Number(item.totalItemValue || 0);
        totalDiscount += Number(item.totalDiscountItem || 0);
      });

      // Update purchase with new totals
      await api.put(`/purchases/${purchase.id}`, {
        ...purchase,
        totalAmount,
        totalDiscount
      });

      console.log('✅ Purchase totals updated:', { totalAmount, totalDiscount });
    } catch (error) {
      console.error('❌ Error updating purchase totals:', error);
    }
  };

  // calculate total automatically
  const computedTotal = useMemo(() => {
    const q = Number(form.quantity || 0);
    const price = Number(form.unitPrice || 0);
    const disc = Number(form.discountPercentage || 0);
    const gross = q * price;
    const discount = gross * (disc / 100);
    const total = Math.max(0, gross - discount);
    return {
      totalDiscountItem: Number.isFinite(discount) ? discount : 0,
      totalItemValue: Number.isFinite(total) ? total : 0
    };
  }, [form.quantity, form.unitPrice, form.discountPercentage]);

  // synchronize calculated totals in state
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      totalDiscountItem: computedTotal.totalDiscountItem,
      totalItemValue: computedTotal.totalItemValue
    }));
  }, [computedTotal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsed: any = value;

    if (type === "number") parsed = value === "" ? 0 : Number(value);
    if (["productId", "companyId", "purchaseId"].includes(name)) parsed = value === "" ? 0 : Number(value);

    // when selecting product, fill name and unit (if available)
    if (name === "productId") {
      const prod = products.find(p => p.id === Number(parsed));
      setForm(prev => ({
        ...prev,
        productId: Number(parsed),
        productName: prod?.name || "",
        unitType: prod?.unitType || prev.unitType || ""
      }));
      if (error) setError(null);
      return;
    }

    setForm(prev => ({ ...prev, [name]: parsed }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (itemType === 'product' && !form.productId) return "Selecione um produto";
    if (itemType === 'rawMaterial' && !form.rawMaterialId) return "Selecione uma matéria prima";
    if (!form.unitType) return t("purchaseItems.unitTypeRequired");
    if (form.quantity < 0) return t("purchaseItems.quantityInvalid");
    if (form.unitPrice < 0) return t("purchaseItems.unitPriceInvalid");
    if (form.discountPercentage < 0 || form.discountPercentage > 100)
      return t("purchaseItems.discountInvalid");
    return null;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        purchaseId: purchase.id,
        companyId: purchase.companyId,
        totalDiscountItem: computedTotal.totalDiscountItem,
        totalItemValue: computedTotal.totalItemValue,
        productName: form.productName || products.find(p => p.id === form.productId)?.name || "",
      };

      const res = form.idPurchaseItem
        ? await api.put(`/purchase-items/${form.idPurchaseItem}`, payload)
        : await api.post("/purchase-items", { ...payload, idPurchaseItem: undefined });

      const saved: PurchaseItem = res.data;
      setItems(prev =>
        form.idPurchaseItem
          ? prev.map(i => (i.idPurchaseItem === form.idPurchaseItem ? saved : i))
          : [...prev, saved]
      );

      setSuccess(t("purchaseItems.saveSuccess"));
      setTimeout(() => setSuccess(null), 3000);

      // Update purchase totals
      await updatePurchaseTotals();

      resetForm();
    } catch (err: any) {
      setError(
        t("purchaseItems.saveError") +
        " " +
        (err?.response?.data?.message || err?.message || "")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: PurchaseItem) => {
    setForm({
      ...item,
    });
    setEditing(true);

    // Determine item type and set selected name
    if (item.productId) {
      setItemType('product');
      setSelectedItemName(item.productName || "");
    } else if (item.rawMaterialId) {
      setItemType('rawMaterial');
      setSelectedItemName(item.productName || ""); // productName field stores both
    }

    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  const handleProductSelect = (product: Product) => {
    setForm(prev => ({
      ...prev,
      productId: product.id,
      rawMaterialId: undefined,
      productName: product.name,
      unitType: (product as any).unitType || prev.unitType || ""
    }));
    setSelectedItemName(product.name);
    if (error) setError(null);
  };

  const handleRawMaterialSelect = (rawMaterial: RawMaterial) => {
    setForm(prev => ({
      ...prev,
      productId: undefined,
      rawMaterialId: rawMaterial.idRawMaterial || undefined,
      productName: rawMaterial.name,
      unitType: prev.unitType || ""
    }));
    setSelectedItemName(rawMaterial.name);
    if (error) setError(null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm(t("purchaseItems.confirmDelete"))) return;
    try {
      setLoading(true);
      await api.delete(`/purchase-items/${id}`);
      setItems(prev => prev.filter(i => i.idPurchaseItem !== id));
      setSuccess(t("purchaseItems.deleteSuccess"));
      setTimeout(() => setSuccess(null), 3000);
      await loadItems();

      // Update purchase totals
      await updatePurchaseTotals();

      if (form.idPurchaseItem === id) {
        resetForm();
      }
    } catch (e) {
      setError(t("purchaseItems.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Form */}
      <div className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.purchase")}:</label>
            <input className={styles["form-input"]} value={purchase.invoiceNumber || purchase.id} disabled />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Tipo de Item:</label>
            <select
              className={styles["form-input"]}
              value={itemType}
              onChange={e => {
                const newType = e.target.value as ItemType;
                setItemType(newType);
                // Clear previous selections
                if (newType === 'product') {
                  setForm(prev => ({ ...prev, rawMaterialId: undefined }));
                  setSelectedItemName("");
                } else {
                  setForm(prev => ({ ...prev, productId: undefined }));
                  setSelectedItemName("");
                }
              }}
              disabled={!editing}
            >
              <option value="product">Produto (Revenda)</option>
              <option value="rawMaterial">Matéria Prima</option>
            </select>
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>
              {itemType === 'product' ? t("purchaseItems.product") : 'Matéria Prima'}:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className={styles["form-input"]}
                value={selectedItemName || (form.productId ? `ID: ${form.productId}` : form.rawMaterialId ? `ID: ${form.rawMaterialId}` : "")}
                disabled={true}
                placeholder={itemType === 'product' ? "Nenhum produto selecionado" : "Nenhuma matéria prima selecionada"}
                style={{ flex: 1, backgroundColor: '#f8f9fa', color: '#495057' }}
              />
              {editing && (
                <button
                  type="button"
                  className={styles["button-search"]}
                  onClick={() => {
                    if (itemType === 'product') {
                      setIsProductDialogOpen(true);
                    } else {
                      setIsRawMaterialDialogOpen(true);
                    }
                  }}
                  title={itemType === 'product' ? "Pesquisar produto" : "Pesquisar matéria prima"}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  🔍
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.unitType")}:</label>
            <select
              name="unitType"
              value={form.unitType || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
              required
            >
              <option value="">{t("buttons.select")}</option>
              {Object.values(UnitType).map((unit) => (
                <option key={unit} value={unit}>
                  {t('unitType.' + unit, { ns: 'enums', defaultValue: unit })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.quantity")}:</label>
            <input
              ref={firstInputRef}
              type="number"
              name="quantity"
              step="0.01"
              min="0"
              value={form.quantity ?? 0}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.unitPrice")}:</label>
            <input
              type="number"
              name="unitPrice"
              step="0.01"
              min="0"
              value={form.unitPrice ?? 0}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>
              {t("purchaseItems.discountPercentage")}:
            </label>
            <input
              type="number"
              name="discountPercentage"
              step="0.01"
              min="0"
              max="100"
              value={form.discountPercentage ?? 0}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Desconto Total (R$):</label>
            <input
              type="number"
              name="totalDiscountItem"
              step="0.01"
              value={computedTotal.totalDiscountItem}
              className={styles["form-input"]}
              disabled
              style={{ backgroundColor: '#fff3cd', color: '#856404', fontWeight: 'bold' }}
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.totalItemValue")}:</label>
            <input
              type="number"
              name="totalItemValue"
              step="0.01"
              value={computedTotal.totalItemValue}
              className={styles["form-input"]}
              disabled
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("purchaseItems.itemObservation")}:</label>
            <input
              name="itemObservation"
              value={form.itemObservation || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editing}
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editing ? (
            <>
              <button type="button" className={styles.button} onClick={handleSubmit} disabled={saving}>
                {saving ? t("buttons.saving") : (form.idPurchaseItem ? t("buttons.update") : t("buttons.save"))}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("buttons.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={() => {
                resetForm();
                setEditing(true);
                setTimeout(() => firstInputRef.current?.focus(), 0);
              }}
              disabled={saving}
            >
              {t("buttons.new")}
            </button>
          )}
        </div>

        {success && <p className={styles.success}>{success}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <hr />

      {/* Table */}
      {loading ? (
        <p>{t("buttons.loading")}</p>
      ) : items.length === 0 ? (
        <p>{t("purchaseItems.noItems")}</p>
      ) : (
        <table className={styles["purchase-item-table"]}>
          <thead>
            <tr>
              <th>{t("purchaseItems.product")}</th>
              <th>{t("purchaseItems.unitType")}</th>
              <th>{t("purchaseItems.quantity")}</th>
              <th>{t("purchaseItems.unitPrice")}</th>
              <th>{t("purchaseItems.discountPercentage")}</th>
              <th>{t("purchaseItems.totalItemValue")}</th>
              <th>{t("buttons.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.idPurchaseItem}
                className={styles["clickable-row"]}
                onDoubleClick={() => {
                  onDoubleClickPurchase?.(purchase);
                }}
                title={t("purchases.doubleClickToSelect")}
              >
                <td>{it.productName || products.find(p => p.id === it.productId)?.name || it.productId}</td>
                <td>{it.unitType ? t('unitType.' + it.unitType, { ns: 'enums', defaultValue: it.unitType }) : t("buttons.noData")}</td>
                <td>{Number(it.quantity || 0).toFixed(2)}</td>
                <td>${Number(it.unitPrice || 0).toFixed(2)}</td>
                <td>{Number(it.discountPercentage || 0).toFixed(2)}</td>
                <td>${Number(it.totalItemValue || 0).toFixed(2)}</td>
                <td>
                  <button className={styles["button-editar"]} onClick={() => handleEdit(it)} disabled={loading}>
                    {t("buttons.edit")}
                  </button>
                  <button className={styles["button-excluir"]} onClick={() => handleDelete(it.idPurchaseItem)} disabled={loading}>
                    {t("buttons.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ProductSearchDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSelect={handleProductSelect}
      />

      <RawMaterialSearchDialog
        isOpen={isRawMaterialDialogOpen}
        onClose={() => setIsRawMaterialDialogOpen(false)}
        onSelect={handleRawMaterialSelect}
      />
    </div>
  );
}
