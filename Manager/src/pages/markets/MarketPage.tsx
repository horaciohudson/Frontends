import { useEffect, useState } from "react";
import FormMarket from "./FormMarket";
import ListMarket from "./ListMarket";
import { Market } from "../../models/Market";
import api from "../../service/api";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function MarketPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [items, setItems] = useState<Market[]>([]);
  const [editing, setEditing] = useState<Market | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.get("/pracas")
      .then(res => {
        setItems(res.data.content); // <- resposta paginada
      })
      .catch(err => {
        console.error(t("markets.loadError"), err);
      });
  }, [t]);

  const handleSave = async (item: Market) => {
    try {
      if (item.id && item.id !== 0) {
        const res = await api.put(`/pracas/${item.id}`, item);
        setItems(prev =>
          prev.map(g => g.id === item.id ? res.data : g)
        );
      } else {
        const res = await api.post("/pracas", { nome: item.name });
        setItems(prev => [...prev, res.data]);
      }
      setEditing(null);
    } catch (err) {
      console.error(t("markets.saveError"), err);
    }
  };

  const handleEdit = (item: Market) => setEditing(item);

  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/pracas/${id}`);
      setItems(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(t("markets.deleteError"), err);
    }
  };

  const filtered = items.filter(g =>
    g.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("markets.title")}</h2>

      <input
        type="text"
        placeholder={t("markets.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <FormMarket item={editing} onSave={handleSave} onCancel={handleCancel} />
      <ListMarket items={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}