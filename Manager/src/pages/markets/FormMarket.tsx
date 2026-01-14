import { useEffect, useRef, useState } from "react";
import { Market } from "../../models/Market";
import styles from "../../styles/markets/FormMarket.module.css";
import { useTranslation } from "react-i18next";

interface Props {
  item: Market | null;
  onSave: (item: Market) => void;
  onCancel: () => void;
}

export default function FormMarket({ item, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setEditMode(true);
    } else {
      setName("");
      setEditMode(false);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMarket: Market = item
      ? { ...item, name }
      : { id: 0, name };
    onSave(newMarket);
    setName("");
    setEditMode(false);
  };

  const handleNew = () => {
    setName("");
    setEditMode(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <div className={styles["form-row"]}>
        <label htmlFor="name">{t("market.name")}:</label>
        <input
          ref={inputRef}
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editMode}
          required
        />

        {editMode ? (
          <>
            <button type="submit" className={styles.button}>
              {item ? t("market.update") : t("market.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setName("");
                onCancel();
              }}
              className={`${styles.button} ${styles.cancel}`}
            >
              {t("market.cancel")}
            </button>
          </>
        ) : (
          <button type="button" onClick={handleNew} className={styles["button-new"]}>
            {t("market.newMarket")}
          </button>
        )}
      </div>
    </form>
  );
} 
