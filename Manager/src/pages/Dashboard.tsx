import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import "../styles/Dashboard.module.css";

export default function Dashboard() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMON);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff' }}>
      <h2>{t("dashboard.title")}</h2>
      <p>{t("dashboard.subtitle")}</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ flex: 1, backgroundColor: '#e0f7fa', padding: '1rem', borderRadius: '8px' }}>
          <h3>{t("dashboard.products.title")}</h3>
          <p>{t("dashboard.products.count")}</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
          <h3>{t("dashboard.customers.title")}</h3>
          <p>{t("dashboard.customers.count")}</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
          <h3>{t("dashboard.revenue.title")}</h3>
          <p>{t("dashboard.revenue.amount")}</p>
        </div>
      </div>
    </div>
  );
}
