

import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { History } from "../../models/History";
import styles from "../../styles/histories/ListHistory.module.css";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
}

interface Props {
  items: History[];
  onEdit: (item: History) => void;
  onDelete: (id: number) => void;
}

export default function ListHistory({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th>{t("histories.name")}</th>
          <th>{t("histories.createdAt")}</th>
          <th>{t("histories.updatedAt")}</th>
          <th>{t("histories.actions")}</th>
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
                <button onClick={() => onEdit(item)}>{t("histories.edit")}</button>
                <button onClick={() => onDelete(item.id)}>{t("histories.delete")}</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>{t("histories.noHistories")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
