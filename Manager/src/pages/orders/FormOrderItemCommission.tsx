// src/components/order-items/FormOrderItemCommission.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderItemCommissionDTO, UUID } from "../../models";
import { getItemCommission, upsertItemCommission } from "../../service/OrderItems";
import styles from "../../styles/orders/FormOrderItemCommission.module.css";

export default function FormOrderItemCommission({ orderItemId }: { orderItemId: UUID }) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL, TRANSLATION_NAMESPACES.COMMON]);
  const [data, setData] = useState<OrderItemCommissionDTO>({ orderItemId });

  const set = <K extends keyof OrderItemCommissionDTO>(k: K, v: OrderItemCommissionDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const d = await getItemCommission(orderItemId);
      setData(d ?? { orderItemId });
    })();
  }, [orderItemId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertItemCommission(orderItemId, data);
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.row}>
        <label className={styles.label}>{t("orderItem.commission.salespersonCommission")}</label>
        <input
          type="number"
          step="0.01"
          className={styles.input}
          value={data.salespersonCommission ?? ""}
          onChange={e => set("salespersonCommission", e.target.value === "" ? undefined : e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label}>{t("orderItem.commission.brokerCommission")}</label>
        <input
          type="number"
          step="0.01"
          className={styles.input}
          value={data.brokerCommission ?? ""}
          onChange={e => set("brokerCommission", e.target.value === "" ? undefined : e.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.btn}>{t("common:common.save")}</button>
      </div>
    </form>
  );
}
