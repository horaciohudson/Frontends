import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/compositions/FormComposition.module.css";
import api from "../../service/api";
import { Composition } from "../../models/Composition";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface FormCompositionProps {
  onSelectComposition: (composition: Composition | null) => void;
  onDoubleClickComposition?: (composition: Composition) => void;
}

export default function FormComposition({ onSelectComposition, onDoubleClickComposition }: FormCompositionProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [form, setForm] = useState<Composition>({
    id: null,
    name: "",
    totalCost: 0,
    active: true,
  });

  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCompositions();
  }, []);

  const loadCompositions = async () => {
    try {
      const res = await api.get("/compositions");
      setCompositions(res.data);
    } catch (err: any) {
      setError(t("compositions.compositionDetails.loadError"));
      console.error(t("compositions.compositionDetails.loadError"), err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalCost" ? (value ? Number(value) : null) : name === "active" ? value === "true" : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError(t("compositions.compositionDetails.nameRequired"));
    if (form.totalCost === null || form.totalCost < 0) return setError(t("compositions.compositionDetails.totalCostRequired"));

    try {
      const payload = {
        id: form.id || null,
        name: form.name,
        totalCost: form.totalCost,
        active: form.active,
      };

      const res = form.id
        ? await api.put(`/compositions/${form.id}`, payload)
        : await api.post("/compositions", payload);

      const saved = res.data;
      setCompositions((prev) =>
        form.id ? prev.map((c) => (c.id === form.id ? saved : c)) : [...prev, saved]
      );
      setForm(saved);
      onSelectComposition(saved);
      setEditingMode(false);
      setError(null);
      setSuccessMessage(t("compositions.compositionDetails.compositionSaved"));
      setTimeout(() => setSuccessMessage(null), 3000);
      resetForm();
    } catch (err: any) {
      console.error(t("compositions.compositionDetails.saveError"), {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(t("compositions.compositionDetails.saveError") + " " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (composition: Composition) => {
    setForm(composition);
    setEditingMode(true);
    onSelectComposition(composition);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!confirm(t("compositions.compositionDetails.confirmDelete"))) return;
    try {
      await api.delete(`/compositions/${id}`);
      setCompositions((prev) => prev.filter((c) => c.id !== id));
      onSelectComposition(null);
    } catch (err: any) {
      setError(t("compositions.compositionDetails.deleteError"));
      console.error(t("compositions.compositionDetails.deleteError"), err);
    }
  };

  const handleNew = () => {
    setForm({
      id: null,
      name: "",
      totalCost: 0,
      active: true,
    });
    setEditingMode(true);
    onSelectComposition(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      totalCost: 0,
      active: true,
    });
    setEditingMode(false);
    setError(null);
    onSelectComposition(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionDetails.name")}:</label>
            <input
              ref={inputRef}
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionDetails.totalCost")}:</label>
            <input
              name="totalCost"
              type="number"
              step="0.01"
              value={form.totalCost ?? ""}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("compositions.compositionDetails.active")}:</label>
            <select
              name="active"
              value={form.active.toString()}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!editingMode}
              required
            >
              <option value="true">{t("compositions.compositionDetails.yes")}</option>
              <option value="false">{t("compositions.compositionDetails.no")}</option>
            </select>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button}>
                {form.id ? t("compositions.compositionDetails.update") : t("compositions.compositionDetails.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
              >
                {t("compositions.compositionDetails.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("compositions.compositionDetails.newComposition")}
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["composicao-table"]}>
        <thead>
          <tr>
            <th>{t("compositions.compositionDetails.name")}</th>
            <th>{t("compositions.compositionDetails.totalCost")}</th>
            <th>{t("compositions.compositionDetails.active")}</th>
            <th>{t("compositions.compositionDetails.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {compositions.map((c) => (
            <tr 
              key={c.id || `no-id-${c.name}`}
              className={styles["clickable-row"]}
              onDoubleClick={() => onDoubleClickComposition?.(c)}
              title={t("compositions.doubleClickToSelect")}
            >
              <td>{c.name}</td>
              <td>R$ {c.totalCost != null ? c.totalCost.toFixed(2) : "0.00"}</td>
              <td>{c.active ? t("compositions.compositionDetails.yes") : t("compositions.compositionDetails.no")}</td>
              <td>
                <button
                  className={styles["button-editar"]}
                  onClick={() => handleEdit(c)}
                >
                  {t("compositions.compositionDetails.edit")}
                </button>
                <button
                  className={styles["button-excluir"]}
                  type="button"
                  onClick={() => handleDelete(c.id)}
                >
                  {t("compositions.compositionDetails.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
