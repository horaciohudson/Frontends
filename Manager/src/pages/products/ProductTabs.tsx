import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import Product from "./Product";
import ProductFiscal from "./ProductFiscal";
import ProductCost from "./ProductCost";
import { Product as ProductModel } from "../../models/Product";
import styles from "../../styles/products/ProductTabs.module.css";
import ProductFinancial from "./ProductFinancial";
import ProductHistory from "./ProductHistory";

export default function ProductTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"product" | "fiscal" | "cost" | "financial" | "history">("product");
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(null);

  const tabsEnabled = !!selectedProduct;

  const handleSelectProduct = (product: ProductModel | null) => {
    setSelectedProduct(product);
    console.log("Product selected:", product);
  };

  const handleDoubleClickProduct = (product: ProductModel) => {
    setSelectedProduct(product);
    // Avança para a próxima aba após um pequeno delay
    setTimeout(() => {
      const currentTab = tab;
      if (currentTab === "product") {
        setTab("fiscal");
      } else if (currentTab === "fiscal") {
        setTab("cost");
      } else if (currentTab === "cost") {
        setTab("financial");
      } else if (currentTab === "financial") {
        setTab("history");
      } else if (currentTab === "history") {
        setTab("fiscal"); // Volta para a primeira aba de dados
      }
    }, 100);
  };

  return (
    <div className={styles.container}>
      <h2>{t("products.title")}</h2>
      {selectedProduct && (
        <div className={styles.activeProduct}>
          {t("products.activeProduct")}: <strong>{selectedProduct.name} ({selectedProduct.id})</strong>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "product" ? styles.active : ""}`}
          onClick={() => setTab("product")}
        >
          {t("products.name")}
        </button>

        <button
          className={`${styles.tab} ${tab === "fiscal" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("fiscal")}
          disabled={!tabsEnabled}
        >
          {t("productFiscal.title")}
        </button>

        <button
          className={`${styles.tab} ${tab === "cost" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("cost")}
          disabled={!tabsEnabled}
        >
          {t("productCost.title")}
        </button>

        <button
          className={`${styles.tab} ${tab === "financial" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("financial")}
          disabled={!tabsEnabled}
        >
          {t("productFinancial.title")}
        </button>
      
        <button
          className={`${styles.tab} ${tab === "history" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("history")}
          disabled={!tabsEnabled}
        >
          {t("productHistory.title")}
        </button>
      </div>
      <div className={styles.content}>
        {tab === "product" && <Product onSelectProduct={handleSelectProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "fiscal" && selectedProduct && <ProductFiscal product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "cost" && selectedProduct && <ProductCost product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}     
        {tab === "financial" && selectedProduct && <ProductFinancial product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}       
        {tab === "history" && selectedProduct && <ProductHistory product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}                  
      </div>
    </div>
  );
}
