import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormPurchase from "./FormPurchase";
import FormPurchaseItem from "./FormPurchaseItem";
import { Purchase } from "../../models/Purchase";
import styles from "../../styles/purchases/FormPurchaseTabs.module.css";

type TabType = "purchase" | "purchase-items";

export default function FormPurchaseTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);

  const [tab, setTab] = useState<TabType>("purchase");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const tabsEnabled = !!selectedPurchase;

  const handleSelectPurchase = (purchase: Purchase | null) => {
    setSelectedPurchase(purchase);
  };

  const handleDoubleClickPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    // Avança para a próxima aba após um pequeno delay
    setTimeout(() => {
      const currentTab = tab;
      if (currentTab === "purchase") {
        setTab("purchase-items");
      } else if (currentTab === "purchase-items") {
        setTab("purchase");
      }
    }, 100);
  };

  return (
    <div className={styles.container}>
      {selectedPurchase && (
        <div className={styles.activePurchase}>
          {t("purchases.activePurchase")}: <strong>{selectedPurchase.invoiceNumber || t("noData", { ns: "common" })} ({selectedPurchase.id})</strong>
        </div>
      )}
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "purchase" ? styles.active : ""}`}
          onClick={() => setTab("purchase")}
        >
          {t("purchases.formTab")}
        </button>

        <button
          className={`${styles.tab} ${tab === "purchase-items" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("purchase-items")}
          disabled={!tabsEnabled}
        >
          {t("purchases.itemsTab")}
        </button>
      </div>
      
      <div className={styles.content}>
        {tab === "purchase" && <FormPurchase onSelectPurchase={handleSelectPurchase} onDoubleClickPurchase={handleDoubleClickPurchase} />}
        {tab === "purchase-items" && selectedPurchase && <FormPurchaseItem purchase={selectedPurchase} onDoubleClickPurchase={handleDoubleClickPurchase} />}
      </div>
    </div>
  );
}
