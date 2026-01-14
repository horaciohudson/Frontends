import { Group } from "../../models/Group";
import styles from "../../styles/groups/ListGroup.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
}

interface Props {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (id: number) => void;
}

export default function ListGroup({ groups, onEdit, onDelete }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th>{t("groups.name")}</th>
          <th>{t("groups.createdAt")}</th>
          <th>{t("groups.updatedAt")}</th>
          <th>{t("groups.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(groups) && groups.length > 0 ? (
          groups.map((group) => (
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{group.createdAt ? formatDate(group.createdAt) : "-"}</td>
              <td>{group.updatedAt ? formatDate(group.updatedAt) : "-"}</td>
              <td>
                <button onClick={() => onEdit(group)}>{t("groups.edit")}</button>
                <button onClick={() => onDelete(group.id)}>{t("groups.delete")}</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>{t("groups.noGroups")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
