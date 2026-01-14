import { useEffect, useState } from "react";
import { Note } from "../../models/Note";
import api from "../../service/api";
import FormNote from "./FormNote";
import ListNote from "./ListNote";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function NotePage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [items, setItems] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.get("/notes")
      .then(res => setItems(res.data.content))
      .catch(err => console.error(t("notes.loadError"), err));
  }, [t]);

  const handleSave = async (item: Note) => {
    try {
      if (item.id && item.id !== 0) {
        const res = await api.put(`/notes/${item.id}`, item);
        setItems(prev => prev.map(g => g.id === item.id ? res.data : g));
      } else {
        const res = await api.post("/notes", item);
        setItems(prev => [...prev, res.data]);
      }
      setEditing(null);
    } catch (err) {
      console.error(t("notes.saveError"), err);
    }
  };

  const handleEdit = (item: Note) => setEditing(item);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/notes/${id}`);
      setItems(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(t("notes.deleteError"), err);
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("notes.title")}</h2>

      <input
        type="text"
        placeholder={t("notes.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <FormNote item={editing} onSave={handleSave} onCancel={handleCancel} />
      <ListNote items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
} 
