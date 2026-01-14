// src/components/orders/FormOrderTabs.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderDTO } from "../../models/Order";
import { Customer } from "../../models/Customer";
import { getCustomers } from "../../service/Customer";
import { UUID } from "../../types/common";
import FormOrder from "./FormOrder";
import FormOrderItems from "./FormOrderItems";
import FormOrderAddress from "./FormOrderAddress";
import FormOrderContext from "./FormOrderContext";
import FormOrderFinancial from "./FormOrderFinancial";
import FormOrderItemCommission from "./FormOrderItemCommission";
import FormOrderItemContext from "./FormOrderItemContext";
import FormOrderItemDiscount from "./FormOrderItemDiscount";
import styles from "../../styles/orders/FormOrderTabs.module.css";

type Props = {
  order: OrderDTO | null;
  onOrderSaved: (order: OrderDTO) => void;
  onOrderAfterSave: (order: OrderDTO) => void;
};

type MainTab = "order" | "orderItems";

export default function FormOrderTabs({ order, onOrderSaved, onOrderAfterSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("order");
  const [activeOrderSubTab, setActiveOrderSubTab] = useState(0); // 0: Pedido, 1: Endereço, 2: Contexto, 3: Financeiro
  const [activeItemsSubTab, setActiveItemsSubTab] = useState(0); // 0: Item, 1: Endereço, 2: Contexto, 3: Desconto
  const [activeOrder, setActiveOrder] = useState<OrderDTO | null>(order);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<UUID | null>(null); // ID do item selecionado para sub-tabs
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderItemsEnabled, setOrderItemsEnabled] = useState(false);

  // Separating logic: selectedOrder enables sub-tabs, orderItemsEnabled controls Items tab
  const subTabsEnabled = !!selectedOrder;
  const orderItemsTabEnabled = orderItemsEnabled;

  // Load customers for name display
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getCustomers();
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };
    loadCustomers();
  }, []);

  const getCustomerName = (customerId?: UUID) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? customer.name : customerId;
  };

  const handleOrderSaved = (savedOrder: OrderDTO) => {
    // If savedOrder is empty (reset case), clear activeOrder and reset states
    if (!savedOrder || Object.keys(savedOrder).length === 0) {
      setActiveOrder(null);
      setSelectedOrder(null);
      setOrderItemsEnabled(false);
      setActiveMainTab("order");
      setActiveOrderSubTab(0);
    } else {
      setActiveOrder(savedOrder);
    }
    onOrderSaved(savedOrder);
  };

  const handleSelectOrder = (order: OrderDTO | null) => {
    setSelectedOrder(order);
  };

  const handleDoubleClickOrder = (order: OrderDTO) => {
    setSelectedOrder(order);
    setOrderItemsEnabled(true); // Enable Items tab only on double-click
    // Navigate to Items tab after a small delay
    setTimeout(() => {
      setActiveMainTab("orderItems");
      setActiveItemsSubTab(0); // Reset to main items form
    }, 100);
  };

  const handleMainTabClick = (mainTab: MainTab) => {
    if (mainTab === "order" || orderItemsTabEnabled) {
      setActiveMainTab(mainTab);
    }
  };

  const handleOrderSubTabClick = (subTabIndex: number) => {
    setActiveOrderSubTab(subTabIndex);
  };

  const handleItemsSubTabClick = (subTabIndex: number) => {
    // Se está tentando acessar sub-tabs (1, 2, 3) sem item selecionado, mostrar alerta
    if (subTabIndex > 0 && !selectedItemId) {
      alert('Por favor, selecione um item na grade antes de acessar esta opção.');
      return;
    }
    setActiveItemsSubTab(subTabIndex);
  };

  const handleItemSelected = (itemId: UUID | null) => {
    setSelectedItemId(itemId);
  };

  // Breadcrumb navigation function
  const getBreadcrumb = () => {
    const breadcrumbItems = [];

    // Always show "Pedidos" as root
    breadcrumbItems.push("Pedidos");

    // Show active customer if selected
    if (selectedOrder) {
      breadcrumbItems.push(getCustomerName(selectedOrder.customerId));
    }

    // Show main tab
    if (activeMainTab === "order") {
      breadcrumbItems.push(t("orders.formTab"));
      // Show sub-tab if not on main form
      if (activeOrderSubTab > 0) {
        const subTabNames = [
          "", // 0 is main form
          t("orderAddresses.title"),
          t("orderContexts.title"),
          t("orderFinancials.title")
        ];
        breadcrumbItems.push(subTabNames[activeOrderSubTab]);
      }
    } else if (activeMainTab === "orderItems") {
      breadcrumbItems.push(t("orderItems.title"));
      // Show sub-tab if not on main items form
      if (activeItemsSubTab > 0) {
        const subTabNames = [
          "", // 0 is main items form
          "Comissão", // Will add translation later
          t("orderContexts.title"),
          t("orderItems.discount")
        ];
        breadcrumbItems.push(subTabNames[activeItemsSubTab]);
      }
    }

    return breadcrumbItems;
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumb}>
        {getBreadcrumb().map((item, index, array) => (
          <span key={index} className={styles.breadcrumbItem}>
            {item}
            {index < array.length - 1 && <span className={styles.breadcrumbSeparator}> › </span>}
          </span>
        ))}
      </div>

      {/* Main Tabs */}
      <div className={styles.mainTabs}>
        <button
          className={`${styles.mainTab} ${activeMainTab === "order" ? styles.active : ''}`}
          onClick={() => handleMainTabClick("order")}
        >
          {t("orders.formTab")}
        </button>
        <button
          className={`${styles.mainTab} ${activeMainTab === "orderItems" ? styles.active : ''}`}
          onClick={() => handleMainTabClick("orderItems")}
          disabled={!orderItemsTabEnabled}
        >
          {t("orderItems.title")}
        </button>
      </div>

      {/* Sub Tabs */}
      {activeMainTab === "order" && subTabsEnabled && (
        <div className={styles.subTabs}>
          {activeOrderSubTab === 0 && (
            <>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleOrderSubTabClick(1)}
              >
                {t("orderAddresses.title")}
              </button>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleOrderSubTabClick(2)}
              >
                {t("orderContexts.title")}
              </button>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleOrderSubTabClick(3)}
              >
                {t("orderFinancials.title")}
              </button>
            </>
          )}
          {activeOrderSubTab > 0 && (
            <>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleOrderSubTabClick(0)}
              >
                ← {t("orders.formTab")}
              </button>
              <button
                className={`${styles.subTab} ${activeOrderSubTab === 1 ? styles.active : ''}`}
                onClick={() => handleOrderSubTabClick(1)}
              >
                {t("orderAddresses.title")}
              </button>
              <button
                className={`${styles.subTab} ${activeOrderSubTab === 2 ? styles.active : ''}`}
                onClick={() => handleOrderSubTabClick(2)}
              >
                {t("orderContexts.title")}
              </button>
              <button
                className={`${styles.subTab} ${activeOrderSubTab === 3 ? styles.active : ''}`}
                onClick={() => handleOrderSubTabClick(3)}
              >
                {t("orderFinancials.title")}
              </button>
            </>
          )}
        </div>
      )}

      {activeMainTab === "orderItems" && orderItemsTabEnabled && (
        <div className={styles.subTabs}>
          {activeItemsSubTab === 0 && (
            <>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleItemsSubTabClick(1)}
              >
                Comissão
              </button>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleItemsSubTabClick(2)}
              >
                {t("orderContexts.title")}
              </button>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleItemsSubTabClick(3)}
              >
                {t("orderItems.discount")}
              </button>
            </>
          )}
          {activeItemsSubTab > 0 && (
            <>
              <button
                className={`${styles.subTab}`}
                onClick={() => handleItemsSubTabClick(0)}
              >
                ← {t("orderItems.title")}
              </button>
              <button
                className={`${styles.subTab} ${activeItemsSubTab === 1 ? styles.active : ''}`}
                onClick={() => handleItemsSubTabClick(1)}
              >
                Comissão
              </button>
              <button
                className={`${styles.subTab} ${activeItemsSubTab === 2 ? styles.active : ''}`}
                onClick={() => handleItemsSubTabClick(2)}
              >
                {t("orderContexts.title")}
              </button>
              <button
                className={`${styles.subTab} ${activeItemsSubTab === 3 ? styles.active : ''}`}
                onClick={() => handleItemsSubTabClick(3)}
              >
                {t("orderItems.discount")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {/* Order Tab Content */}
        {activeMainTab === "order" && (
          <>
            {activeOrderSubTab === 0 && (
              <FormOrder
                item={activeOrder}
                onSaved={handleOrderSaved}
                onAfterSave={onOrderAfterSave}
                onSelectOrder={handleSelectOrder}
                onDoubleClickOrder={handleDoubleClickOrder}
              />
            )}
            {activeOrderSubTab === 1 && selectedOrder?.id && (
              <FormOrderAddress
                orderId={selectedOrder.id}
                customerName={getCustomerName(selectedOrder.customerId)}
              />
            )}
            {activeOrderSubTab === 2 && selectedOrder?.id && (
              <FormOrderContext
                orderId={selectedOrder.id}
                customerName={getCustomerName(selectedOrder.customerId)}
              />
            )}
            {activeOrderSubTab === 3 && selectedOrder?.id && (
              <FormOrderFinancial
                orderId={selectedOrder.id}
                customerName={getCustomerName(selectedOrder.customerId)}
              />
            )}
          </>
        )}

        {/* Order Items Tab Content */}
        {activeMainTab === "orderItems" && orderItemsTabEnabled && selectedOrder?.id && (
          <>
            {activeItemsSubTab === 0 && (
              <FormOrderItems
                orderId={selectedOrder.id}
                customerName={getCustomerName(selectedOrder.customerId)}
                onItemSelected={handleItemSelected}
              />
            )}
            {activeItemsSubTab === 1 && selectedItemId && (
              <FormOrderItemCommission orderItemId={selectedItemId} />
            )}
            {activeItemsSubTab === 2 && selectedItemId && (
              <FormOrderItemContext orderItemId={selectedItemId} />
            )}
            {activeItemsSubTab === 3 && selectedItemId && (
              <FormOrderItemDiscount orderItemId={selectedItemId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
