import { useEffect, useRef, useState } from "react";
import { Currency } from "../../models/Currency";
import styles from "../../styles/currencies/FormCurrency.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";

interface FormCurrencyProps {
  item: Currency | null;
  onSave: (item: Currency) => void;
  onCancel: () => void;
}

export default function FormCurrency({ item, onSave, onCancel }: FormCurrencyProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [active, setActive] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCode(item.code);
      setSymbol(item.symbol);
      setActive(item.active);
      setEditMode(true);
    } else {
      resetForm();
      setEditMode(false);
    }
    inputRef.current?.focus();
  }, [item]);

  const resetForm = () => {
    setName("");
    setCode("");
    setSymbol("");
    setActive(true);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) { setError(t("currencies.nameRequired")); return false; }
    if (!code.trim()) { setError(t("currencies.codeRequired")); return false; }
    if (!symbol.trim()) { setError(t("currencies.symbolRequired")); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    const newCurrency: Currency = item
      ? { ...item, name, code, symbol, active }
      : { name, code, symbol, active } as Currency;

    try {
      let response;
      if (item) {
        response = await api.put(`/currencies/${item.id}`, newCurrency);
      } else {
        response = await api.post("/currencies", newCurrency);
      }
      resetForm();
      setEditMode(false);
      setTimeout(() => onSave(response.data), 0);
      inputRef.current?.focus();
    } catch (err: any) {
      console.error(t("currencies.saveError"), err);
      const errorMessage = err.response?.data?.message || t("currencies.saveFailed");
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Quando clicar em "Novo", ativa o modo edição e limpa o formulário
  const handleNew = () => {
    resetForm();
    setEditMode(true);
    inputRef.current?.focus();
  };

  // Cancela edição
  const handleCancel = () => {
    setEditMode(false);
    onCancel();
    resetForm();
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className={styles["currency-form"]}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles["currency-form-row"]}>
        <div className={styles["currency-form-col"]}>
          <label>{t("currencies.name")}:</label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles["currency-form-input"]}
            disabled={!editMode}
            required
          />
        </div>
        <div className={styles["currency-form-col"]}>
          <label>{t("currencies.code")}:</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={styles["currency-form-input"]}
            disabled={!editMode}
            required
          />
        </div>
        <div className={styles["currency-form-col"]}>
          <label>{t("currencies.symbol")}:</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className={styles["currency-form-input"]}
            disabled={!editMode}
            required
          />
        </div>
        <div className={styles["currency-checkbox-row"]}>
          <label>{t("currencies.active")}:</label>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={!editMode}
          />
        </div>        
      </div>
      <div className={styles["currency-form-actions"]}>
        {editMode ? (
          <>
            <button
              type="submit"
              className={styles["currency-button"]}
              disabled={submitting}
            >
              {item ? t("currencies.update") : t("currencies.save")}
            </button>
            <button
              type="button"
              className={`${styles["currency-button"]} ${styles["cancel"]}`}
              onClick={handleCancel}
              disabled={submitting}
            >
              {t("currencies.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles["currency-button-new"]}
            onClick={handleNew}
          >
            {t("currencies.new")}
          </button>
        )}
      </div>
    </form>
  );
}
