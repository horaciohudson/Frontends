import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/rawMaterials/FormRawMaterialMeasure.module.css";
import { RawMaterial } from "../../models/RawMaterial";
import { RawMaterialMeasure } from "../../models/RawMaterialMeasure";
import { UnitType } from "../../enums/UnitType";
import api from "../../service/api";

interface FormRawMaterialMeasureProps {
  rawMaterial: RawMaterial;
  onDoubleClickRawMaterial?: (rawMaterial: RawMaterial) => void;
}

export default function FormRawMaterialMeasure({ rawMaterial, onDoubleClickRawMaterial }: FormRawMaterialMeasureProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const { t: tEnums } = useTranslation(TRANSLATION_NAMESPACES.ENUMS);
  const [form, setForm] = useState<RawMaterialMeasure>({
    id: null,
    rawMaterialId: rawMaterial.idRawMaterial!,
    rawMaterialName: rawMaterial.name || null,
    unitType: null,
    grossWeight: null,
    netWeight: null,
    length: null,
    width: null,
    boxQuantity: null,
  });

  const [records, setRecords] = useState<RawMaterialMeasure[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMeasureData();
  }, [rawMaterial.idRawMaterial]);

  const loadMeasureData = async () => {
    if (!rawMaterial.idRawMaterial) return;
    try {
      const res = await api.get(`/raw-material-measures?rawMaterialId=${rawMaterial.idRawMaterial}`);
      setRecords(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (err) {
      console.error("Error loading existing records:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSubmit = async () => {
    if (!form.unitType) {
      setError(t("rawMaterialMeasure.unitRequired"));
      return;
    }
    setIsLoading(true);
    try {
      const payload = { ...form, rawMaterialId: rawMaterial.idRawMaterial };
      const res = form.id
        ? await api.put(`/raw-material-measures/${form.id}`, payload)
        : await api.post("/raw-material-measures", payload);

      const saved = res.data;
      setRecords((prev) =>
        form.id ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved]
      );
      setSuccessMessage(t("rawMaterialMeasure.measuresSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
      setEditingMode(false);
    } catch (err: any) {
      setError(t("rawMaterialMeasure.saveError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: RawMaterialMeasure) => {
    setForm(record);
    setEditingMode(true);
    setError(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id || !confirm(t("rawMaterial.confirmDelete"))) return;
    setIsLoading(true);
    try {
      await api.delete(`/raw-material-measures/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      resetForm();
      setEditingMode(false);
      setSuccessMessage(t("rawMaterialMeasure.measureRecordDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(t("rawMaterialMeasure.deleteError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      rawMaterialId: rawMaterial.idRawMaterial!,
      rawMaterialName: rawMaterial.name || null,
      unitType: null,
      grossWeight: null,
      netWeight: null,
      length: null,
      width: null,
      boxQuantity: null,
    });
  };

  return (
    <div className={styles.container}>
      <h3>{t("rawMaterialMeasure.title")} - {rawMaterial.name}</h3>
      <div className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterial.rawMaterial")}:</label>
            <input
              name="rawMaterialName"
              value={rawMaterial.name || ""}
              className={styles["form-input"]}
              disabled
            />
          </div>  
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterialMeasure.unitType")}:</label>
            <select
              name="unitType"
              value={form.unitType || ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            >
              <option value="">{t("rawMaterialMeasure.selectUnitType")}</option>
              {Object.values(UnitType).map((type) => (
                <option key={type} value={type}>
                  {tEnums(`unitType.${type}`)}
                </option>
              ))}
            </select>
          </div>
           <div className={styles["form-linha"]}>
          {[
            ["grossWeight", t("rawMaterialMeasure.grossWeight")],
            ["netWeight", t("rawMaterialMeasure.netWeight")],
            ["length", t("rawMaterialMeasure.length")]
          ].map(([field, label]) => (
            <div className={styles.coluna} key={field}>
              <label className={styles["form-label"]}>{label}</label>
              <input
                name={field}
                type="number"
                step="0.01"
                value={(form as any)[field] ?? ""}
                onChange={handleChange}
                className={styles["form-input"]}
                disabled={!editingMode}
              />
            </div>
          ))}
        </div>
        </div>

        <div className={styles["form-linha"]}>
          {[
            ["width", t("rawMaterialMeasure.width")],
            ["boxQuantity", t("rawMaterialMeasure.boxQuantity")]
          ].map(([field, label]) => (
            <div className={styles.coluna} key={field}>
              <label className={styles["form-label"]}>{label}</label>
              <input
                name={field}
                type="number"
                step="0.01"
                value={(form as any)[field] ?? ""}
                onChange={handleChange}
                className={styles["form-input"]}
                disabled={!editingMode}
              />
            </div>
          ))}
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="button" className={styles.button} onClick={handleSubmit} disabled={isLoading}>
                {form.id ? t("rawMaterial.update") : t("rawMaterial.save")}
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
                {t("rawMaterial.cancel")}
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
              {t("rawMaterialMeasure.newMeasureRecord")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <hr />

      {records.length > 0 ? (
        <table className={styles["cliente-table"]}>
          <thead>
            <tr>
              <th>{t("rawMaterial.rawMaterial")}</th>
              <th>{t("rawMaterialMeasure.measure")}</th>
              <th>{t("rawMaterialMeasure.unit")}</th>
              <th>{t("rawMaterialMeasure.conversionFactor")}</th>
              <th>{t("rawMaterialMeasure.isBaseUnit")}</th>
              <th>{t("rawMaterial.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr 
                key={`${r.unitType}-${index}`}
                onDoubleClick={() => {
                  console.log("🎯 Duplo clique na linha de medida detectado!");
                  console.log("📋 Registro:", r);
                  console.log("🏭 RawMaterial:", rawMaterial);
                  console.log("🔗 onDoubleClickRawMaterial existe?", !!onDoubleClickRawMaterial);
                  if (onDoubleClickRawMaterial) {
                    onDoubleClickRawMaterial(rawMaterial);
                  } else {
                    console.warn("⚠️ onDoubleClickRawMaterial não foi passada como prop");
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>{r.rawMaterialName}</td>
                <td>{r.grossWeight}</td>
                <td>{r.netWeight}</td>
                <td>{r.length}</td>
                <td>{r.width}</td>
                <td>{r.boxQuantity}</td>
                <td>
                  <button onClick={() => handleEdit(r)} className={styles["button-editar"]}>
                    {t("rawMaterial.edit")}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className={styles["button-excluir"]}>
                     {t("rawMaterial.delete")}
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      ) : (
        <p>{t("rawMaterialMeasure.noMeasureRecords")}</p>
      )}
    </div>
  );
}
