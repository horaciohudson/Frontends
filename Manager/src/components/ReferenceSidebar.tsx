import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import styles from "../styles/components/ReferenceSidebar.module.css";

const ReferenceSidebar: React.FC = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

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
            <NavLink to="/referenciais/groups" className={linkClass}>
              <span className={styles.emoji}>📦</span>
              {t("sidebar.groups")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/fiscal-codes" className={linkClass}>
              <span className={styles.emoji}>📜</span>
              {t("sidebar.fiscalCodes")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/tax-situations" className={linkClass}>
              <span className={styles.emoji}>💡</span>
              {t("sidebar.taxSituations")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/produtos-categorias" className={linkClass}>
              <span className={styles.emoji}>📂</span>
              Categorias de Produtos
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/tamanhos" className={linkClass}>
              <span className={styles.emoji}>📏</span>
              Tamanhos
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/cores" className={linkClass}>
              <span className={styles.emoji}>🎨</span>
              Cores
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/payment-methods" className={linkClass}>
              <span className={styles.emoji}>💳</span>
              {t("sidebar.paymentMethods")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/histories" className={linkClass}>
              <span className={styles.emoji}>🕘</span>
              {t("sidebar.histories")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/notes" className={linkClass}>
              <span className={styles.emoji}>📝</span>
              {t("sidebar.notes")}
            </NavLink>
          </li>                       
         
          <li className={styles.item}>
            <NavLink to="/referenciais/activities" className={linkClass}>
              <span className={styles.emoji}>⚙️</span>
              {t("sidebar.activities")}
            </NavLink>
          </li>
          <li className={styles.item}>
            <NavLink to="/referenciais/currencies" className={linkClass}>
              <span className={styles.emoji}>💱</span>
              {t("sidebar.currencies")}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ReferenceSidebar;
