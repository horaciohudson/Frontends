import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormFiscalCode from "./FormFiscalCode";
import ListFiscalCode from "./ListFiscalCode";
import { getFiscalCodes, createFiscalCode, updateFiscalCode, deleteFiscalCode } from "../../service/FiscalCode";
import { FiscalCode } from "../../models/FiscalCode";

export default function FiscalCodePage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [fiscalCodes, setFiscalCodes] = useState<FiscalCode[]>([]);
  const [editing, setEditing] = useState<FiscalCode | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiscalCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fiscalCodesData = await getFiscalCodes();
      console.log("FiscalCodes loaded:", fiscalCodesData);
      setFiscalCodes(fiscalCodesData);
    } catch (err: any) {
      console.error(t("fiscalCodes.loadError"), err);
      setError(t("fiscalCodes.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiscalCodes();
  }, [t]);

  const handleSave = async (item: FiscalCode) => {
    try {
      setError(null);
      console.log("Saving fiscal code:", item);
      
      if (item.id && item.id > 0) {
        console.log("Updating fiscal code with ID:", item.id);
        const updated = await updateFiscalCode(item.id, item);
        console.log("Update response:", updated);
        setFiscalCodes(prev => prev.map(c => c.id === item.id ? updated : c));
      } else {
        console.log("Creating new fiscal code");
        const { id, createdAt, updatedAt, ...fiscalCodeData } = item;
        const created = await createFiscalCode(fiscalCodeData);
        console.log("Create response:", created);
        setFiscalCodes(prev => [...prev, created]);
      }
      setEditing(null);
    } catch (err: any) {
      console.error(t("fiscalCodes.saveError"), err);
      setError(t("fiscalCodes.saveError"));
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  const handleEdit = (item: FiscalCode) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este código fiscal?")) {
      return;
    }
    
    try {
      setError(null);
      console.log("Deleting fiscal code with ID:", id);
      await deleteFiscalCode(id);
      setFiscalCodes(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error(t("fiscalCodes.deleteError"), err);
      setError(t("fiscalCodes.deleteError"));
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filteredFiscalCodes = fiscalCodes.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.cfop.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "2rem" }}>Carregando códigos fiscais...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#365a7c" }}>{t("fiscalCodes.title")}</h2>

      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffebee", 
          padding: "1rem", 
          marginBottom: "1rem", 
          borderRadius: "4px" 
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder={t("fiscalCodes.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <FormFiscalCode item={editing} onSave={handleSave} onCancel={handleCancel} />
      <ListFiscalCode items={filteredFiscalCodes} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
