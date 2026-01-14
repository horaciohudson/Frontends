// src/components/order-items/FormOrderItemTabs.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Tabs from "../../components/ui/Tabs";
import { OrderItemDTO } from "../../models";
import FormOrderItem from "../orders/FormOrderItem";
import FormOrderItemCommission from "../orders/FormOrderItemCommission";
import FormOrderItemContext from "../orders/FormOrderItemContext";
import FormOrderItemDiscount from "../orders/FormOrderItemDiscount";
import { TRANSLATION_NAMESPACES } from "../../locales";

type Props = { orderItem: OrderItemDTO; onSaved: ()=>void; onClose: ()=>void; };
export default function FormOrderItemTabs({ orderItem, onSaved, onClose }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);
  const [current, setCurrent] = useState<OrderItemDTO>(orderItem);
  useEffect(()=>setCurrent(orderItem),[orderItem]);

  return (
    <Tabs
      initial="general"
      tabs={[
        { key:"general",   label:t("orderItems.tabs.general"),   content:<FormOrderItem item={current} onSaved={onSaved} onClose={onClose} /> },
        { key:"commission",label:t("orderItems.tabs.commission"),content:<FormOrderItemCommission orderItemId={current.id!} /> , disabled: !current.id },
        { key:"context",   label:t("orderItems.tabs.context"),   content:<FormOrderItemContext orderItemId={current.id!} /> , disabled: !current.id },
        { key:"discount",  label:t("orderItems.tabs.discount"),  content:<FormOrderItemDiscount orderItemId={current.id!} /> , disabled: !current.id },
      ]}
    />
  );
}

