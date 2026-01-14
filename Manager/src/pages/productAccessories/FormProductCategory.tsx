import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/productAccessories/FormProductCategory.module.css";

export interface ProductCategory {
  id: number | null;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface FormProductCategoryProps {
  onSelectCategory: (category: ProductCategory | null) => void;
  onDoubleClickCategory?: (category: ProductCategory) => void;
}

// ---------- helpers ----------
const takeList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.content ?? []);

const mapCategoryFromApi = (c: any): ProductCategory => ({
  id: Number(c.id) || null,
  name: c.name || "",
  createdAt: c.createdAt ?? null,
  updatedAt: c.updatedAt ?? null,
});

const initialCategory: ProductCategory = {
  id: null,
  name: "",
};

export default function FormProductCategory({ onSelectCategory, onDoubleClickCategory }: FormProductCategoryProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [form, setForm] = useState<ProductCategory>(initialCategory);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadCategories = async () => {
    try {
      console.log("🔍 Carregando categorias...");
      const res = await api.get("/product-categories");
      console.log("📦 Resposta da API de categorias:", res.data);
      const categoriesList = takeList<any>(res.data).map(mapCategoryFromApi);
      console.log("📋 Categorias mapeadas:", categoriesList);
      setCategories(categoriesList);
    } catch (error) {
      console.error("❌ Erro ao carregar categorias:", error);
      try {
        // Tentando com o endpoint em português
        const res = await api.get("/produto-categorias");
        console.log("📦 Resposta da API de categorias (pt):", res.data);
        const categoriesList = takeList<any>(res.data).map(mapCategoryFromApi);
        console.log("📋 Categorias mapeadas (pt):", categoriesList);
        setCategories(categoriesList);
      } catch (error2) {
        console.error("❌ Erro ao carregar categorias com /produto-categorias:", error2);
        setCategories([]);
      }
    }
  };

  // initial
  useEffect(() => {
    loadCategories();
  }, []);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return t("productAccessories.nameRequired");
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

      const payload = { name: form.name.trim() };
      console.log("📤 Enviando payload para o backend:", payload);

      const url = form.id ? `/product-categories/${form.id}` : "/product-categories";
      const res = form.id ? await api.put(url, payload) : await api.post(url, payload);
      const saved = mapCategoryFromApi(res.data);

      setCategories((prev) => 
        form.id ? prev.map((c) => (c.id === form.id ? saved : c)) : [...prev, saved]
      );

      resetForm();
      onSelectCategory(saved);
              setSuccessMessage(t("productAccessories.saveSuccess"));
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error("❌ Erro ao salvar categoria:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
              setError(t("productAccessories.saveError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setForm(initialCategory);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    onSelectCategory(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = (category: ProductCategory) => {
    setForm(category);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    onSelectCategory(category);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productAccessories.confirmDelete"))) return;
    
    try {
      await api.delete(`/product-categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (form.id === id) {
        resetForm();
      }
      onSelectCategory(null);
    } catch (err: any) {
              setError(t("productAccessories.deleteError"));
    }
  };

  const resetForm = () => {
    setForm(initialCategory);
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
    onSelectCategory(null);
  };

  // ---------- RENDER ----------
  return (
    <div className={styles["productCategory-form"]}>
      <form onSubmit={handleSave}>
        <div className={styles["productCategory-form-row"]}>
          <div className={styles["productCategory-form-col"]}>
            <label className={styles["productCategory-form-label"]}>{t("productAccessories.name")}:</label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["productCategory-form-input"]}
              disabled={!editingMode}
              required
              maxLength={80}
            />
          </div>
        </div>

        <div className={styles["productCategory-form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles["productCategory-button"]} disabled={saving}>
                {form.id ? t("productAccessories.update") : t("productAccessories.save")}
              </button>
              <button
                type="button"
                className={`${styles["productCategory-button"]} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("productAccessories.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["productCategory-button-new"]}
              onClick={handleNew}
            >
              {t("productAccessories.new")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["productCategory-table"]}>
        <thead>
          <tr>
            <th>{t("productAccessories.name")}</th>
            <th>{t("productAccessories.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr 
              key={category.id ?? `temp-${category.name}`}
              onDoubleClick={() => {
                onSelectCategory(category);
                onDoubleClickCategory?.(category);
              }}
              style={{ cursor: 'pointer' }}
              title={t("productAccessories.doubleClickToSelect") || "Duplo clique para selecionar e avançar"}
            >
              <td>{category.name}</td>
              <td>
                <button
                  onClick={() => handleEdit(category)}
                >
                  {t("productAccessories.edit")}
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                >
                  {t("productAccessories.delete")}
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={2}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
