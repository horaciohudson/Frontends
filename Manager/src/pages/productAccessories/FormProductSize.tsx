import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { ProductSize } from "../../models/ProductSize";
import { ProductSubcategory } from "../../models/ProductSubcategory";
import { Size } from "../../models/Size";
import { SizeService } from "../../service/Size";
import api from "../../service/api";
import styles from "../../styles/productAccessories/FormProductSize.module.css";

interface Props {
  subcategory: ProductSubcategory;
  onSelectSize?: (size: ProductSize) => void;
  onDoubleClickSize?: (size: ProductSize) => void;
}

// ---------- helpers ----------
const takeList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.content ?? []);

const mapSizeFromApi = (item: any): ProductSize => ({
  id: Number(item.product_size_id || item.productSizeId || item.id) || null,
  size: item.size || item.tamanho || "",
  productSubcategoryId: Number(item.product_sub_category_id || item.productSubcategoryId || item.idProdutoSubCategoria) || undefined,
  productId: Number(item.productId) || undefined,
  stock: Number(item.stock) || 0,
});

const initialSize: ProductSize = {
  id: null,
  size: "",
  productSubcategoryId: undefined,
  productId: undefined,
  stock: 0,
};

export default function FormProductSize({ subcategory, onSelectSize, onDoubleClickSize }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  // Validação inicial da subcategoria
  console.log("🔍 Debug - FormProductSize renderizado com subcategory:", subcategory);
  console.log("🔍 Debug - subcategory.id:", subcategory?.id);
  console.log("🔍 Debug - typeof subcategory.id:", typeof subcategory?.id);

  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [form, setForm] = useState<ProductSize>(initialSize);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sizeRef = useRef<HTMLSelectElement>(null);

  // ---- loads ----
  const loadAvailableSizes = async () => {
    try {
      console.log("📏 Carregando tamanhos disponíveis...");
      const sizesList = await SizeService.getAll();
      console.log("✅ Tamanhos disponíveis carregados:", sizesList);
      setAvailableSizes(sizesList.filter(s => s.active !== false));
    } catch (error) {
      console.error("❌ Erro ao carregar tamanhos disponíveis:", error);
      setAvailableSizes([]);
    }
  };

  const loadSizes = async () => {
    console.log("🔍 Debug - loadSizes chamado com subcategory:", subcategory);
    console.log("🔍 Debug - subcategory.id:", subcategory?.id);
    console.log("🔍 Debug - typeof subcategory.id:", typeof subcategory?.id);
    
    if (!subcategory?.id || typeof subcategory.id !== 'number' || isNaN(subcategory.id) || subcategory.id <= 0) {
      console.error("❌ Erro: subcategory.id inválido no loadSizes:", subcategory?.id);
      console.log(t("productAccessories.logs.noSubcategoryId"));
      return;
    }
    
    try {
      console.log(t("productAccessories.logs.loadingSizes"), subcategory.id);
      const res = await api.get(`/product-sizes?subCategoryId=${subcategory.id}`);    
              console.log(t("productAccessories.logs.apiResponse"), res.data);
      const sizesList = takeList<any>(res.data).map(mapSizeFromApi);   
              console.log(t("productAccessories.logs.sizesMapped"), sizesList);
      setSizes(sizesList);
    } catch (error) {
              console.error(t("productAccessories.logs.loadError"), error);
      setSizes([]);
    }
  };

  // initial
  useEffect(() => {
    // Carregar tamanhos disponíveis sempre
    loadAvailableSizes();
  }, []);

  useEffect(() => {
    console.log("🔍 Debug - useEffect executado com subcategory:", subcategory);
    console.log("🔍 Debug - useEffect subcategory.id:", subcategory?.id);
    console.log("🔍 Debug - useEffect subcategory:", subcategory);
    
    if (subcategory?.id && typeof subcategory.id === 'number' && !isNaN(subcategory.id)) {
      console.log("🔍 Debug - Chamando loadSizes...");
      loadSizes();
    } else {
      console.log("🔍 Debug - subcategory.id não é válido, não carregando tamanhos");
      console.log("🔍 Debug - subcategory.id:", subcategory?.id);
      console.log("🔍 Debug - typeof subcategory.id:", typeof subcategory?.id);
      console.log("🔍 Debug - isNaN(subcategory.id):", subcategory?.id ? isNaN(subcategory.id) : 'N/A');
    }
  }, [subcategory?.id]);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.size.trim()) return t("productAccessories.sizeRequired");
    if (!subcategory?.id) return t("productAccessories.subcategoryRequired");
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { 
      setError(msg); 
      return; 
    }

    // Validação adicional para garantir que productSubcategoryId não seja null
    if (!subcategory.id) {
      console.error("❌ Erro: subcategory.id é falsy:", subcategory.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }
    
    // Validação adicional para garantir que productSubcategoryId seja um número válido
    if (typeof subcategory.id !== 'number' || isNaN(subcategory.id)) {
      console.error("❌ Erro: subcategory.id não é um número válido:", subcategory.id, typeof subcategory.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }
    
    // Validação adicional para garantir que productSubcategoryId seja positivo
    if (subcategory.id <= 0) {
      console.error("❌ Erro: subcategory.id não é positivo:", subcategory.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Payload com nomenclatura correta para o backend
      const payload = { 
        size: form.size.trim(),
        productSubCategoryId: subcategory.id, // Campo obrigatório (com C maiúsculo)
        stock: form.stock || 0
      };
      
      console.log("🔍 Debug - Payload completo:", payload);
      console.log("🔍 Debug - payload.productSubCategoryId:", payload.productSubCategoryId);
      console.log("🔍 Debug - typeof payload.productSubCategoryId:", typeof payload.productSubCategoryId);
      console.log("🔍 Debug - payload.productSubCategoryId === null:", payload.productSubCategoryId === null);
      console.log("🔍 Debug - payload.productSubCategoryId === undefined:", payload.productSubCategoryId === undefined);
      console.log("🔍 Debug - payload.productSubCategoryId === 0:", payload.productSubCategoryId === 0);
      console.log("🔍 Debug - payload.productSubCategoryId > 0:", payload.productSubCategoryId > 0);
      
      console.log(t("productAccessories.logs.payloadSending"), payload);
      console.log(t("productAccessories.logs.subcategoryId"), subcategory.id);
     
      const url = form.id ? `/product-sizes/${form.id}` : "/product-sizes";
      console.log(t("productAccessories.logs.requestUrl"), url);
      console.log("🔍 Debug - Enviando requisição para:", url);
      console.log("🔍 Debug - Método:", form.id ? "PUT" : "POST");
      console.log("🔍 Debug - Payload final:", JSON.stringify(payload, null, 2));
      
      const res = form.id ? await api.put(url, payload) : await api.post(url, payload);
      console.log(t("productAccessories.logs.apiResponseSave"), res.data);
      
      const saved = mapSizeFromApi(res.data);
      console.log(t("productAccessories.logs.sizeSaved"), saved);
      console.log("🔍 Debug - Tamanho salvo com sucesso:", saved);
      console.log("🔍 Debug - saved.productSubCategoryId:", saved.productSubcategoryId);
      console.log("🔍 Debug - saved.id:", saved.id);

      setSizes((prev) => 
        form.id ? prev.map((s) => (s.id === form.id ? saved : s)) : [...prev, saved]
      );

      resetForm();
              setSuccessMessage(t("productAccessories.sizeSaveSuccess"));
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error("❌ Erro ao salvar tamanho:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        payload: { size: form.size, productSubCategoryId: subcategory.id, stock: form.stock },
        subcategory: subcategory,
        subcategoryId: subcategory.id,
        subcategoryIdType: typeof subcategory.id
      });
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Erro desconhecido";
      setError(`Erro ao salvar tamanho: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    console.log("🔍 Debug - handleNew chamado com subcategory:", subcategory);
    console.log("🔍 Debug - subcategory.id:", subcategory?.id);
    
    if (!subcategory?.id || typeof subcategory.id !== 'number' || isNaN(subcategory.id) || subcategory.id <= 0) {
      console.error("❌ Erro: subcategory.id inválido no handleNew:", subcategory?.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }
    
    setForm({
      ...initialSize,
      productSubcategoryId: subcategory.id
    });
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => sizeRef.current?.focus(), 0);
  };

  const handleEdit = (size: ProductSize) => {
    console.log("🔍 Debug - handleEdit chamado com size:", size);
    console.log("🔍 Debug - subcategory.id:", subcategory?.id);
    
    if (!subcategory?.id || typeof subcategory.id !== 'number' || isNaN(subcategory.id) || subcategory.id <= 0) {
      console.error("❌ Erro: subcategory.id inválido no handleEdit:", subcategory?.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }
    
    setForm({
      ...size,
      productSubcategoryId: subcategory.id
    });
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => sizeRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm(t("productAccessories.sizeConfirmDelete"))) return;
    
    try {
              console.log(t("productAccessories.logs.deletingSize"), id);
        await api.delete(`/product-sizes/${id}`);
        console.log(t("productAccessories.logs.sizeDeleted"));
      
      setSizes((prev) => prev.filter((s) => s.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch (err: any) {
              console.error(t("productAccessories.logs.deleteError"), err);
        setError(t("productAccessories.sizeDeleteError"));
    }
  };

  const resetForm = () => {
    console.log("🔍 Debug - resetForm chamado com subcategory:", subcategory);
    console.log("🔍 Debug - subcategory.id:", subcategory?.id);
    
    if (!subcategory?.id || typeof subcategory.id !== 'number' || isNaN(subcategory.id) || subcategory.id <= 0) {
      console.error("❌ Erro: subcategory.id inválido no resetForm:", subcategory?.id);
      setError(t("productAccessories.subcategoryRequired"));
      return;
    }
    
    setForm({
      ...initialSize,
      productSubcategoryId: subcategory.id
    });
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Verificar se subcategory.id existe antes de renderizar
  if (!subcategory?.id || typeof subcategory.id !== 'number' || isNaN(subcategory.id) || subcategory.id <= 0) {
    console.error("❌ Erro: subcategory.id inválido no render:", subcategory?.id);
    return (
      <div className={styles.container}>
        <p className={styles.error}>{t("productAccessories.noSubcategorySelected")}</p>
        <p className={styles.error}>ID da subcategoria: {subcategory?.id} (tipo: {typeof subcategory?.id})</p>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className={styles["productSize-form"]}>
      <form onSubmit={handleSave}>
        <div className={styles["productSize-form-row"]}>
          <div className={styles["productSize-form-col"]}>
            <label className={styles["productSize-form-label"]}>{t("productAccessories.size")}:</label>
            <select
              ref={sizeRef}
              name="size"
              value={form.size}
              onChange={handleChange}
              className={styles["productSize-form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">Selecione um tamanho...</option>
              {availableSizes.map((size) => (
                <option key={size.id} value={size.name}>
                  {size.name} {size.description ? `- ${size.description}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className={styles["productSize-form-col"]}>
            <label className={styles["productSize-form-label"]}>{t("productAccessories.stock")}:</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className={styles["productSize-form-input"]}
              disabled={!editingMode}
              min="0"
              step="1"
            />
          </div>
        </div>

         <div className={styles["productSize-form-actions"]}>
           {editingMode ? (
             <>
               <button type="submit" className={styles["productSize-button"]} disabled={saving}>
                 {form.id ? t("productAccessories.update") : t("productAccessories.save")}
               </button>
               <button
                 type="button"
                 className={`${styles["productSize-button"]} ${styles.cancel}`}
                 onClick={resetForm}
                 disabled={saving}
               >
                 {t("productAccessories.cancel")}
               </button>
             </>
           ) : (
             <button
               type="button"
               className={styles["productSize-button-new"]}
               onClick={handleNew}
             >
               {t("productAccessories.new")}
             </button>
           )}
         </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["productSize-table"]}>
        <thead>
          <tr>
            <th>{t("productAccessories.size")}</th>
            <th>{t("productAccessories.stock")}</th>
            <th>{t("productAccessories.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr 
              key={size.id ?? `temp-${size.size}`}
              onClick={() => onSelectSize?.(size)}
              onDoubleClick={() => onDoubleClickSize?.(size)}
              style={{ cursor: onDoubleClickSize ? 'pointer' : 'default' }}
            >
              <td>{size.size}</td>
              <td>{size.stock}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita conflito com onClick da linha
                    handleEdit(size);
                  }}
                >
                  {t("productAccessories.edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita conflito com onClick da linha
                    handleDelete(size.id);
                  }}
                >
                  {t("productAccessories.delete")}
                </button>
              </td>
            </tr>
          ))}
          {sizes.length === 0 && (
            <tr>
              <td colSpan={3}>{t("common.noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
