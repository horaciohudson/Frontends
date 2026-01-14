// components/taxSituations/ListTaxSituation.tsx
import { TaxSituation } from "../../models/taxSituation";
import styles from "../../styles/taxSituations/ListTaxSituation.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface ListTaxSituationProps {
  items: TaxSituation[];
  onEdit: (item: TaxSituation) => void;
  onDelete: (id: number) => void;
}

function formatDate(iso: string | Date | null | undefined) {
  if (!iso) return "-";
  try {
    const date = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function ListTaxSituation({ items, onEdit, onDelete }: ListTaxSituationProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("taxSituations.code")}</th>
            <th>{t("taxSituations.name")}</th>
            <th>{t("taxSituations.createdAt")}</th>
            <th>{t("taxSituations.updatedAt")}</th>
            <th>{t("taxSituations.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td>{formatDate(item.updatedAt)}</td>
                <td>
                  <button onClick={() => onEdit(item)} className={styles["button-edit"]}>
                    {t("taxSituations.edit")}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className={styles["button-delete"]}
                  >
                    {t("taxSituations.delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                {t("taxSituations.noTaxSituations")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}