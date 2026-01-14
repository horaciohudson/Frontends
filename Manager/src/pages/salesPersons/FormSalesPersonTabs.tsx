import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormSalesPerson from "./FormSalesPerson";
import FormSalesPersonAddress from "./FormSalesPersonAddress";
import FormSalesPersonCommission from "./FormSalesPersonCommission";
import { SalesPerson } from "../../models/SalesPerson";
import styles from "../../styles/salesPersons/FormSalesPersonTabs.module.css";

export default function FormSalesPersonTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [tab, setTab] = useState<"general" | "address" | "commission">("general");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<SalesPerson | null>(null);

  const tabsEnabled = !!selectedSalesPerson;

  const handleSelectSalesPerson = (salesPerson: SalesPerson | null) => {
    setSelectedSalesPerson(salesPerson);
  };

  const handleDoubleClickSalesPerson = (salesPerson: SalesPerson) => {
    setSelectedSalesPerson(salesPerson);
    // Avança para a próxima aba após um pequeno delay
    setTimeout(() => {
      const currentTab = tab;
      if (currentTab === "general") {
        setTab("address");
      } else if (currentTab === "address") {
        setTab("commission");
      } else if (currentTab === "commission") {
        setTab("address"); // Volta para a primeira aba de dados
      }
    }, 100);
  };

  return (
    <div className={styles.container}>
      <h2>{t("salespersons.title")}</h2>
      {selectedSalesPerson && (
        <div className={styles.activeSalesPerson}>
          {t("salespersons.activeSalesPerson")}: <strong>{selectedSalesPerson.name} ({selectedSalesPerson.id})</strong>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "general" ? styles.active : ""}`}
          onClick={() => setTab("general")}
        >
          {t("salesperson.tabs.general")}
        </button>

        <button
          className={`${styles.tab} ${tab === "address" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("address")}
          disabled={!tabsEnabled}
        >
          {t("salesperson.tabs.address")}
        </button>

        <button
          className={`${styles.tab} ${tab === "commission" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("commission")}
          disabled={!tabsEnabled}
        >
          {t("salesperson.tabs.commission")}
        </button>
      </div>
      
      <div className={styles.content}>
        {tab === "general" && <FormSalesPerson onSelectSalesPerson={handleSelectSalesPerson} onDoubleClickSalesPerson={handleDoubleClickSalesPerson} />}
        {tab === "address" && selectedSalesPerson && <FormSalesPersonAddress selectedSalesPerson={selectedSalesPerson} onDoubleClickSalesPerson={handleDoubleClickSalesPerson} />}
        {tab === "commission" && selectedSalesPerson && <FormSalesPersonCommission selectedSalesPerson={selectedSalesPerson} onDoubleClickSalesPerson={handleDoubleClickSalesPerson} />}
      </div>
    </div>
  );
}
