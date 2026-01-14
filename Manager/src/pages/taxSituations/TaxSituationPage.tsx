// ✅ pages/TaxSituationPage.tsx
import { useEffect, useState, useMemo } from "react";
import { TaxSituation } from "../../models/taxSituation";
import { apiNoPrefix } from "../../service/api";
import FormTaxSituation from "./FormTaxSituation";
import ListTaxSituation from "./ListTaxSituation";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function TaxSituationPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [items, setItems] = useState<TaxSituation[]>([]);
  const [editing, setEditing] = useState<TaxSituation | null>(null);
  const [filter, setFilter] = useState("");

    useEffect(() => {
    apiNoPrefix.get("/api/tax-situations")
      .then(res => {
        const data = res.data.content || res.data;
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
      .catch(err => {
        console.error("Error loading tax situations:", err);
        setItems([]);
      });
  }, [t]);

    const handleSave = async (item: TaxSituation) => {
    try {
      if (item.id && item.id !== 0) {
        const res = await apiNoPrefix.put(`/api/tax-situations/${item.id}`, item);
        setItems(prev => prev.map(h => h.id === item.id ? res.data : h));
      } else {
        const res = await apiNoPrefix.post("/api/tax-situations", item);
        setItems(prev => [...prev, res.data]);
      }
      setEditing(null);
    } catch (err: any) {
      console.error("Error saving tax situation:", err);
    }
  };

  const handleEdit = (item: TaxSituation) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("taxSituations.confirmDelete"))) {
      return;
    }
    
    try {
      await apiNoPrefix.delete(`/api/tax-situations/${id}`);
      setItems(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error("Error deleting tax situation:", err);
    }
  };

  const filtered = useMemo(() => {
    try {
      if (!Array.isArray(items)) return [];
      
      return items.filter(h => {
        try {
          if (!h || typeof h !== 'object') return false;
          if (!h.name || !h.code) return false;
          
          const name = String(h.name).toLowerCase();
          const code = String(h.code).toLowerCase();
          const filterLower = filter.toLowerCase();
          
          return name.includes(filterLower) || code.includes(filterLower);
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }, [items, filter]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("taxSituations.title")}</h2>
      <input
        type="text"
        placeholder={t("taxSituations.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />
      
             <FormTaxSituation 
         item={editing} 
         onSave={handleSave} 
         onCancel={handleCancel}
         onNew={() => setEditing({ id: 0, code: "", name: "" })}
       />
       
       <ListTaxSituation items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
