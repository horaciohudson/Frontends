import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import Product from "./Product";
import ProductFiscal from "./ProductFiscal";
import ProductCost from "./ProductCost";
import ProductFinancial from "./ProductFinancial";
import ProductHistory from "./ProductHistory";
import VariantGrid from "../../components/products/VariantGrid";
import { Product as ProductModel } from "../../models/Product";
import styles from "../../styles/products/ProductTabs.module.css";

export default function ProductTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"product" | "fiscal" | "cost" | "financial" | "history" | "variants">("product");
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(null);

  const tabsEnabled = !!selectedProduct;

  const handleSelectProduct = (product: ProductModel | null) => {
    console.log("🎯 Produto selecionado:", product);
    console.log("🆔 ID do produto:", product?.id);
    console.log("📝 Nome do produto:", product?.name);
    setSelectedProduct(product);
  };

  const handleDoubleClickProduct = (product: ProductModel) => {
    console.log("🖱️ Duplo clique no produto:", product);
    console.log("🆔 ID do produto (duplo clique):", product?.id);
    
    // Selecionar o produto primeiro
    setSelectedProduct(product);
    
    // Depois avançar para a próxima aba
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
        setTab("variants");
      } else if (currentTab === "variants") {
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

        <button
          className={`${styles.tab} ${tab === "variants" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("variants")}
          disabled={!tabsEnabled}
        >
          Variantes
        </button>
      </div>
      <div className={styles.content}>
        {tab === "product" && <Product onSelectProduct={handleSelectProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "fiscal" && selectedProduct && <ProductFiscal product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "cost" && selectedProduct && <ProductCost product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}     
        {tab === "financial" && selectedProduct && <ProductFinancial product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}       
        {tab === "history" && selectedProduct && <ProductHistory product={selectedProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "variants" && selectedProduct && (
          <div>
            <p>🔍 Debug: ProductId = {selectedProduct.id}</p>
            <VariantGrid productId={selectedProduct.id} />
          </div>
        )}                  
      </div>
    </div>
  );
}
