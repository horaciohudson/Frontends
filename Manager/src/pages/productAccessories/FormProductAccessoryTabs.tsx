import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormProductCategory from "./FormProductCategory";
import FormProductSubcategory from "./FormProductSubcategory";
import { ProductCategory } from "../../models/ProductCategory";
import { ProductSubcategory } from "../../models/ProductSubcategory";
import styles from "../../styles/productAccessories/FormProductAccessoryTabs.module.css";

export default function FormProductAccessoryTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [activeTab, setActiveTab] = useState<"category" | "subcategory">("category");

  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);

  const enabledTabs = {
    subcategory: !!activeCategory,
  };

  return (
    <div className={styles.container}>
      <h2>Categorias de Produtos</h2>

      {activeCategory && (
        <div className={styles.activeCategory}>
          Categoria Selecionada: <strong>{activeCategory.name}</strong> (ID: {activeCategory.id})
        </div>
      )}

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "category" ? styles.active : ""}`} 
          onClick={() => setActiveTab("category")}
        >
          Categorias
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "subcategory" ? styles.active : ""}`} 
          onClick={() => enabledTabs.subcategory && setActiveTab("subcategory")} 
          disabled={!enabledTabs.subcategory}
        >
          Subcategorias
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "category" && (
          <FormProductCategory 
            onSelectCategory={(category) => {
              setActiveCategory(category as any);
            }}
            onDoubleClickCategory={(category) => {
              setActiveCategory(category as any);
              // Automaticamente avança para a aba de subcategorias
              if (category) {
                setTimeout(() => setActiveTab("subcategory"), 100);
              }
            }}
          />
        )}

        {activeTab === "subcategory" && activeCategory && (
          <FormProductSubcategory
            category={activeCategory}
            onSelectSubcategory={(subcategory) => {
              // Callback quando uma subcategoria é selecionada
              console.log("Subcategoria selecionada:", subcategory);
            }}
            onDoubleClickSubcategory={(subcategory) => {
              // Callback quando uma subcategoria é clicada duas vezes
              console.log("Subcategoria clicada duas vezes:", subcategory);
            }}
          />
        )}
      </div>
    </div>
  );
}
