import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Activity } from "../../models/Activity";
import styles from "../../styles/activities/FormActivity.module.css";

interface FormActivityProps {
  activity: Activity | null;
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

export default function FormActivity({ activity, onSave, onCancel }: FormActivityProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [name, setName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activity) {
      setName(activity.name ?? "");
      setEditMode(true);
    } else {
      setName("");
      setEditMode(false);
    }
    inputRef.current?.focus();
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t("activities.nameRequired"));
      return;
    }

    const newActivity: Activity = activity
      ? { ...activity, name }
      : { name } as Activity;

    onSave(newActivity);
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
        <label htmlFor="name">{t("activities.name")}:</label>
        <input
          ref={inputRef}
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editMode}
          required
        />
      </div>
      
      <div className={styles["form-buttons"]}>
        {editMode ? (
          <>
            <button type="submit" className={styles.button}>
              {activity ? t("activities.update") : t("activities.save")}
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
              {t("activities.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleNew}
            className={styles["button-new"]}
          >
            {t("activities.new")}
          </button>
        )}
      </div>
    </form>
  );
}
