import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import FormProductCategory from "./FormProductCategory";
import FormProductSubcategory from "./FormProductSubcategory";
import FormProductSize from "./FormProductSize";
import FormProductSizeColors from "./FormProductSizeColors";
import { ProductCategory } from "../../models/ProductCategory";
import { ProductSubcategory } from "../../models/ProductSubcategory";
import { ProductSize } from "../../models/ProductSize";

import styles from "../../styles/productAccessories/FormProductAccessoryTabs.module.css";

export default function FormProductAccessoryTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [activeTab, setActiveTab] = useState<"category" | "subcategory" | "size" | "colors">("category");

  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<ProductSubcategory | null>(null);
  const [activeSize, setActiveSize] = useState<ProductSize | null>(null);

  const enabledTabs = {
    subcategory: !!activeCategory,
    size: !!activeSubcategory,
    colors: !!activeSize, // Cores dependem do tamanho selecionado
  };

  return (
    <div className={styles.container}>
      <h2>{t("productAccessories.title")}</h2>

      {activeCategory && (
        <div className={styles.activeCategory}>
          {t("productAccessories.activeCategory")}: <strong>{activeCategory.name} / {activeCategory.id}</strong> &nbsp;
        </div>
      )}

      {activeSubcategory && (
        <div className={styles.activeSubcategory}>
          {t("productAccessories.activeSubcategory")}: <strong>{activeSubcategory.name} / {activeSubcategory.id}</strong> &nbsp;
        </div>
      )}

      {activeSize && (
        <div className={styles.activeSize}>
          📏 Tamanho Selecionado: <strong>{activeSize.size}</strong> (Estoque: <strong>{activeSize.stock || 0}</strong> peças)
        </div>
      )}

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "category" ? styles.active : ""}`} 
          onClick={() => setActiveTab("category")}
        >
          {t("productAccessories.category")}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "subcategory" ? styles.active : ""}`} 
          onClick={() => enabledTabs.subcategory && setActiveTab("subcategory")} 
          disabled={!enabledTabs.subcategory}
        >
          {t("productAccessories.subcategory")}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "size" ? styles.active : ""}`} 
          onClick={() => enabledTabs.size && setActiveTab("size")} 
          disabled={!enabledTabs.size}
        >
          {t("productAccessories.size")}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "colors" ? styles.active : ""}`} 
          onClick={() => enabledTabs.colors && setActiveTab("colors")}
          disabled={!enabledTabs.colors}
        >
          Cores
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "category" && (
          <FormProductCategory 
            onSelectCategory={(category) => {
              setActiveCategory(category as any);
              setActiveSubcategory(null);
              setActiveSize(null);
            }}
            onDoubleClickCategory={(category) => {
              setActiveCategory(category as any);
              setActiveSubcategory(null);
              setActiveSize(null);
              // Automaticamente avança para a próxima aba
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
              setActiveSubcategory(subcategory);
              setActiveSize(null);
            }}
            onDoubleClickSubcategory={(subcategory) => {
              setActiveSubcategory(subcategory);
              // Automaticamente avança para a próxima aba
              if (subcategory) {
                setTimeout(() => setActiveTab("size"), 100);
              }
            }}
          />
        )}

        {activeTab === "size" && activeSubcategory && (
          <FormProductSize
            subcategory={activeSubcategory}
            onSelectSize={(size) => {
              setActiveSize(size);
            }}
            onDoubleClickSize={(size) => {
              setActiveSize(size);
              // Automaticamente avança para a aba de cores
              if (size) {
                setTimeout(() => setActiveTab("colors"), 100);
              }
            }}
          />
        )}

        {activeTab === "colors" && activeSize && (
          <FormProductSizeColors
            productId={1} // TODO: Implementar seleção de produto
            size={activeSize}
          />
        )}
      </div>
    </div>
  );
}
