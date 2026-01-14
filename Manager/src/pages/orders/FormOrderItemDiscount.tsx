// src/components/order-items/FormOrderItemDiscount.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderItemDiscountDTO, UUID } from "../../models";
import { getItemDiscount, upsertItemDiscount } from "../../service/OrderItems";
import styles from "../../styles/orders/FormOrderItemDiscount.module.css";

export default function FormOrderItemDiscount({ orderItemId }: { orderItemId: UUID }) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL, TRANSLATION_NAMESPACES.COMMON]);
  const [data, setData] = useState<OrderItemDiscountDTO>({ orderItemId });

  const set = <K extends keyof OrderItemDiscountDTO>(k: K, v: OrderItemDiscountDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const d = await getItemDiscount(orderItemId);
      setData(d ?? { orderItemId });
    })();
  }, [orderItemId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertItemDiscount(orderItemId, data);
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.label}>{t("orderItem.discount.discountPercent")}</label>
        <input
          type="number"
          step="0.0001"
          className={styles.input}
          value={data.discountPercent ?? ""}
          onChange={e => set("discountPercent", e.target.value === "" ? undefined : e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>{t("orderItem.discount.discountValue")}</label>
        <input
          type="number"
          step="0.01"
          className={styles.input}
          value={data.discountValue ?? ""}
          onChange={e => set("discountValue", e.target.value === "" ? undefined : e.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.btn}>{t("common:common.save")}</button>
      </div>
    </form>
  );
}
