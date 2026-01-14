// ✅ pages/HistoryPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { History } from "../../models/History";
import api from "../../service/api";
import FormHistory from "./FormHistory";
import ListHistory from "./ListHistory";

export default function HistoryPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [items, setItems] = useState<History[]>([]);
  const [editing, setEditing] = useState<History | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.get("/histories")
      .then(res => {
        // Handle both paginated response (res.data.content) and direct array (res.data)
        const data = res.data.content || res.data;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(t("histories.loadError"), err));
  }, []);

  const handleSave = async (item: History) => {
    try {
      if (item.id && item.id !== 0) {
        const res = await api.put(`/histories/${item.id}`, item);
        setItems(prev => prev.map(h => h.id === item.id ? res.data : h));
      } else {
        const res = await api.post("/histories", item);
        setItems(prev => [...prev, res.data]);
      }
      setEditing(null);
    } catch (err) {
      console.error(t("histories.saveError"), err);
    }
  };

  const handleEdit = (item: History) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/histories/${id}`);
      setItems(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error(t("histories.deleteError"), err);
    }
  };

  const filtered = items.filter(h =>
    h.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("histories.title")}</h2>
      <input
        type="text"
        placeholder={t("histories.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />
      <FormHistory item={editing} onSave={handleSave} onCancel={handleCancel} />
      <ListHistory items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
