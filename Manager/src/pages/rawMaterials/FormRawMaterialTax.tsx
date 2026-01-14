import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/rawMaterials/FormRawMaterialDetail.module.css";
import { RawMaterial } from "../../models/RawMaterial";
import { RawMaterialTax } from "../../models/RawMaterialTax";
import api from "../../service/api";

interface FormRawMaterialTaxProps {
  rawMaterial: RawMaterial;
  onDoubleClickRawMaterial?: (rawMaterial: RawMaterial) => void;
}

export default function FormRawMaterialTax({ rawMaterial, onDoubleClickRawMaterial }: FormRawMaterialTaxProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [form, setForm] = useState<RawMaterialTax>({
    id: null,
    rawMaterialId: rawMaterial.idRawMaterial!,
    rawMaterialName: rawMaterial.name || null,
    classification: "",
    ipiRate: null,
    icmsRate: null,
    cicmsRate: null,
    taxRate: null,
    freightRate: null,
    acquisitionInterestRate: null,
    ipiAmount: null,
    icmsAmount: null,
    cicmsAmount: null,
    taxAmount: null,
    commissionAmount: null,
  });

  console.log("Estado inicial do form:", form);
  console.log("RawMaterial recebido:", rawMaterial);

  const [taxRecords, setTaxRecords] = useState<RawMaterialTax[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(false);

  const classificationRef = useRef<HTMLInputElement>(null);

  // Aplicar foco quando entrar no modo de edição
  useLayoutEffect(() => {
    if (shouldFocus && classificationRef.current && editingMode) {
      classificationRef.current.focus();
      console.log('🎯 Foco aplicado via useLayoutEffect no campo Classificação');
      setShouldFocus(false); // Reset do estado
    }
  }, [shouldFocus, editingMode]);

  useEffect(() => {
    loadTaxData();
  }, [rawMaterial.idRawMaterial]);

  const loadTaxData = async () => {
    if (!rawMaterial.idRawMaterial) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/raw-material-taxes?rawMaterialId=${rawMaterial.idRawMaterial}`);
      console.log("Dados brutos da API:", res.data);
      
      const mappedData = Array.isArray(res.data) ? res.data : [];
      console.log("Dados mapeados:", mappedData);
      
      setTaxRecords(mappedData);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(t("rawMaterialTax.loadError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("HandleChange - campo:", name, "valor:", value);
    
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: value === "" ? null : isNaN(Number(value)) ? value : Number(value),
      };
      console.log("HandleChange - novo form state:", newForm);
      return newForm;
    });
  };

  const handleSubmit = async () => {
    if ((form.classification ?? "").toString().trim() === "") {
      setError(t("rawMaterialTax.classificationRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...form,
        rawMaterialId: rawMaterial.idRawMaterial,
      };

      console.log("Payload sendo enviado:", payload);
      console.log("Form state antes do envio:", form);

      const res = form.id
        ? await api.put(`/raw-material-taxes/${form.id}`, payload)
        : await api.post("/raw-material-taxes", payload);

      console.log("Resposta da API:", res.data);
      const saved = res.data;
      console.log("Dados salvos:", saved);
      
      setTaxRecords((prev) => {
        const newRecords = form.id ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
        console.log("Novos registros:", newRecords);
        return newRecords;
      });

      setSuccessMessage(t("rawMaterialTax.taxRecordSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
      resetForm();
      setEditingMode(false);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(t("rawMaterialTax.saveError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: RawMaterialTax) => {
    console.log("HandleEdit - registro recebido:", record);
    console.log("HandleEdit - mapeando para form state");
    setForm(record);
    console.log("HandleEdit - form state definido");
    setEditingMode(true);
    setError(null);
  };

  const handleDelete = async (id: number | null) => {
    if (!id || !confirm(t("rawMaterial.confirmDelete"))) return;
    console.log("HandleDelete - deletando registro com ID:", id);
    setIsLoading(true);
    try {
      await api.delete(`/raw-material-taxes/${id}`);
      console.log("Registro deletado com sucesso");
      
      setTaxRecords((prev) => {
        const newRecords = prev.filter((r) => r.id !== id);
        console.log("Registros após deleção:", newRecords);
        return newRecords;
      });
      
      resetForm();
      setEditingMode(false);
      setSuccessMessage(t("rawMaterialTax.taxRecordDeleted"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      setError(t("rawMaterialTax.deleteError") + ": " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    console.log("ResetForm - estado atual antes do reset:", form);
    const newFormState = {
      id: null,
      rawMaterialId: rawMaterial.idRawMaterial!,
      rawMaterialName: rawMaterial.name || null,
      classification: "",
      ipiRate: null,
      icmsRate: null,
      cicmsRate: null,
      taxRate: null,
      freightRate: null,
      acquisitionInterestRate: null,
      ipiAmount: null,
      icmsAmount: null,
      cicmsAmount: null,
      taxAmount: null,
      commissionAmount: null,
    };
    console.log("ResetForm - novo estado sendo definido:", newFormState);
    setForm(newFormState);
    console.log("ResetForm - estado resetado com sucesso");
  };

  return (
    <div className={styles.container}>
      <h3>{t("rawMaterialTax.title")} - {rawMaterial.name}</h3>
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
            <label className={styles["form-label"]}>{t("rawMaterialTax.classification")}:</label>
            <input
              name="classification"
              value={form.classification ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              placeholder={t("rawMaterialTax.classificationPlaceholder")}
              disabled={!editingMode}
              ref={classificationRef}
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
  {[
    ["ipiRate", t("rawMaterialTax.ipiRate")],
    ["icmsRate", t("rawMaterialTax.icmsRate")],
    ["cicmsRate", t("rawMaterialTax.cicmsRate")],
  ].map(([name, label]) => (
    <div className={styles.coluna} key={name}>
      <label className={styles["form-label"]}>{label}</label>
      <input
        type="number"
        name={name}
        step="0.01"
        min="0"
        value={(form as any)[name] ?? ""}
        onChange={handleChange}
        className={styles["form-input"]}
        disabled={!editingMode}
      />
    </div>
  ))}
</div>

{/* Line 2 */}
<div className={styles["form-linha"]}>
  {[
    ["taxRate", t("rawMaterialTax.taxRate")],
    ["freightRate", t("rawMaterialTax.freightRate")],
    ["acquisitionInterestRate", t("rawMaterialTax.acquisitionInterestRate")],
  ].map(([name, label]) => (
    <div className={styles.coluna} key={name}>
      <label className={styles["form-label"]}>{label}</label>
      <input
        type="number"
        name={name}
        step="0.01"
        min="0"
        value={(form as any)[name] ?? ""}
        onChange={handleChange}
        className={styles["form-input"]}
        disabled={!editingMode}
      />
    </div>
  ))}
</div>

{/* Line 3 */}
<div className={styles["form-linha"]}>
  {[
    ["ipiAmount", t("rawMaterialTax.ipiAmount")],
    ["icmsAmount", t("rawMaterialTax.icmsAmount")],
    ["cicmsAmount", t("rawMaterialTax.cicmsAmount")],
  ].map(([name, label]) => (
    <div className={styles.coluna} key={name}>
      <label className={styles["form-label"]}>{label}</label>
      <input
        type="number"
        name={name}
        step="0.01"
        min="0"
        value={(form as any)[name] ?? ""}
        onChange={handleChange}
        className={styles["form-input"]}
        disabled={!editingMode}
      />
    </div>
  ))}
</div>

{/* Line 4 */}
<div className={styles["form-linha"]}>
  {[
    ["taxAmount", t("rawMaterialTax.taxAmount")],
    ["commissionAmount", t("rawMaterialTax.commissionAmount")],
  ].map(([name, label]) => (
    <div className={styles.coluna} key={name}>
      <label className={styles["form-label"]}>{label}</label>
      <input
        type="number"
        name={name}
        step="0.01"
        min="0"
        value={(form as any)[name] ?? ""}
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
                setShouldFocus(true);
              }}
              disabled={isLoading}
            >
              {t("rawMaterialTax.newTaxRecord")}
            </button>
          )}
        </div>


        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <hr />

      {taxRecords.length > 0 ? (
        <table className={styles["cliente-table"]}>
          <thead>
            <tr>
              <th>{t("rawMaterial.rawMaterial")}</th>
              <th>{t("rawMaterialTax.classification")}</th>
                           <th>{t("rawMaterialTax.ipiRate")}</th>
             <th>{t("rawMaterialTax.icmsRate")}</th>
              <th>{t("rawMaterial.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {taxRecords.map((r) => (
              <tr 
                key={r.id ?? r.classification}
                onDoubleClick={() => {
                  console.log("🎯 Duplo clique na linha de imposto detectado!");
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
                <td>{r.classification}</td>
                <td>{r.ipiRate}</td>
                <td>{r.icmsRate}</td>
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
        <p>{t("rawMaterialTax.noTaxRecords")}</p>
      )}
    </div>
  );
}
