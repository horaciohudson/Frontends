import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/compositions/FormCompositionItem.module.css";
import { Composition } from "../../models/Composition";
import { CompositionUnitType } from "../../models/CompositionUnitType";
import { CostType } from "../../enums/CostType";
import { RawMaterial } from "../../models/RawMaterial";
import api from "../../service/api";
import { useAuth } from "../../routes/AuthContext";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface CompositionItem {
  id: number | null;
  compositionId: number | null;
  compositionName?: string | null;
  rawMaterialId: number | null;
  description: string;
  quantity: number | null;
  unitType: string | null;
  costType: string | null;
  unitCost: number | null;
  totalCost: number | null;
  serviceCost: number | null;
  percentage: number | null;
  active: boolean;
  // Campos alternativos que o backend pode usar
  rawMaterialUnitCost?: number | null;
  rawMaterialTotalCost?: number | null;
}

interface FormCompositionItemProps {
  composition: Composition;
}

export default function FormCompositionItem({ composition }: FormCompositionItemProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState<CompositionItem>({
    id: null,
    compositionId: composition.id,
    compositionName: composition.name,
    rawMaterialId: null,
    description: "",
    quantity: 1, // Valor padrão para campo obrigatório
    unitType: "UNIT",
    costType: "MATERIAL",
    unitCost: 0, // Valor padrão para campo obrigatório
    totalCost: 0, // Valor padrão para campo obrigatório
    serviceCost: 0, // Valor padrão para campo obrigatório
    percentage: 100, // Valor padrão para campo obrigatório
    active: true,
  });

  const [compositionItems, setCompositionItems] = useState<CompositionItem[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificação de autenticação e permissões
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    // Verifica se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (user.exp < now) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    if (composition.id) {
      loadCompositionItems();
    } else {
      setCompositionItems([]);
    }
    loadRawMaterials();
  }, [composition.id, isAuthenticated, user]);

  const loadRawMaterials = async () => {
    if (!isAuthenticated || !user) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      const res = await api.get("/raw-materials");
      const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
      const mapped: RawMaterial[] = list.map((rm: any) => ({
        rawMaterialId: rm.idRawMaterial ?? rm.rawMaterialId ?? null,
        name: rm.name ?? rm.rawMaterialName ?? "",
        productCategoryId: rm.productCategoryId ?? 0,
        productCategoryName: rm.productCategoryName ?? "",
        supplierId: rm.supplierId ?? rm.supplierCompanyId ?? null,
        supplierName: rm.supplierName ?? rm.supplierCompanyName ?? "",
        reference: rm.reference ?? "",
        location: rm.location ?? "",
        warrantyMonths: rm.warrantyMonths ?? null,
        packaging: rm.packaging || undefined,
      }));
      
      setRawMaterials(mapped);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Acesso negado para raw materials. Verifique suas permissões.");
      } else {
        setError(t("compositions.compositionItem.loadError") + " " + (err.response?.data?.message || err.message));
      }
    }
  };

  const loadCompositionItems = async () => {
    if (!composition.id || !isAuthenticated || !user) {
      setCompositionItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/composition-items?compositionId=${composition.id}`);
      
      const data = Array.isArray(res.data) 
        ? res.data.filter((item: any) => item.compositionId === composition.id)
        : [];
      
      // Mapeia os dados para garantir que os campos estejam corretos
      const mappedData: CompositionItem[] = data.map((item: any) => ({
        id: item.id,
        compositionId: item.compositionId,
        compositionName: item.compositionName,
        rawMaterialId: item.rawMaterialId,
        description: item.description,
        quantity: item.quantity || item.quantity === 0 ? item.quantity : 1,
        unitType: item.unitType,
        costType: item.costType,
        // Mapeia os campos de custo considerando os nomes do backend
        unitCost: item.unitCost !== undefined ? item.unitCost : 
                  item.rawMaterialUnitCost !== undefined ? item.rawMaterialUnitCost : 0,
        totalCost: item.totalCost !== undefined ? item.totalCost : 
                   item.rawMaterialTotalCost !== undefined ? item.rawMaterialTotalCost : 0,
        serviceCost: item.serviceCost !== undefined ? item.serviceCost : 0,
        percentage: item.percentage !== undefined ? item.percentage : 100,
        active: item.active !== undefined ? item.active : true,
      }));
      
      setCompositionItems(mappedData);
      resetForm();
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Acesso negado para composition items. Verifique suas permissões.");
      } else {
        setError(t("compositions.compositionItem.loadError") + " " + (err.response?.data?.message || err.message));
      }
      setCompositionItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "active"
          ? value === "true"
          : name === "quantity" || name === "unitCost" || name === "totalCost" || name === "serviceCost" || name === "percentage"
          ? value === ""
            ? 0 // Valor padrão para campos obrigatórios
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    // Verificações de segurança
    if (!isAuthenticated || !user) {
      setError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    // Verifica se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (user.exp < now) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    if ((form.description ?? "").trim() === "") {
      setError(t("compositions.compositionItem.descriptionRequired"));
      return;
    }

    if (!form.unitType || form.unitType.trim() === "") {
      setError("Tipo de unidade é obrigatório.");
      return;
    }

    if (!form.costType || form.costType.trim() === "") {
      setError("Tipo de custo é obrigatório.");
      return;
    }

    // Validações adicionais para campos obrigatórios
    if (!form.rawMaterialId) {
      setError("Matéria-prima é obrigatória.");
      return;
    }

    if (!form.quantity || form.quantity < 0) {
      setError("Quantidade deve ser maior ou igual a zero.");
      return;
    }

    if (!form.percentage || form.percentage < 0) {
      setError("Percentual deve ser maior ou igual a zero.");
      return;
    }

    // Validações de custo - permitem valores 0
    if (form.unitCost === null || form.unitCost === undefined || form.unitCost < 0) {
      setError("Custo unitário deve ser maior ou igual a zero.");
      return;
    }

    if (form.totalCost === null || form.totalCost === undefined || form.totalCost < 0) {
      setError("Custo total deve ser maior ou igual a zero.");
      return;
    }

    if (form.serviceCost === null || form.serviceCost === undefined || form.serviceCost < 0) {
      setError("Custo do serviço deve ser maior ou igual a zero.");
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        compositionId: composition.id,
        rawMaterialId: form.rawMaterialId || 0,
        description: form.description,
        quantity: form.quantity || 0,
        unitType: form.unitType,
        costType: form.costType,
        unitCost: form.unitCost || 0,
        totalCost: form.totalCost || 0,
        serviceCost: form.serviceCost || 0,
        percentage: form.percentage || 0,
        active: form.active,
        // Campos obrigatórios que o backend está exigindo
        rawMaterialUnitCost: form.unitCost || 0,
        rawMaterialTotalCost: form.totalCost || 0
      };
      
      console.log("🔍 handleSubmit - Payload sendo enviado:", payload);
      console.log("🔍 handleSubmit - Form state atual:", form);
      
      let res;
      
      if (form.id) {
        console.log("🔍 handleSubmit - Atualizando item existente:", form.id);
        res = await api.put(`/composition-items/${form.id}`, payload);
      } else {
        console.log("🔍 handleSubmit - Criando novo item");
        res = await api.post("/composition-items", payload);
      }

      console.log("🔍 handleSubmit - Resposta da API:", res.data);
      console.log("🔍 handleSubmit - Status da resposta:", res.status);

      const saved = res.data;
      console.log("🔍 handleSubmit - Dados salvos (antes do mapeamento):", saved);
      
      // Mapeia os dados salvos para garantir consistência
      const mappedSaved: CompositionItem = {
        id: saved.id,
        compositionId: saved.compositionId,
        compositionName: saved.compositionName,
        rawMaterialId: saved.rawMaterialId,
        description: saved.description,
        quantity: saved.quantity || saved.quantity === 0 ? saved.quantity : 1,
        unitType: saved.unitType,
        costType: saved.costType,
        // Mapeia os campos de custo considerando os nomes do backend
        unitCost: saved.unitCost !== undefined ? saved.unitCost : 
                  saved.rawMaterialUnitCost !== undefined ? saved.rawMaterialUnitCost : 0,
        totalCost: saved.totalCost !== undefined ? saved.totalCost : 
                   saved.rawMaterialTotalCost !== undefined ? saved.rawMaterialTotalCost : 0,
        serviceCost: saved.serviceCost !== undefined ? saved.serviceCost : 0,
        percentage: saved.percentage !== undefined ? saved.percentage : 100,
        active: saved.active !== undefined ? saved.active : true,
      };
      
      console.log("🔍 handleSubmit - Dados mapeados após salvamento:", mappedSaved);
      
      // Atualiza a lista de composition items
      setCompositionItems((prev) => {
        if (form.id) {
          // Atualiza item existente
          const updated = prev.map((r) => (r.id === mappedSaved.id ? mappedSaved : r));
          console.log("🔍 handleSubmit - Lista atualizada (edit):", updated);
          return updated;
        } else {
          // Adiciona novo item
          const updated = [...prev, mappedSaved];
          console.log("🔍 handleSubmit - Lista atualizada (create):", updated);
          return updated;
        }
      });

      setSuccessMessage(t("compositions.compositionItem.itemSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
      resetForm();
      setEditingMode(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Acesso negado. Verifique suas permissões para este recurso.");
      } else if (err.response?.status === 404) {
        setError("Endpoint não encontrado. Verifique a configuração da API.");
      } else if (err.response?.status >= 500) {
        setError("Erro interno do servidor. Tente novamente mais tarde.");
      } else {
        setError(t("compositions.compositionItem.saveError") + " " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: CompositionItem) => {
    
    // Mapeia o item para garantir que os campos estejam corretos
    const mappedItem: CompositionItem = {
      id: item.id,
      compositionId: item.compositionId,
      compositionName: item.compositionName,
      rawMaterialId: item.rawMaterialId,
      description: item.description,
      quantity: item.quantity || item.quantity === 0 ? item.quantity : 1,
      unitType: item.unitType,
      costType: item.costType,
      // Mapeia os campos de custo considerando os nomes do backend
      unitCost: item.unitCost !== undefined ? item.unitCost : 
                item.rawMaterialUnitCost !== undefined ? item.rawMaterialUnitCost : 0,
      totalCost: item.totalCost !== undefined ? item.totalCost : 
                 item.rawMaterialTotalCost !== undefined ? item.rawMaterialTotalCost : 0,
      serviceCost: item.serviceCost !== undefined ? item.serviceCost : 0,
      percentage: item.percentage !== undefined ? item.percentage : 100,
      active: item.active !== undefined ? item.active : true,
    };
    
    setForm(mappedItem);
    setEditingMode(true);
    setError(null);
    
  };

  const handleDelete = async (id: number | null) => {
    if (!id || !confirm(t("compositions.compositionDetails.confirmDelete"))) return;
    setIsLoading(true);
    try {
      await api.delete(`/composition-items/${id}`);
      setCompositionItems((prev) => prev.filter((r) => r.id !== id));
      resetForm();
      setEditingMode(false);
      setSuccessMessage(t("compositions.compositionItem.itemDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: any) {
      setError(t("compositions.compositionItem.deleteError") + " " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      compositionId: composition.id,
      compositionName: composition.name,
      rawMaterialId: null,
      description: "",
      quantity: 1, // Valor padrão para campo obrigatório
      unitType: "UNIT",
      costType: "MATERIAL",
      unitCost: 0, // Valor padrão para campo obrigatório
      totalCost: 0, // Valor padrão para campo obrigatório
      serviceCost: 0, // Valor padrão para campo obrigatório
      percentage: 100, // Valor padrão para campo obrigatório
      active: true,
    });
  };

  return (
    <div className={styles.container}>
      
      <div className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.composition")}:</label>
            <input
              name="compositionName"
              value={composition.name || ""}
              className={styles["form-input"]}
              disabled
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.rawMaterial")}:</label>
            <select
              name="rawMaterialId"
              value={form.rawMaterialId?.toString() ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="">{t("compositions.compositionItem.select")}</option>
              {rawMaterials.map((m) => (
                <option key={m.rawMaterialId} value={m.rawMaterialId?.toString() ?? ""}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.description")}:</label>
            <input
              name="description"
              value={form.description ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              placeholder={t("compositions.compositionItem.descriptionPlaceholder")}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.quantity")}:</label>
            <input
              type="number"
              name="quantity"
              step="0.01"
              min="0"
              value={form.quantity !== null && form.quantity !== undefined ? form.quantity : ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.unit")}:</label>
            <select
              name="unitType"
              value={form.unitType ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("compositions.compositionItem.select")}</option>
              {Object.values(CompositionUnitType).map((type) => (
                <option key={type} value={type}>
                  {t(`unitType.${type}`)}
                </option>
              ))}
            </select>
          </div>          
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.costType")}:</label>
            <select
              name="costType"
              value={form.costType ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="">{t("compositions.compositionItem.select")}</option>
              {Object.values(CostType).map((type) => (
                <option key={type} value={type}>
                  {t(`compositions.compositionItem.costTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.unitCost")}:</label>
            <input
              type="number"
              name="unitCost"
              step="0.01"
              min="0"
              value={form.unitCost !== null && form.unitCost !== undefined ? form.unitCost : ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.totalCost")}:</label>
            <input
              type="number"
              name="totalCost"
              step="0.01"
              min="0"
              value={form.totalCost !== null && form.totalCost !== undefined ? form.totalCost : ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.serviceCost")}:</label>
            <input
              type="number"
              name="serviceCost"
              step="0.01"
              min="0"
              value={form.serviceCost !== null && form.serviceCost !== undefined ? form.serviceCost : ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.percentage")}:</label>
            <input
              type="number"
              name="percentage"
              step="0.01"
              min="0"
              value={form.percentage !== null && form.percentage !== undefined ? form.percentage : ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionItem.active")}:</label>
            <select
              name="active"
              value={form.active.toString()}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="true">{t("compositions.compositionDetails.yes")}</option>
              <option value="false">{t("compositions.compositionDetails.no")}</option>
            </select>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="button" className={styles.button} onClick={handleSubmit} disabled={isLoading}>
                {form.id ? t("compositions.compositionDetails.update") : t("compositions.compositionDetails.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={() => {
                  resetForm();
                  setEditingMode(false);
                }}
                disabled={isLoading}
              >
                {t("compositions.compositionDetails.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={() => {
                resetForm();
                setEditingMode(true);
              }}
              disabled={isLoading}
            >
              {t("compositions.compositionItem.newItem")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <hr />

      {isLoading ? (
        <p>{t("compositions.compositionItem.loadingItems")}</p>
      ) : compositionItems.length > 0 ? (
        <table className={styles["composicao-table"]}>
          <thead>
            <tr>
              <th>{t("compositions.compositionItem.composition")}</th>
              <th>{t("compositions.compositionItem.description")}</th>
              <th>{t("compositions.compositionItem.quantity")}</th>
              <th>{t("compositions.compositionItem.costType")}</th>
              <th>{t("compositions.compositionItem.active")}</th>
              <th>{t("compositions.compositionDetails.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {compositionItems.map((item) => (
              <tr key={item.id ?? item.description}>
                <td>{item.compositionName || composition.name}</td>
                <td>{item.description}</td>
                <td>{item.quantity ?? '-'}</td>
                <td>{item.costType ? t(`compositions.compositionItem.costTypes.${item.costType}`) : '-'}</td>
                <td>{item.active ? t("compositions.compositionDetails.yes") : t("compositions.compositionDetails.no")}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className={styles["button-editar"]}>
                    {t("compositions.compositionDetails.edit")}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className={styles["button-excluir"]}>
                    {t("compositions.compositionDetails.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{t("compositions.compositionItem.noItems")}</p>
      )}
    </div>
  );
}
