import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormCustomer from "./FormCustomer";
import FormCustomerPhysical from "./FormCustomerPhysical";
import FormCustomerAddress from "./FormCustomerAddress";
import FormCustomerLegal from "./FormCustomerLegal";
import FormCustomerProfessional from "./FormCustomerProfessional";
import FormCustomerFinancial from "./FormCustomerFinancial";
import FormCustomerPhoto from "./FormCustomerPhoto";
import { Customer } from "../../models/Customer";
import styles from "../../styles/customers/CustomerTabs.module.css";

export default function CustomerTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [activeTab, setActiveTab] = useState<"customer" | "physical" | "legal" | "address" | "professional" | "financial" | "photo">("customer");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const tabsEnabled = !!selectedCustomer;

  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    console.log("🎯 Customer selected:", customer);
  };

  const handleDataSaved = () => {
    console.log("💾 Data saved, refreshing customer data...");
    // Força um refresh dos dados quando algo é salvo nas abas
  };

  return (
    <div className={styles.container}>
      <h2>{t("customers.title")}</h2>
      {selectedCustomer && (
        <div className={styles.activeCustomer}>
          {t("customers.activeCustomer")}: <strong>{selectedCustomer.name} ({selectedCustomer.email})</strong>
          <br />
          <small>Customer ID: {selectedCustomer.customerId}</small>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "customer" ? styles.active : ""}`}
          onClick={() => setActiveTab("customer")}
        >
          {t("customers.customer")}
        </button>

        <button
          className={`${styles.tab} ${activeTab === "physical" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("physical")}
          disabled={!tabsEnabled}
        >
          {t("customers.physical")}
        </button>

        <button
          className={`${styles.tab} ${activeTab === "legal" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("legal")}
          disabled={!tabsEnabled}
        >
          {t("customers.legal")}
        </button>
      
        <button
          className={`${styles.tab} ${activeTab === "address" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("address")}
          disabled={!tabsEnabled}
        >
          {t("customers.address")}
        </button>
    
        <button
          className={`${styles.tab} ${activeTab === "professional" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("professional")}
          disabled={!tabsEnabled}
        >
          {t("customers.professional")}
        </button>

        <button
          className={`${styles.tab} ${activeTab === "financial" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("financial")}
          disabled={!tabsEnabled}
        >
          {t("customers.financial")}
        </button>

        <button
          className={`${styles.tab} ${activeTab === "photo" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setActiveTab("photo")}
          disabled={!tabsEnabled}
        >
          {t("customers.photo")}
        </button>
      </div>
      <div className={styles.content}>
        {activeTab === "customer" && <FormCustomer onSelectCustomer={handleSelectCustomer} />}
        {activeTab === "physical" && selectedCustomer && <FormCustomerPhysical customer={selectedCustomer} onSave={handleDataSaved} />}
        {activeTab === "legal" && selectedCustomer && <FormCustomerLegal customer={selectedCustomer} onSave={handleDataSaved} />}
        {activeTab === "address" && selectedCustomer && <FormCustomerAddress customer={selectedCustomer} onSave={handleDataSaved} />}
        {activeTab === "professional" && selectedCustomer && <FormCustomerProfessional customer={selectedCustomer} onSave={handleDataSaved} />}
        {activeTab === "financial" && selectedCustomer && <FormCustomerFinancial customer={selectedCustomer} onSave={handleDataSaved} />}
        {activeTab === "photo" && selectedCustomer && <FormCustomerPhoto customer={selectedCustomer} onSave={handleDataSaved} />}
      </div>
    </div>
  );
}
