import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import styles from "../styles/components/MainSidebar.module.css";

const MainSidebar: React.FC = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

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
            <NavLink to="/principais/customers" className={linkClass}>
              <span className={styles.emoji}>👥</span>
              {t("sidebar.customers")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/companies" className={linkClass}>
              <span className={styles.emoji}>🏢</span>
              {t("sidebar.companies")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/products" className={linkClass}>
              <span className={styles.emoji}>📦</span>
              {t("sidebar.products")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/product-management" className={linkClass}>
              <span className={styles.emoji}>📊</span>
              {t("sidebar.productManagement")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/stock-management" className={linkClass}>
              <span className={styles.emoji}>📈</span>
              {t("sidebar.stockManagement")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/raw-materials" className={linkClass}>
              <span className={styles.emoji}>🧵</span>
              {t("sidebar.rawMaterials")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/compositions" className={linkClass}>
              <span className={styles.emoji}>🧪</span>
              {t("sidebar.compositions")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/services" className={linkClass}>
              <span className={styles.emoji}>🛠️</span>
              {t("sidebar.services")}
            </NavLink>
          </li>

          <li className={styles.item}>
            <NavLink to="/principais/modulos" className={linkClass}>
              <span className={styles.emoji}>🧭</span>
              {t("sidebar.modules")}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default MainSidebar;