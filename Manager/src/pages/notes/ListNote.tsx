import { Note } from "../../models/Note";
import styles from "../../styles/notes/ListNote.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
}

interface Props {
  items: Note[];
  onEdit: (item: Note) => void;
  onDelete: (id: number) => void;
}

export default function ListNote({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th>{t("notes.name")}</th>
          <th>{t("notes.createdAt")}</th>
          <th>{t("notes.updatedAt")}</th>
          <th>{t("notes.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.createdAt ? formatDate(item.createdAt) : "-"}</td>
              <td>{item.updatedAt ? formatDate(item.updatedAt) : "-"}</td>
              <td>
                <button onClick={() => onEdit(item)}>{t("notes.edit")}</button>
                <button onClick={() => onDelete(item.id)}>{t("notes.delete")}</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>{t("notes.noNotes")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
} 
