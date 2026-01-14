import { PaymentMethod } from "../../models/PaymentMethod";
import styles from "../../styles/paymentMethods/ListPaymentMethod.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
}

interface Props {
  items: PaymentMethod[];
  onEdit: (item: PaymentMethod) => void;
  onDelete: (id: number) => void;
}

export default function ListPaymentMethod({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  const handleDelete = (item: PaymentMethod) => {
    if (item.id && confirm(t("paymentMethods.confirmDelete"))) {
      onDelete(item.id);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("paymentMethods.code")}</th>
            <th>{t("paymentMethods.name")}</th>
            <th>{t("paymentMethods.kind")}</th>
            <th>{t("paymentMethods.maxInstallmentsNoInterest")}</th>
            <th>{t("paymentMethods.posEnabled")}</th>
            <th>{t("paymentMethods.active")}</th>
            <th>{t("paymentMethods.createdAt")}</th>
            <th>{t("paymentMethods.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map(item => (
            <tr key={item.id} className={!item.active ? styles.inactive : ""}>
              <td>
                <code className={styles.code}>{item.code}</code>
              </td>
              <td>
                <strong>{item.name}</strong>
              </td>
              <td>
                <span className={`${styles.badge} ${styles[`badge-${item.kind.toLowerCase()}`]}`}>
                  {t(`paymentMethods.kinds.${item.kind}`)}
                </span>
              </td>
              <td className={styles.center}>
                {item.maxInstallmentsNoInterest}x
                {item.maxInstallmentsWithInterest > 0 && (
                  <span className={styles.withInterest}>
                    {" "}(+{item.maxInstallmentsWithInterest}x c/ juros)
                  </span>
                )}
              </td>
              <td className={styles.center}>
                <span className={`${styles.status} ${item.posEnabled ? styles.enabled : styles.disabled}`}>
                  {item.posEnabled ? t("paymentMethods.yes") : t("paymentMethods.no")}
                </span>
              </td>
              <td className={styles.center}>
                <span className={`${styles.status} ${item.active ? styles.active : styles.inactive}`}>
                  {item.active ? t("paymentMethods.yes") : t("paymentMethods.no")}
                </span>
              </td>
              <td className={styles.date}>
                {formatDate(item.createdAt)}
              </td>
              <td className={styles.actions}>
                <button 
                  onClick={() => onEdit(item)}
                  className={styles.editButton}
                  title={t("paymentMethods.edit")}
                >
                  {t("paymentMethods.edit")}
                </button>
                <button 
                  onClick={() => handleDelete(item)}
                  className={styles.deleteButton}
                  title={t("paymentMethods.delete")}
                >
                  {t("paymentMethods.delete")}
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={8} className={styles.noData}>
                {t("paymentMethods.noPaymentMethods")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
