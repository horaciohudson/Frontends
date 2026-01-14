import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormComposition from "./FormComposition";
import FormCompositionItem from "./FormCompositionItem";
import { Composition } from "../../models/Composition";
import styles from "../../styles/compositions/FormCompositionTabs.module.css";
import { TRANSLATION_NAMESPACES } from "../../locales";

export default function FormCompositionTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"composition" | "composition-items">("composition");
  const [selectedComposition, setSelectedComposition] = useState<Composition | null>(null);

  const tabsEnabled = !!selectedComposition;

  const handleSelectComposition = (composition: Composition | null) => {
    setSelectedComposition(composition);
    console.log("Selected composition:", composition);
  };

  const handleDoubleClickComposition = (composition: Composition) => {
    setSelectedComposition(composition);
    // Navega para a aba de itens após um pequeno delay
    setTimeout(() => {
      setTab("composition-items");
    }, 100);
  };

  return (
    <div className={styles.container}>
      <h2>{t("compositions.title")}</h2>
      {selectedComposition && (
        <div className={styles.composicaoAtivo}>
          {t("compositions.activeComposition")}: <strong>{selectedComposition.name} ({selectedComposition.id})</strong>
        </div>
      )}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${tab === "composition" ? styles.ativa : ""}`}
          onClick={() => setTab("composition")}
        >
          {t("compositions.composition")}
        </button>
        <button
          className={`${styles.aba} ${tab === "composition-items" ? styles.ativa : ""}`}
          onClick={() => tabsEnabled && setTab("composition-items")}
          disabled={!tabsEnabled}
        >
          {t("compositions.items")}
        </button>
      </div>
      <div className={styles.conteudo}>
        {tab === "composition" && <FormComposition onSelectComposition={handleSelectComposition} onDoubleClickComposition={handleDoubleClickComposition} />}
        {tab === "composition-items" && selectedComposition && <FormCompositionItem composition={selectedComposition} />}           
      </div>
    </div>
  );
}
