import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/rawMaterials/FormRawMaterialDetail.module.css";
import { RawMaterial } from "../../models/RawMaterial";
import { RawMaterialDetail } from "../../models/RawMaterialDetail";
import api from "../../service/api";

interface FormRawMaterialDetailProps {
  rawMaterial: RawMaterial;
}

export default function FormRawMaterialDetail({ rawMaterial }: FormRawMaterialDetailProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [form, setForm] = useState<RawMaterialDetail>({
    id: null,
    rawMaterialId: rawMaterial.idRawMaterial!,
    rawMaterialName: rawMaterial.name || null,
    technicalReferenceBase64: null,
    warrantyMonths: null,
    netValue: null,
    grossValue: null,
    acquisitionInterestValue: null,
    product: null,
  });

  const [records, setRecords] = useState<RawMaterialDetail[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDetailData();
  }, [rawMaterial.idRawMaterial]);

  const loadDetailData = async () => {
    if (!rawMaterial.idRawMaterial) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/raw-material-details?rawMaterialId=${rawMaterial.idRawMaterial}`);
      setRecords(Array.isArray(res.data) ? res.data : []);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(t("rawMaterialDetail.loadError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        rawMaterialId: rawMaterial.idRawMaterial,
      };

      const res = form.id
        ? await api.put(`/raw-material-details/${form.id}`, payload)
        : await api.post("/raw-material-details", payload);

      const saved = res.data;
      setRecords((prev) =>
        form.id ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved]
      );

      setSuccessMessage(t("rawMaterialDetail.detailSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
      resetForm();
      setEditingMode(false);
    } catch (err: any) {
      setError(t("rawMaterialDetail.saveError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: RawMaterialDetail) => {
    setForm(record);
    setEditingMode(true);
    setError(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id || !confirm(t("rawMaterial.confirmDelete"))) return;
    setIsLoading(true);
    try {
      await api.delete(`/raw-material-details/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      resetForm();
      setEditingMode(false);
      setSuccessMessage(t("rawMaterialDetail.detailDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: any) {
      setError(t("rawMaterialDetail.deleteError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      rawMaterialId: rawMaterial.idRawMaterial!,
      rawMaterialName: rawMaterial.name || null,
      technicalReferenceBase64: null,
      warrantyMonths: null,
      netValue: null,
      grossValue: null,
      acquisitionInterestValue: null,
      product: null,
    });
  };

  return (
    <div className={styles.container}>
      <h3>{t("rawMaterialDetail.title")} - {rawMaterial.name}</h3>
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
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterialDetail.netValue")}:</label>
            <input
              type="number"
              name="netValue"
              step="0.01"
              value={form.netValue ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterialDetail.grossValue")}:</label>
            <input
              type="number"
              name="grossValue"
              step="0.01"
              value={form.grossValue ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterialDetail.acquisitionInterest")}:</label>
            <input
              type="number"
              name="acquisitionInterestValue"
              step="0.01"
              value={form.acquisitionInterestValue ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("rawMaterialDetail.technicalReferenceImage")}:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = (reader.result as string).split(",")[1];
                  setForm((prev) => ({ ...prev, technicalReferenceBase64: base64 }));
                };
                reader.readAsDataURL(file);
              }}
              className={styles["form-input"]}
              disabled={!editingMode}
            />
            {form.technicalReferenceBase64 && (
              <div className={styles["imagem-preview"]}>
                <img
                  src={`data:image/png;base64,${form.technicalReferenceBase64}`}
                  alt={t("rawMaterialDetail.preview")}
                  style={{ maxWidth: "150px", marginTop: "0.5rem" }}
                />
              </div>
            )}
          </div>
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
              {t("rawMaterialDetail.newDetail")}
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
              <th>{t("rawMaterialDetail.netValue")}</th>
               <th>{t("rawMaterialDetail.grossValue")}</th>
                <th>{t("rawMaterialDetail.acquisitionInterest")}</th>
              <th>{t("rawMaterial.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr 
                key={`${r.technicalReferenceBase64}-${index}`}
              >
                <td>{r.rawMaterialName}</td>               
                <td>{r.netValue}</td>
                <td>{r.grossValue}</td>
                <td>{r.acquisitionInterestValue}</td>
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
        <p>{t("rawMaterialDetail.noDetails")}</p>
      )}
    </div>
  );
}
