
import { useEffect, useRef, useState } from "react";
import { History } from "../../models/History";
import styles from "../../styles/histories/FormHistory.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface Props {
  item: History | null;
  onSave: (item: History) => void;
  onCancel: () => void;
}

export default function FormHistory({ item, onSave, onCancel }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
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
    inputRef.current?.focus();
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHistory: History = item
      ? { ...item, name }
      : { name } as unknown as History;

    onSave(newHistory);
    setName("");
    setEditMode(false);
  };

  const handleNew = () => {
    setName("");
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form"]}>
      <div className={styles["form-row"]}>
        <label htmlFor="name">{t("histories.name")}:</label>
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
              {item ? t("histories.update") : t("histories.save")}
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
              {t("histories.cancel")}
            </button>
          </>
        ) : (
          <button type="button" onClick={handleNew} className={styles["button-new"]}>
            {t("histories.new")}
          </button>
        )}
      </div>
    </form>
  );
}
