// src/pages/orders/OrderPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderDTO } from "../../models/Order";
import FormOrderTabs from "./FormOrderTabs";
import styles from "../../styles/orders/OrderPage.module.css";

export default function OrderPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  const handleOrderSaved = (order: OrderDTO) => {
    setSelectedOrder(order);
  };

  const handleOrderAfterSave = () => {
    // Additional logic after save if needed
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>{t("orders.title")}</h1>
      <FormOrderTabs
        order={selectedOrder}
        onOrderSaved={handleOrderSaved}
        onOrderAfterSave={handleOrderAfterSave}
      />
    </div>
  );
}
