import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/companies/CompanyTabs.module.css";
import FormCompany from "./FormCompany";
import FormCompanyAddress from "./FormCompanyAddress";
import { Company } from "../../models/Company";
import api from "../../service/api";

export default function CompanyTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"company" | "address">("company");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  const load = async () => {
    try {
      console.log("📤 Loading companies...");
      const res = await api.get("/companies");
      setCompanies(res.data);
      console.log("📥 Companies received:", JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.error("Error loading companies:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (c: Company) => {
    console.log("✏️ Editing company:", JSON.stringify(c, null, 2));
    setCurrentCompany(c);
    setTab("company");
  };

  const handleSave = async () => {
    console.log("💾 Handling save operation...");
    
    // Wait a bit to allow the save operation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload data only if necessary
    if (currentCompany) {
      try {
        // Try to get updated data for the current company
        const res = await api.get(`/companies/${currentCompany.id}`);
        const updatedCompany = res.data;
        
        // Update the current company if there are changes
        setCurrentCompany(updatedCompany);
        
        // Update the companies list
        setCompanies(prev => 
          prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
        );
        
        console.log("✅ Company data updated successfully");
      } catch (err) {
        console.warn("Could not refresh current company, falling back to full reload:", err);
        // Fallback to full reload
        load();
      }
    } else {
      // If no company is selected, reload everything
      load();
    }
    
    setCurrentCompany(null);
    setTab("company");
  };

  const tabsEnabled = !!currentCompany;

  return (
    <div className={styles.container}>
      <h2>{t("companies.title")}</h2>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "company" ? styles.active : ""}`}
          onClick={() => setTab("company")}
        >
          {t("companies.company")}
        </button>
        <button
          className={`${styles.tab} ${tab === "address" ? styles.active : ""}`}
          onClick={() => setTab("address")}
          disabled={!tabsEnabled}
        >
          {t("companies.address")}
        </button>
      </div>

      <div className={styles.content}>
        {tab === "company" && (
          <FormCompany
            company={currentCompany}
            companies={companies}
            onEdit={handleEdit}
            onSave={handleSave}
          />
        )}
        {tab === "address" && currentCompany && (
          <FormCompanyAddress
            entityType="company"
            entityId={currentCompany.id!}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
