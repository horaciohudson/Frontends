import { Currency } from "../../models/Currency";
import styles from "../../styles/currencies/ListCurrency.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface ListCurrencyProps {
  currencies: Currency[];
  onEdit: (item: Currency) => void;
  onDelete: (id: number) => void;
}

export default function ListCurrency({ currencies, onEdit, onDelete }: ListCurrencyProps) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

  return (
    <table className={styles["currency-table"]}>
      <thead>
        <tr>
          <th>{t("currencies.name")}</th>
          <th>{t("currencies.code")}</th>
          <th>{t("currencies.symbol")}</th>
          <th>{t("currencies.active")}</th>
          <th>{t("currencies.actions")}</th>
        </tr>
      </thead>
      <tbody>
        {currencies.length > 0 ? currencies.map(currency => (
          <tr key={currency.id}>
            <td>{currency.name}</td>
            <td>{currency.code}</td>
            <td>{currency.symbol}</td>
            <td>{currency.active ? t("currencies.yes") : t("currencies.no")}</td>
            <td>
              <button onClick={() => onEdit(currency)}>{t("currencies.edit")}</button>
              <button onClick={() => onDelete(currency.id!)}>{t("currencies.delete")}</button>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan={5}>{t("currencies.noCurrencies")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
