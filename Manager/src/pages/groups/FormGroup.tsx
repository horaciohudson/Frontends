import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Group } from "../../models/Group";
import styles from "../../styles/groups/FormGroup.module.css";

interface FormGroupProps {
  group: Group | null;
  onSave: (group: Group) => void;
  onCancel: () => void;
}

export default function FormGroup({ group, onSave, onCancel }: FormGroupProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [name, setName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (group) {
      setName(group.name ?? "");
      setEditMode(true);
    } else {
      setName("");
      setEditMode(false);
    }
    inputRef.current?.focus();
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t("groups.nameRequired"));
      return;
    }

    const newGroup: Group = group
      ? { ...group, name }
      : { name };

    console.log("Form submitting group:", newGroup);
    onSave(newGroup);
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
        <label>{t("groups.name")}:</label>
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
              {group ? t("groups.update") : t("groups.save")}
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
              {t("groups.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleNew}
            className={styles["button-new"]}
          >
            {t("groups.new")}
          </button>
        )}
      </div>
    </form>
  );
}
