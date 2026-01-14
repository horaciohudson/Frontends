import { useEffect, useState } from "react";
import { Currency } from "../../models/Currency";
import FormCurrency from "./FormCurrency";
import ListCurrency from "./ListCurrency";
import api from "../../service/api";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [filter, setFilter] = useState("");
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const res = await api.get("/currencies");
      const list = Array.isArray(res.data) ? res.data : res.data.content;
      setCurrencies(list || []);
    } catch (error) {
      console.error(t("currencies.loadError"), error);
    }
  };

  const handleSave = async (currency: Currency) => {
  try {
    const isNew = currency.id === undefined || currency.id === null;
    await (isNew
      ? api.post("/currencies", currency)
      : api.put(`/currencies/${currency.id}`, currency));

    // Força recarga dos dados direto do banco
    await loadCurrencies();

    setEditing(null);
  } catch (error) {
          console.error(t("currencies.saveError"), error);
  }
};

  const handleEdit = (currency: Currency) => {
    setEditing(currency);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("currencies.confirmDelete"))) return;

    try {
      await api.delete(`/currencies/${id}`);
      setCurrencies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(t("currencies.deleteError"), error);
    }
  };

  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#365a7c" }}>
        {t("currencies.title")}
      </h2>

      <input
        type="text"
        placeholder={t("currencies.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <FormCurrency item={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      <ListCurrency currencies={filteredCurrencies} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
