import { Market } from "../../models/Market";
import styles from "../../styles/markets/ListMarket.module.css";
import { useTranslation } from "react-i18next";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
}

interface Props {
  items: Market[];
  onEdit: (item: Market) => void;
  onDelete: (id: number) => void;
}

export default function ListMarket({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th>{t("market.name")}</th>
          <th>{t("market.createdAt")}</th>
          <th>{t("market.updatedAt")}</th>
          <th>{t("market.actions")}</th>
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
                <button onClick={() => onEdit(item)}>{t("market.edit")}</button>
                <button onClick={() => onDelete(item.id)}>{t("market.delete")}</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4}>{t("market.noMarkets")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
} 
