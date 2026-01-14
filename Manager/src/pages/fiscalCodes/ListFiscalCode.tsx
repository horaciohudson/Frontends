import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/fiscalCodes/ListFiscalCode.module.css";
import { FiscalCode } from "../../models/FiscalCode";

interface Props {
  items: FiscalCode[];
  onEdit: (item: FiscalCode) => void;
  onDelete: (id: number) => void;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

export default function ListFiscalCode({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  return (
    <table className={styles["fiscal-code-table"]}>
      <thead>
        <tr>
          <th>{t("fiscalCodes.name")}</th>
          <th>{t("fiscalCodes.code")}</th>
          <th>{t("fiscalCodes.description")}</th>
          <th>ICMS</th>
          <th>Fora do Estabelecimento</th>
          <th>Funrural</th>
          <th>IPI</th>
          <th>SICM</th>
          <th>{t("fiscalCodes.createdAt")}</th>
          <th>{t("fiscalCodes.updatedAt")}</th>
          <th>{t("fiscalCodes.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={11}>{t("fiscalCodes.noFiscalCodes")}</td>
          </tr>
        ) : (
          items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.cfop}</td>
              <td>{item.control}</td>
              <td>{item.icmsCalc}</td>
              <td>{item.outOfEstablishment}</td>
              <td>{item.funruralCalc}</td>
              <td>{item.ipiCalc}</td>
              <td>{item.sicmCalc}</td>
              <td>{item.createdAt ? formatDate(item.createdAt) : "-"}</td>
              <td>{item.updatedAt ? formatDate(item.updatedAt) : "-"}</td>
              <td>
                <button onClick={() => onEdit(item)}>{t("fiscalCodes.edit")}</button>
                <button onClick={() => onDelete(item.id!)}>{t("fiscalCodes.delete")}</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
