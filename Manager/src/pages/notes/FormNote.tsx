import { useEffect, useRef, useState } from "react";
import { Note } from "../../models/Note";
import styles from "../../styles/notes/FormNote.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface Props {
  item: Note | null;
  onSave: (item: Note) => void;
  onCancel: () => void;
}

export default function FormNote({ item, onSave, onCancel }: Props) {
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
    const newNote: Note = item
      ? { ...item, name }
      : { name } as Note;

    onSave(newNote);
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
        <label>{t("notes.name")}:</label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editMode}
          required
        />

        {editMode ? (
          <>
            <button type="submit" className={styles.button}>
              {item ? t("notes.update") : t("notes.save")}
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
              {t("notes.cancel")}
            </button>
          </>
        ) : (
          <button type="button" onClick={handleNew} className={styles["button-new"]}>
            {t("notes.new")}
          </button>
        )}
      </div>
    </form>
  );
} 
