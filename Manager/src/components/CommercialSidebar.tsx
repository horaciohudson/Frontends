import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import styles from "../styles/components/CommercialSidebar.module.css";

const CommercialSidebar: React.FC = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.active : ""}`.trim();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <NavLink to="/" className={linkClass}>
              <span className={styles.emoji}>🏠</span>
              {t("sidebar.dashboard")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/reajustes" className={linkClass}>
              <span className={styles.emoji}>📦</span>
              {t("sidebar.adjustments")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/sellers" className={linkClass}>
              <span className={styles.emoji}>👨‍💼</span>
              {t("sidebar.sellers")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/stock-entry" className={linkClass}>
              <span className={styles.emoji}>📦</span>
              {t("sidebar.stockEntry")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/purchases" className={linkClass}>
              <span className={styles.emoji}>🌍</span>
              {t("sidebar.purchases")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/orders" className={linkClass}>
              <span className={styles.emoji}>📜</span>
              {t("sidebar.orders")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/sales" className={linkClass}>
              <span className={styles.emoji}>💡</span>
              {t("sidebar.officeSales")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/formas-cupom" className={linkClass}>
              <span className={styles.emoji}>💳</span>
              {t("sidebar.pos")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/fechamento-diario" className={linkClass}>
              <span className={styles.emoji}>🕘</span>
              {t("sidebar.dailyClose")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/transferencia-interna" className={linkClass}>
              <span className={styles.emoji}>📝</span>
              {t("sidebar.internalTransfer")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/comerciais/transferencia-externa" className={linkClass}>
              <span className={styles.emoji}>🏦</span>
              {t("sidebar.externalTransfer")}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default CommercialSidebar;
