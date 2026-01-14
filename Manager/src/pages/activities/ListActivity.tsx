import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Activity } from "../../models/Activity";
import styles from "../../styles/activities/ListActivity.module.css";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US");
}

interface ListActivityProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

export default function ListActivity({ activities, onEdit, onDelete }: ListActivityProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th>{t("activities.name")}</th>
          <th>{t("activities.createdAt")}</th>
          <th>{t("activities.updatedAt")}</th>
          <th>{t("activities.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <tr key={activity.id}>
              <td>{activity.name}</td>
              <td>{activity.createdAt ? formatDate(activity.createdAt) : "-"}</td>
              <td>{activity.updatedAt ? formatDate(activity.updatedAt) : "-"}</td>
              <td>
                <button onClick={() => onEdit(activity)}>{t("activities.edit")}</button>
                <button onClick={() => onDelete(activity.id)}>{t("activities.delete")}</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>{t("activities.noActivities")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
