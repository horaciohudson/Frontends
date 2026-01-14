import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { RawMaterial } from "../../models/RawMaterial";

import styles from "../../styles/rawMaterials/FormRawMaterialTabs.module.css";
import FormRawMaterialMeasure from "./FormRawMaterialMeasure";
import FormRawMaterialDetail from "./FormRawMaterialDetail";
import FormRawMaterial from "./FormRawMaterial";
import FormRawMaterialTax from "./FormRawMaterialTax";
import { TRANSLATION_NAMESPACES } from "../../locales";


export default function RawMaterialTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"rawMaterial" | "taxes" | "measures" | "details" >("rawMaterial");
  const [selectedRawMaterial, setSelectedRawMaterial] = useState<RawMaterial | null>(null);

  const tabsEnabled = !!selectedRawMaterial;

  // Monitorar mudanças no estado da aba
  useEffect(() => {
    console.log("🔄 Estado da aba alterado para:", tab);
  }, [tab]);

  // Log do estado atual
  console.log("📊 Estado atual - Tab:", tab, "RawMaterial:", selectedRawMaterial?.name);

  const handleSelectRawMaterial = (rawMaterial: RawMaterial | null) => {
    setSelectedRawMaterial(rawMaterial);
    console.log("Raw Material selected:", rawMaterial);
  };

  const handleDoubleClickRawMaterial = (rawMaterial: RawMaterial) => {
    setSelectedRawMaterial(rawMaterial);
    // Navegar para a primeira aba de detalhes (taxes)
    setTab("taxes");
    console.log("Raw Material double-clicked, navigating to taxes tab:", rawMaterial);
  };

  const handleDoubleClickTax = (rawMaterial: RawMaterial) => {
    console.log("🎯 handleDoubleClickTax chamado com:", rawMaterial);
    console.log("📋 Estado atual da aba ANTES:", tab);
    setSelectedRawMaterial(rawMaterial);
    setTab("measures");
    console.log("✅ Tab alterada para 'measures'");
    console.log("📋 Estado atual da aba DEPOIS:", "measures");
  };

  const handleDoubleClickMeasure = (rawMaterial: RawMaterial) => {
    console.log("🎯 handleDoubleClickMeasure chamado com:", rawMaterial);
    console.log("📋 Estado atual da aba ANTES:", tab);
    setSelectedRawMaterial(rawMaterial);
    setTab("details");
    console.log("✅ Tab alterada para 'details'");
    console.log("📋 Estado atual da aba DEPOIS:", "details");
  };

  return (
    <div className={styles.container}>
      <h2>{t("rawMaterials.title")}</h2>
      {selectedRawMaterial && (
        <div className={styles.materiaPrimaAtivo}>
          {t("rawMaterials.activeRawMaterial")}: <strong>{selectedRawMaterial.name} ({selectedRawMaterial.idRawMaterial})</strong>
        </div>
      )}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${tab === "rawMaterial" ? styles.ativa : ""}`}
          onClick={() => setTab("rawMaterial")}
        >
          {t("rawMaterials.rawMaterial")}
        </button>
        <button
          className={`${styles.aba} ${tab === "taxes" ? styles.ativa : ""}`}
          onClick={() => tabsEnabled && setTab("taxes")}
          disabled={!tabsEnabled}
        >
          {t("rawMaterials.taxes")}
        </button>
        <button
          className={`${styles.aba} ${tab === "measures" ? styles.ativa : ""}`}
          onClick={() => tabsEnabled && setTab("measures")}
          disabled={!tabsEnabled}
        >
          {t("rawMaterials.measures")}
        </button>
        <button
          className={`${styles.aba} ${tab === "details" ? styles.ativa : ""}`}
          onClick={() => tabsEnabled && setTab("details")}
          disabled={!tabsEnabled}
        >
          {t("rawMaterials.details")}
        </button>        
      </div>
      <div className={styles.conteudo}>
        {tab === "rawMaterial" && (
          <FormRawMaterial 
            onSelectRawMaterial={handleSelectRawMaterial}
            onDoubleClickRawMaterial={handleDoubleClickRawMaterial}
          />
        )}
        {tab === "taxes" && selectedRawMaterial && (
          <FormRawMaterialTax 
            rawMaterial={selectedRawMaterial} 
            onDoubleClickRawMaterial={handleDoubleClickTax}
          />
        )}
        {tab === "measures" && selectedRawMaterial && (
          <FormRawMaterialMeasure 
            rawMaterial={selectedRawMaterial} 
            onDoubleClickRawMaterial={handleDoubleClickMeasure}
          />
        )}
        {tab === "details" && selectedRawMaterial && (
          <FormRawMaterialDetail 
            rawMaterial={selectedRawMaterial} 
          />
        )}       
      </div>
    </div>
  );
}
