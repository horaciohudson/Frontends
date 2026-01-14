import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormPurchaseTabs from "./FormPurchaseTabs";
import styles from "../../styles/purchases/PurchasePage.module.css";

export default function FormPurchasePage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>{t("purchases.title")}</h1>
      <FormPurchaseTabs />
    </div>
  );
}
