import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import api from "../../service/api";
import { TRANSLATION_NAMESPACES } from "../../locales";
import Product, { mapProductFromApi } from "./Product";
import ProductFiscal from "./ProductFiscal";
import ProductCost from "./ProductCost";
import ProductFinancial from "./ProductFinancial";
import ProductHistory from "./ProductHistory";
import ProductPriceTab from "./ProductPriceTab";
import { ProductFormModel } from "../../models/Product";
import styles from "../../styles/products/ProductTabs.module.css";
// ...
export default function ProductTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [tab, setTab] = useState<"product" | "fiscal" | "cost" | "financial" | "history" | "price">("product");
  const [selectedProduct, setSelectedProduct] = useState<ProductFormModel | null>(null);

  const [searchParams] = useSearchParams();
  const tabsEnabled = !!selectedProduct;

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId && !selectedProduct) {
      console.log("🔗 Deep linking to product:", productId);
      api.get(`/products/${productId}`)
        .then(res => {
          const mapped = mapProductFromApi(res.data);
          setSelectedProduct(mapped);
          setTab("price");
        })
        .catch(err => console.error("❌ Error loading deep linked product:", err));
    }
  }, [searchParams, selectedProduct]);

  const handleSelectProduct = (product: ProductFormModel | null) => {
    console.log("🎯 Produto selecionado:", product);
    // ...
    setSelectedProduct(product);
  };

  const handleDoubleClickProduct = (product: ProductFormModel) => {
    // ...
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
        setTab("price");
      } else if (currentTab === "price") {
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
          className={`${styles.tab} ${tab === "price" ? styles.active : ""}`}
          onClick={() => tabsEnabled && setTab("price")}
          disabled={!tabsEnabled}
        >
          Preço de Venda
        </button>
      </div>
      <div className={styles.content}>
        {tab === "product" && <Product onSelectProduct={handleSelectProduct} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "fiscal" && selectedProduct && <ProductFiscal product={selectedProduct as any} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "cost" && selectedProduct && <ProductCost product={selectedProduct as any} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "financial" && selectedProduct && <ProductFinancial product={selectedProduct as any} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "history" && selectedProduct && <ProductHistory product={selectedProduct as any} onDoubleClickProduct={handleDoubleClickProduct} />}
        {tab === "price" && selectedProduct && (
          <ProductPriceTab product={selectedProduct as any} />
        )}
      </div>
    </div>
  );
}
