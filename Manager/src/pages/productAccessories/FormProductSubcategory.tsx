import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { ProductSubcategory } from "../../models/ProductSubcategory";
import { ProductCategory } from "../../models/ProductCategory";
import api from "../../service/api";
import styles from "../../styles/productAccessories/FormProductSubcategory.module.css";

interface Props {
  category: ProductCategory;
  onSelectSubcategory: (subcategory: ProductSubcategory) => void;
  onDoubleClickSubcategory?: (subcategory: ProductSubcategory) => void;
}

const takeList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.content ?? []);

const mapSubcategoryFromApi = (item: any): ProductSubcategory => {
  console.log("🔍 Debug - mapSubcategoryFromApi recebeu item:", item);
  console.log("🔍 Debug - item.id:", item.id);
  console.log("🔍 Debug - typeof item.id:", typeof item.id);
  
  const mapped = {
    id: item.id != null ? Number(item.id) : null,
    name: item.name || item.nome || "",
  };
  
  console.log("🔍 Debug - mapped result:", mapped);
  return mapped;
};

const initialSubcategory: ProductSubcategory = {
  id: null,
  name: "",
};

export default function FormProductSubcategory({ category, onSelectSubcategory, onDoubleClickSubcategory }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [form, setForm] = useState<ProductSubcategory>(initialSubcategory);
  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  const loadSubcategories = async () => {
    if (!category?.id) return;
    try {
      const res = await api.get(`/product-subcategories?categoryId=${category.id}`);
      const list = takeList<any>(res.data).map(mapSubcategoryFromApi);
      setSubcategories(list);
    } catch {
      setSubcategories([]);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return t("productAccessories.subcategoryNameRequired");
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload = {
        name: form.name.trim(),
        productCategoryId: category.id,
      };

      const url = form.id ? `/product-subcategories/${form.id}` : "/product-subcategories";
      const res = form.id ? await api.put(url, payload) : await api.post(url, payload);
      const saved = mapSubcategoryFromApi(res.data);

      console.log("🔍 Debug - Subcategoria salva:", saved);
      console.log("🔍 Debug - saved.id:", saved.id);
      console.log("🔍 Debug - typeof saved.id:", typeof saved.id);

      setSubcategories((prev) =>
        form.id ? prev.map((s) => (s.id === form.id ? saved : s)) : [...prev, saved]
      );

      resetForm();
      console.log("🔍 Debug - Chamando onSelectSubcategory com:", saved);
      onSelectSubcategory(saved);
              setSuccessMessage(t("productAccessories.subcategorySaveSuccess"));
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
              setError(t("productAccessories.subcategorySaveError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setForm(initialSubcategory);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = (subcategory: ProductSubcategory) => {
    console.log("🔍 Debug - handleEdit chamado com subcategory:", subcategory);
    console.log("🔍 Debug - subcategory.id:", subcategory.id);
    console.log("🔍 Debug - typeof subcategory.id:", typeof subcategory.id);
    
    setForm(subcategory);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    console.log("🔍 Debug - Chamando onSelectSubcategory no handleEdit com:", subcategory);
    onSelectSubcategory(subcategory);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productAccessories.subcategoryConfirmDelete"))) return;
    try {
      await api.delete(`/product-subcategories/${id}`);
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
      if (form.id === id) resetForm();
    } catch {
              setError(t("productAccessories.subcategoryDeleteError"));
    }
  };

  const resetForm = () => {
    setForm(initialSubcategory);
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className={styles["productSubcategory-form"]}>
      <form onSubmit={handleSave}>
        <div className={styles["productSubcategory-form-row"]}>
          <div className={styles["productSubcategory-form-col"]}>
            <label className={styles["productSubcategory-form-label"]}>{t("productAccessories.name")}:</label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["productSubcategory-form-input"]}
              disabled={!editingMode}
              required
              maxLength={80}
            />
          </div>
        </div>

        <div className={styles["productSubcategory-form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles["productSubcategory-button"]} disabled={saving}>
                {form.id ? t("productAccessories.update") : t("productAccessories.save")}
              </button>
              <button
                type="button"
                className={`${styles["productSubcategory-button"]} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("productAccessories.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["productSubcategory-button-new"]}
              onClick={handleNew}
            >
              {t("productAccessories.new")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["productSubcategory-table"]}>
        <thead>
          <tr>
            <th>{t("productAccessories.name")}</th>
            <th>{t("productAccessories.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((subcategory) => (
            <tr 
              key={subcategory.id ?? `temp-${subcategory.name}`}
              onDoubleClick={() => {
                onSelectSubcategory(subcategory);
                onDoubleClickSubcategory?.(subcategory);
              }}
              style={{ cursor: 'pointer' }}
              title={t("productAccessories.doubleClickToSelect") || "Duplo clique para selecionar e avançar"}
            >
              <td>{subcategory.name}</td>
              <td>
                <button
                  onClick={() => handleEdit(subcategory)}
                >
                  {t("productAccessories.edit")}
                </button>
                <button
                  onClick={() => onSelectSubcategory(subcategory)}
                >
                  {t("productAccessories.select")}
                </button>
                <button
                  onClick={() => handleDelete(subcategory.id)}
                >
                  {t("productAccessories.delete")}
                </button>
              </td>
            </tr>
          ))}
          {subcategories.length === 0 && (
            <tr>
              <td colSpan={2}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
