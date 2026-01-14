import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/suppliers/SupplierTabs.module.css";
import FormSupplier from "./FormSupplier";
import FormSupplierAddress from "./FormSupplierAddress";
import { Supplier } from "../../models/Supplier";
import api from "../../service/api";
import { TRANSLATION_NAMESPACES } from "../../locales";


export default function SupplierTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"supplier" | "address">("supplier");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);


  const load = async () => {
    const res = await api.get("/fornecedores");
    setSuppliers(res.data);
  };



  useEffect(() => {
    load();
  }, []);

  const handleEdit = (s: Supplier) => {
    setCurrentSupplier(s);
    setTab("supplier");
  };

  const handleSave = () => {
    load();
    setCurrentSupplier(null);
    setTab("supplier");
  };

  const tabsEnabled = !!currentSupplier;

  const companyName = currentSupplier
    ? suppliers.find((s) => s.supplierId === currentSupplier.companyId)?.tradeName
    : null;

  return (
    <div className={styles.container}>
      <h2>{t("suppliers.title")}</h2>
      {currentSupplier && (
        <div className={styles.activeSupplier}>
          {t("suppliers.activeSupplier")}: <strong>{companyName || `ID ${currentSupplier.supplierId}`}</strong>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "supplier" ? styles.active : ""}`}
          onClick={() => setTab("supplier")}
        >
          {t("suppliers.supplier")}
        </button>
        <button
          className={`${styles.tab} ${tab === "address" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("address")}
          disabled={!tabsEnabled}
        >
          {t("suppliers.address")}
        </button>
      </div>
      <div className={styles.content}>
        {tab === "supplier" && (
          <FormSupplier
            supplier={currentSupplier}
            suppliers={suppliers}
            onEdit={handleEdit}
            onSave={handleSave}
          />
        )}
        {tab === "address" && currentSupplier && (
          <FormSupplierAddress

            entityId={currentSupplier.supplierId!}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
