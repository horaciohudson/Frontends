import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/rawMaterials/FormRawMaterial.module.css";
import api from "../../service/api";
import { RawMaterial } from "../../models/RawMaterial";
import { UnitType } from "../../enums/UnitType";
import { TRANSLATION_NAMESPACES } from "../../locales";

// ✅ usa o tipo e a lista centralizada
interface Option { id: number; name: string; }
interface SupplierOption { id: string; name: string; }

interface FormRawMaterialProps {
  onSelectRawMaterial: (rawMaterial: RawMaterial | null) => void;
  onDoubleClickRawMaterial?: (rawMaterial: RawMaterial) => void;
}

// ---------- helpers ----------
const takeList = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.content ?? []);

const mapRawMaterialFromApi = (rm: any): RawMaterial => {
  console.log("🔍 Dados recebidos da API:", rm);

  // Mapeamento defensivo para evitar IDs nulos
  // Verificar diferentes possibilidades de nomes de campos
  const groupId = (rm.groupId || rm.group_id) &&
    !isNaN(Number(rm.groupId || rm.group_id)) ?
    Number(rm.groupId || rm.group_id) : 0;

  const supplierCompanyId = (rm.supplierCompanyId || rm.supplier_company_id) ? 
    String(rm.supplierCompanyId || rm.supplier_company_id) : "";

  const mapped = {
    idRawMaterial: (rm.idRawMaterial || rm.id) && !isNaN(Number(rm.idRawMaterial || rm.id)) ? Number(rm.idRawMaterial || rm.id) : null,
    name: rm.name || "",
    reference: rm.reference ?? null,
    location: rm.location ?? null,
    warrantyMonths: Number(rm.warrantyMonths) || 0,
    packaging: rm.packaging || null,

    groupId,
    groupName: rm.groupName || rm.group_name || "",

    supplierCompanyId,
    supplierCompanyName: rm.supplierCompanyName || rm.supplier_company_name || "",
  };

  console.log("🔄 Dados mapeados:", mapped);
  return mapped;
};

const mapCategory = (c: any): Option => ({
  id: c.id ? Number(c.id) : 0,
  name: c.name || c.nome || ""
});

const mapSupplier = (s: any): SupplierOption => {
  const id = s.id ? String(s.id) : "";
  const name = String(s.tradeName || s.corporateName || s.name || s.nome || "").trim();
  return { id, name };
};

const initialRawMaterial: RawMaterial = {
  idRawMaterial: null,
  name: "",
  reference: "",
  location: "",
  warrantyMonths: 0,
  packaging: null,

  groupId: 0,
  groupName: "",

  supplierCompanyId: "",
  supplierCompanyName: "",
};

export default function FormRawMaterial({ onSelectRawMaterial, onDoubleClickRawMaterial }: FormRawMaterialProps) {
  const { t: tPrincipal } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const { t: tEnums } = useTranslation(TRANSLATION_NAMESPACES.ENUMS);
  const { t: tCommon } = useTranslation(TRANSLATION_NAMESPACES.COMMON);

  // ---------- STATE ----------
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [form, setForm] = useState<RawMaterial>(initialRawMaterial);

  const [groups, setGroups] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [editingMode, setEditingMode] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---------- EFFECTS ----------
  useEffect(() => {
    // Carregamentos iniciais
    loadRawMaterials();
    loadGroups();
    loadSuppliers();
  }, []);

  // Aplicar foco quando entrar no modo de edição
  useLayoutEffect(() => {
    if (shouldFocus && nameRef.current && editingMode) {
      nameRef.current.focus();
      console.log('🎯 Foco aplicado via useLayoutEffect no campo name');
      setShouldFocus(false); // Reset do estado
    }
  }, [shouldFocus, editingMode]);

  // ---------- LOADERS ----------
  const loadRawMaterials = async () => {
    try {
      const res = await api.get("/raw-materials");
      console.log("🔍 Resposta da API de matérias-primas:", res.data);
      const rawMaterialsList = takeList<any>(res.data).map(mapRawMaterialFromApi);
      console.log("🔍 Matérias-primas mapeadas:", rawMaterialsList);
      setRawMaterials(rawMaterialsList);
    } catch (e) {
      setError(tPrincipal("rawMaterials.loadError"));
    }
  };

  const loadGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(takeList<any>(res.data).map(mapCategory));
    } catch (e) {
      console.error(tPrincipal("rawMaterials.loadGroupsError"), e);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/companies/suppliers");
      const suppliersList = takeList<any>(res.data).map(mapSupplier);
      setSuppliers(suppliersList);
    } catch (e: any) {
      console.error("Erro ao carregar fornecedores:", e);
      setSuppliers([]);
    }
  };

  // ---------- HANDLERS ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setForm((prev) => {
      const next: any = {
        ...prev,
        [name]:
          name === "groupId" ||
            name === "warrantyMonths"
            ? Number(value) || 0
            : value,
      };

      if (name === "groupId") {
        const sel = groups.find((c) => c.id === Number(value));
        next.groupName = sel?.name || "";
      } else if (name === "supplierCompanyId") {
        const sel = suppliers.find((s) => s.id === value);
        next.supplierCompanyName = sel?.name || "";
      } else if (name === "packaging") {
        // keep only valid enum values or null
        const unitTypes = Object.values(UnitType);
        if (value && !unitTypes.includes(value as UnitType)) {
          next.packaging = null;
        }
      }

      return next;
    });
  };

  const handleNew = () => {
    setForm(initialRawMaterial);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleEdit = async (rm: RawMaterial) => {
    setForm(rm);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);

    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.name.trim()) {
      setError(tPrincipal("rawMaterials.nameRequired"));
      return;
    }

    if (!form.groupId || form.groupId <= 0) {
      setError(tPrincipal("rawMaterials.groupRequired"));
      return;
    }

    if (!form.supplierCompanyId || form.supplierCompanyId.trim() === "") {
      setError(tPrincipal("rawMaterials.supplierRequired"));
      return;
    }

    // Validação adicional para garantir que os IDs sejam válidos
    if (isNaN(form.groupId)) {
      setError("ID de grupo inválido detectado. Por favor, recarregue a página.");
      return;
    }

    // Validação adicional para garantir que os campos obrigatórios não sejam nulos
    if (!form.groupId || !form.supplierCompanyId) {
      setError("Grupo e fornecedor são obrigatórios.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        idRawMaterial: form.idRawMaterial || null,
        name: form.name.trim(),
        reference: form.reference || null,
        location: form.location || null,
        warrantyMonths: form.warrantyMonths || 0,
        packaging: form.packaging || null,
        groupId: form.groupId > 0 ? form.groupId : null,
        supplierCompanyId: (form.supplierCompanyId && form.supplierCompanyId.trim() !== "") ? form.supplierCompanyId : null,

        groupName: form.groupName || null,
        supplierCompanyName: form.supplierCompanyName || null,
      };



      let saved: RawMaterial;
      if (form.idRawMaterial) {
        const res = await api.put(`/raw-materials/${form.idRawMaterial}`, payload);
        saved = mapRawMaterialFromApi(res.data);
        setSuccessMessage(tPrincipal("rawMaterials.updateSuccess"));
      } else {
        const res = await api.post("/raw-materials", payload);
        saved = mapRawMaterialFromApi(res.data);
        setSuccessMessage(tPrincipal("rawMaterials.saveSuccess"));
      }

      setRawMaterials((prev) => (form.idRawMaterial ? prev.map((x) => (x.idRawMaterial === form.idRawMaterial ? saved : x)) : [...prev, saved]));
      onSelectRawMaterial(saved);
      resetForm();
    } catch (error: any) {
      console.error("❌ Error saving raw material:", error);
      let errorMessage = tPrincipal("rawMaterials.saveError");

      if (error.response?.status === 400 &&
        error.response?.data?.message?.includes("Supplier not found")) {
        errorMessage = tPrincipal("rawMaterials.supplierNotFound") || "Supplier not found. Please select a valid supplier.";
      }

      if (error.response?.status === 500) {
        errorMessage = `Internal server error: ${error.response?.data?.message || error.message}`;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!confirm(tPrincipal("rawMaterials.confirmDelete"))) return;

    try {
      await api.delete(`/raw-materials/${id}`);
      setRawMaterials((prev) => prev.filter((rm) => rm.idRawMaterial !== id));
      setSuccessMessage(tPrincipal("rawMaterials.deleteSuccess"));
      if (form.idRawMaterial === id) resetForm();
    } catch (error: any) {
      setError(error.response?.data?.message || tPrincipal("rawMaterials.deleteError"));
    }
  };

  const resetForm = () => {
    setForm(initialRawMaterial);
    setEditingMode(false);
    setShouldFocus(false);
    setError(null);
    setSuccessMessage(null);
    onSelectRawMaterial(null);
  };

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.name")}:</label>
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
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.reference")}:</label>
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
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.location")}:</label>
            <input
              type="text"
              name="location"
              value={form.location ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.group")}:</label>
            <select
              name="groupId"
              value={form.groupId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="">{tPrincipal("rawMaterials.selectGroup")}</option>
              {groups.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>
              {tPrincipal("rawMaterials.supplier")}:
              {suppliers.length === 0 && <span style={{color: 'orange', fontSize: '12px'}}> (Carregando...)</span>}
              {suppliers.length > 0 && <span style={{color: 'green', fontSize: '12px'}}> ({suppliers.length} encontrados)</span>}
            </label>
            <select
              name="supplierCompanyId"
              value={form.supplierCompanyId || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="">{tPrincipal("rawMaterials.selectSupplier")}</option>
              {suppliers.length === 0 && (
                <option disabled>Carregando fornecedores...</option>
              )}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.warrantyMonths")}:</label>
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

        <div className={styles["form-row"]}>
          <div className={styles.column}>
            <label className={styles["form-label"]}>{tPrincipal("rawMaterials.packaging")}:</label>
            <select
              name="packaging"
              value={form.packaging || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="">{tPrincipal("rawMaterials.selectPackaging")}</option>
              {Object.values(UnitType).map((p) => (
                <option key={p} value={p}>
                  {tEnums(`unitType.${p}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.column}>
            {/* Espaço reservado para futuras expansões */}
          </div>

          <div className={styles.column}>
            {/* Espaço reservado para futuras expansões */}
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={saving}>
                {form.idRawMaterial ? tPrincipal("rawMaterials.update") : tPrincipal("rawMaterials.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                {tPrincipal("rawMaterials.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-new"]}
              onClick={handleNew}
            >
              {tPrincipal("rawMaterials.newRawMaterial")}
            </button>
          )}
        </div>
      </form>

      <table className={styles["raw-material-table"]}>
        <thead>
          <tr>
            <th>{tPrincipal("rawMaterials.name")}</th>
            <th>{tPrincipal("rawMaterials.group")}</th>
            <th>{tPrincipal("rawMaterials.supplier")}</th>
            <th>{tPrincipal("rawMaterials.reference")}</th>
            <th>{tPrincipal("rawMaterials.location")}</th>
            <th>{tPrincipal("rawMaterials.warrantyMonths")}</th>
            <th>{tPrincipal("rawMaterials.packaging")}</th>
            <th>{tPrincipal("rawMaterials.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rawMaterials.map((rm) => (
            <tr
              key={rm.idRawMaterial ?? `no-id-${rm.name}`}
              className={styles["clickable-row"]}
              onDoubleClick={() => onDoubleClickRawMaterial?.(rm)}
              title={tPrincipal("rawMaterials.doubleClickToSelect")}
            >
              <td>{rm.name}</td>
              <td>{rm.groupName}</td>
              <td>{rm.supplierCompanyName || "-"}</td>
              <td>{rm.reference || "-"}</td>
              <td>{rm.location || "-"}</td>
              <td>{rm.warrantyMonths ? `${rm.warrantyMonths} meses` : "-"}</td>
              <td>{rm.packaging ? tEnums(`unitType.${rm.packaging}`) : "-"}</td>
              <td>
                <button
                  className={styles["button-edit"]}
                  onClick={() => handleEdit(rm)}
                  disabled={editingMode || saving}
                >
                  {tPrincipal("rawMaterials.edit")}
                </button>
                <button
                  className={styles["button-delete"]}
                  onClick={() => handleDelete(rm.idRawMaterial)}
                  disabled={rm.idRawMaterial == null || editingMode || saving}
                >
                  {tPrincipal("rawMaterials.delete")}
                </button>
              </td>
            </tr>
          ))}
          {rawMaterials.length === 0 && (
            <tr>
              <td colSpan={8}>{tCommon("noRecords")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
