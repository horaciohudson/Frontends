import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/products/Product.module.css";

// ✅ usa o tipo e a lista centralizada
import { PackagingType, packagingTypes, packagingI18nKey } from "../../enums/packagingTypes";
import { ProductFormModel } from "../../models/Product";

interface Option { id: number; name: string; }
interface SupplierOption { id: string; name: string; }

interface ProductProps {
  onSelectProduct?: (product: ProductFormModel | null) => void;
  onDoubleClickProduct?: (product: ProductFormModel) => void;
}

// ---------- helpers ----------
const takeList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.content ?? []);

const mapProductFromApi = (p: any): ProductFormModel => {
  console.log("🗺️ Mapeando produto da API:", p);
  console.log("🆔 ID original:", p.id, "tipo:", typeof p.id);

  const mapped = {
    id: p.id ? String(p.id) : null, // Keep as string (UUID)
    name: p.name || "",
    reference: p.reference ?? null,
    technicalReference: p.technicalReference ?? null,
    warrantyMonths: Number(p.warrantyMonths) || 0,
    packaging: (p.packaging as PackagingType) || "",

    productCategoryId: Number(p.categoryId) || 0,
    productCategoryName: p.categoryName || "",
    productSubcategoryId: Number(p.subCategoryId) || 0, // DTO uses subCategoryId
    productSubcategoryName: p.subCategoryName || "",
    productSizeId: Number(p.sizeId) || 0,
    productSizeName: p.sizeName || "",

    supplierId: p.supplierId ? String(p.supplierId) : "",
    supplierName: p.supplierName || "",
  };

  console.log("✅ Produto mapeado:", mapped);
  console.log("🆔 ID mapeado:", mapped.id, "tipo:", typeof mapped.id);

  return mapped;
};

const mapCategory = (c: any): Option => ({
  id: Number(c.id) || 0,
  name: c.name || c.nome || ""
});
const mapSubcategory = (s: any): Option => ({
  id: Number(s.id) || 0,
  name: s.name || s.nome || ""
});
const mapSize = (sz: any): Option => ({
  id: Number(sz.id || sz.idTamanho) || 0,
  name: sz.size || sz.tamanho || ""
});
const mapSupplier = (s: any): SupplierOption => ({
  id: String(s.id || ""),
  name: String(s.name || s.tradeName || s.corporateName || "").trim(),
});

const initialProduct: ProductFormModel = {
  id: null, // Agora é string | null
  name: "",
  reference: "",
  technicalReference: "",
  warrantyMonths: 0,
  packaging: "",

  productCategoryId: 0,
  productCategoryName: "",
  productSubcategoryId: 0,
  productSubcategoryName: "",
  productSizeId: 0,
  productSizeName: "",

  supplierId: "",
  supplierName: "",
};

export default function Product({ onSelectProduct, onDoubleClickProduct }: ProductProps = {}) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  const [products, setProducts] = useState<ProductFormModel[]>([]);
  const [form, setForm] = useState<ProductFormModel>(initialProduct);

  const [categories, setCategories] = useState<Option[]>([]);
  const [subcategories, setSubcategories] = useState<Option[]>([]);
  const [sizes, setSizes] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadProducts = async () => {
    console.log("📦 Carregando produtos da API...");
    const res = await api.get("/products");
    console.log("📊 Resposta da API /products:", res.data);

    const rawProducts = takeList<any>(res.data);
    console.log("📋 Produtos brutos:", rawProducts);
    console.log("🔍 Primeiro produto bruto:", rawProducts[0]);

    const mappedProducts = rawProducts.map(mapProductFromApi);
    console.log("🗺️ Produtos mapeados:", mappedProducts);
    console.log("🔍 Primeiro produto mapeado:", mappedProducts[0]);

    setProducts(mappedProducts);
  };
  const loadCategories = async () => {
    try {
      console.log("🔍 Loading categories...");
      const res = await api.get("/product-categories");
      console.log("📦 Categories API response:", res.data);
      const categoriesList = takeList<any>(res.data).map(mapCategory);
      console.log("📋 Categories mapped:", categoriesList);
      setCategories(categoriesList);
    } catch (error) {
      console.error("❌ Error loading categories with /product-categories:", error);
      try {
        // Try with Portuguese endpoint
        const res = await api.get("/produto-categorias");
        console.log("📦 Categories API response (pt):", res.data);
        const categoriesList = takeList<any>(res.data).map(mapCategory);
        console.log("📋 Categories mapped (pt):", categoriesList);
        setCategories(categoriesList);
      } catch (error2) {
        console.error("❌ Error loading categories with /produto-categorias:", error2);
        setCategories([]);
      }
    }
  };
  const loadSuppliers = async () => {
    try {
      console.log("🔍 Loading suppliers from /companies/suppliers endpoint...");
      // Use specific suppliers endpoint
      const res = await api.get("/companies/suppliers");
      console.log("📦 Suppliers API response:", res.data);

      const suppliersList = takeList<any>(res.data).map(mapSupplier);

      console.log("🏢 Suppliers loaded:", suppliersList);
      setSuppliers(suppliersList);
    } catch (error) {
      console.error("❌ Error loading suppliers from /companies/suppliers:", error);
      setSuppliers([]);
    }
  };
  const loadSubcategories = async (categoryId: number) => {
    if (!categoryId) { setSubcategories([]); return; }
    try {
      console.log("🔍 Loading subcategories for category:", categoryId);
      const res = await api.get(`/product-subcategories?categoryId=${categoryId}`);
      console.log("📦 Subcategories API response:", res.data);
      const subcategoriesList = takeList<any>(res.data).map(mapSubcategory);
      console.log("📂 Subcategories mapped:", subcategoriesList);
      setSubcategories(subcategoriesList);
    } catch (error) {
      console.error("❌ Error loading subcategories with /product-subcategories:", error);
      try {
        // Try with Portuguese endpoint
        const res = await api.get(`/produto-subcategorias?categoriaId=${categoryId}`);
        console.log("📦 Subcategories API response (pt):", res.data);
        const subcategoriesList = takeList<any>(res.data).map(mapSubcategory);
        console.log("📂 Subcategories mapped (pt):", subcategoriesList);
        setSubcategories(subcategoriesList);
      } catch (error2) {
        console.error("❌ Error loading subcategories with /produto-subcategorias:", error2);
        setSubcategories([]);
      }
    }
  };
  const loadSizes = async (subCategoryId: number) => {
    if (!subCategoryId) { setSizes([]); return; }
    console.log("🔍 Loading sizes for subcategory:", subCategoryId);
    try {
      // Try first with English default
      const res = await api.get(`/product-sizes?subCategoryId=${subCategoryId}`);
      console.log("📦 Sizes API response:", res.data);
      const sizesList = takeList<any>(res.data).map(mapSize);
      console.log("📏 Sizes mapped:", sizesList);
      setSizes(sizesList);
    } catch (error) {
      console.error("❌ Error loading sizes with /product-sizes:", error);
      try {
        // Try with Portuguese default
        const res = await api.get(`/produtos-tamanhos?subcategoriaId=${subCategoryId}`);
        console.log("📦 Sizes API response (pt):", res.data);
        const sizesList = takeList<any>(res.data).map(mapSize);
        console.log("📏 Sizes mapped (pt):", sizesList);
        setSizes(sizesList);
      } catch (error2) {
        console.error("❌ Error loading sizes with /produtos-tamanhos:", error2);
        setSizes([]);
      }
    }
  };

  // initial
  useEffect(() => {
    (async () => {
      await Promise.all([loadProducts(), loadCategories(), loadSuppliers()]);
      // packaging default (independent)
      setForm(prev => ({ ...prev, packaging: prev.packaging || "" }));
    })().catch(console.error);
  }, []);

  // cascade category -> subcategory
  useEffect(() => {
    if (form.productCategoryId > 0) {
      loadSubcategories(form.productCategoryId);
      setForm((prev) => ({
        ...prev,
        productSubcategoryId: 0,
        productSubcategoryName: "",
        productSizeId: 0,
        productSizeName: "",
      }));
      setSizes([]);
    } else {
      setSubcategories([]);
      setSizes([]);
      setForm((prev) => ({
        ...prev,
        productSubcategoryId: 0,
        productSubcategoryName: "",
        productSizeId: 0,
        productSizeName: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.productCategoryId]);

  // cascade subcategory -> size (packaging is independent)
  useEffect(() => {
    if (form.productSubcategoryId > 0) {
      loadSizes(form.productSubcategoryId);
      setForm(prev => ({ ...prev, productSizeId: 0, productSizeName: "" }));
    } else {
      setSizes([]);
      setForm(prev => ({ ...prev, productSizeId: 0, productSizeName: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.productSubcategoryId]);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next: any = {
        ...prev,
        [name]:
          name === "productCategoryId" ||
            name === "productSubcategoryId" ||
            name === "productSizeId" ||
            name === "warrantyMonths"
            ? Number(value) || 0
            : value,
      };

      if (name === "productCategoryId") {
        const sel = categories.find((c) => c.id === Number(value));
        next.productCategoryName = sel?.name || "";
      } else if (name === "productSubcategoryId") {
        const sel = subcategories.find((s) => s.id === Number(value));
        next.productSubcategoryName = sel?.name || "";
      } else if (name === "productSizeId") {
        const sel = sizes.find((s) => s.id === Number(value));
        next.productSizeName = sel?.name || "";
      } else if (name === "supplierId") {
        const sel = suppliers.find((s) => s.id === value);
        next.supplierName = sel?.name || "";
      } else if (name === "packaging") {
        // keep only valid enum values or empty string
        if (value && !packagingTypes.includes(value as PackagingType)) {
          next.packaging = "";
        }
      }

      return next;
    });
  };

  const handleNew = () => {
    setForm({
      ...initialProduct,
      packaging: "",
    });
    setSubcategories([]);
    setSizes([]);
    setEditingMode(true);
    setError(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = async (p: ProductFormModel) => {
    setForm(p);
    setEditingMode(true);
    setError(null);
    if (p.productCategoryId) await loadSubcategories(p.productCategoryId);
    if (p.productSubcategoryId) await loadSizes(p.productSubcategoryId);

    // ensure packaging is within the centralized enum
    setForm(prev => ({
      ...prev,
      packaging: packagingTypes.includes(p.packaging as PackagingType)
        ? p.packaging
        : "",
    }));

    // Chama a função onSelectProduct se fornecida
    onSelectProduct?.(p);

    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("products.confirmDelete"))) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((x) => x.id !== id));
      if (form.id === id) resetForm();
    } catch {
      setError(t("products.deleteError"));
    }
  };

  const validate = (): string | null => {
    console.log("🔍 Validating form:", {
      name: form.name.trim(),
      productCategoryId: form.productCategoryId,
      productSubcategoryId: form.productSubcategoryId,
      supplierId: form.supplierId,
      supplierIdValid: form.supplierId > 0,
      packaging: form.packaging
    });

    if (!form.name.trim()) return t("products.nameRequired");
    if (!form.productCategoryId) return t("products.categoryRequired");
    if (!form.productSubcategoryId) return t("products.subcategoryRequired");
    if (!form.supplierId || form.supplierId.trim() === "") return t("products.supplierRequired");
    if (!form.packaging) return t("products.packagingRequired");
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }

    const payload = {
      id: form.id,
      name: form.name,
      reference: form.reference || null,
      technicalReference: form.technicalReference || null,
      warrantyMonths: form.warrantyMonths || 0,
      packaging: form.packaging || null,

      categoryId: form.productCategoryId || null,
      categoryName: form.productCategoryName || null,
      subCategoryId: form.productSubcategoryId || null, // matches DTO
      subCategoryName: form.productSubcategoryName || null,

      sizeId: form.productSizeId || null,
      sizeName: form.productSizeName || null,

      ...(form.supplierId && form.supplierId.trim() !== "" ? { supplierId: form.supplierId } : {}),
      ...(form.supplierName ? { supplierName: form.supplierName } : {}),
    };

    console.log("🔍 Payload construction:", {
      originalSupplierId: form.supplierId,
      supplierIdIncluded: form.supplierId && form.supplierId.trim() !== "",
      finalPayload: payload,
      supplierIdInPayload: payload.supplierId
    });

    // Validate payload before sending
    console.log("🔍 Payload validation:", {
      hasId: !!payload.id,
      hasName: !!payload.name,
      hasCategoryId: !!payload.categoryId,
      hasSubCategoryId: !!payload.subCategoryId,
      hasSupplierId: !!payload.supplierId,
      hasPackaging: !!payload.packaging,
      payloadKeys: Object.keys(payload),
      payloadValues: Object.values(payload)
    });

    try {
      setSaving(true);
      console.log("📤 Sending payload to backend:", payload);
      console.log("🔍 Form state before save:", {
        supplierId: form.supplierId,
        supplierName: form.supplierName,
        suppliers: suppliers,
        supplierIdType: typeof form.supplierId,
        supplierIdValid: form.supplierId && form.supplierId.trim() !== ""
      });
      console.log("🏢 Available suppliers in state:", suppliers);
      console.log("🔍 Selected supplier details:", suppliers.find(s => s.id === form.supplierId));
      console.log("🔍 Supplier ID being sent:", form.supplierId);
      console.log("🔍 Supplier exists in state:", suppliers.some(s => s.id === form.supplierId));

      const url = form.id ? `/products/${form.id}` : "/products";
      const res = form.id ? await api.put(url, payload) : await api.post(url, payload);
      const saved = mapProductFromApi(res.data);

      setProducts((prev) => (form.id ? prev.map((x) => (x.id === form.id ? saved : x)) : [...prev, saved]));
      resetForm();
    } catch (error: any) {
      console.error("❌ Error saving product:", error);
      console.log("🔍 Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });

      // Log complete error response for debugging
      if (error.response) {
        console.log("📡 Full error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      let errorMessage = t("products.saveError");

      // Handle specific supplier error
      if (error.response?.status === 400 &&
        error.response?.data?.message?.includes("Supplier not found")) {
        errorMessage = t("products.supplierNotFound") || "Supplier not found. Please select a valid supplier.";
      }

      // Handle 500 internal server error
      if (error.response?.status === 500) {
        errorMessage = `Internal server error: ${error.response?.data?.message || error.message}`;
        console.error("🚨 500 Internal Server Error - Check backend logs");
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      ...initialProduct,
      packaging: "",
    });
    setSubcategories([]);
    setSizes([]);
    setEditingMode(false);
    setError(null);
  };

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      <form onSubmit={handleSave}>
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.name")}:</label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.reference")}:</label>
            <input
              type="text"
              name="reference"
              value={form.reference ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.technicalReference")}:</label>
            <input
              type="text"
              name="technicalReference"
              value={form.technicalReference ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.category")}:</label>
            <select
              name="productCategoryId"
              value={form.productCategoryId}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value={0}>{t("products.select")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.subcategory")}:</label>
            <select
              name="productSubcategoryId"
              value={form.productSubcategoryId}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode || !form.productCategoryId}
              required
            >
              <option value={0}>{t("products.select")}</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.size")}:</label>
            <select
              name="productSizeId"
              value={form.productSizeId}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode || !form.productSubcategoryId}
            >
              <option value={0}>{t("products.select")}</option>
              {sizes.map((sz) => (
                <option key={sz.id} value={sz.id}>{sz.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.supplier")}:</label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("products.select")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.packaging")}:</label>
            <select
              name="packaging"
              value={form.packaging}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode || packagingTypes.length === 0}
              required
            >
              <option value="">{t("products.select")}</option>
              {packagingTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`enums:packagingTypes.${opt}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{t("products.warrantyMonths")}:</label>
            <input
              type="number"
              min={0}
              name="warrantyMonths"
              value={form.warrantyMonths || 0}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={saving}>
                {form.id ? t("products.update") : t("products.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {t("products.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {t("products.newProduct")}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["product-table"]}>
        <thead>
          <tr>
            <th>{t("products.name")}</th>
            <th>{t("products.category")}</th>
            <th>{t("products.subcategory")}</th>
            <th>{t("products.technicalReference")}</th>
            <th>{t("products.supplier")}</th>
            <th>{t("products.warrantyMonths")}</th>
            <th>{t("products.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id ?? `no-id-${p.name}`}
              className={styles["clickable-row"]}
              onDoubleClick={() => onDoubleClickProduct?.(p)}
              title={t("products.doubleClickToSelect")}
            >
              <td>{p.name}</td>
              <td>{p.productCategoryName}</td>
              <td>{p.productSubcategoryName}</td>
              <td>{p.technicalReference || "-"}</td>
              <td>{p.supplierName}</td>
              <td>{p.warrantyMonths ? `${p.warrantyMonths} meses` : "-"}</td>
              <td>
                <button
                  className={styles["button-edit"]}
                  onClick={() => handleEdit(p)}
                >
                  {t("products.edit")}
                </button>
                <button
                  className={styles["button-delete"]}
                  onClick={() => handleDelete(p.id)}
                >
                  {t("products.delete")}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
