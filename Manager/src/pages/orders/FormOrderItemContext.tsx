// src/components/order-items/FormOrderItemContext.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderItemContextDTO, TaxStatus, UUID } from "../../models";
import { getItemContext, upsertItemContext } from "../../service/OrderItems";
import styles from "../../styles/orders/FormOrderItemContext.module.css";

export default function FormOrderItemContext({ orderItemId }: { orderItemId: UUID }) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL, TRANSLATION_NAMESPACES.COMMON]);
  const [data, setData] = useState<OrderItemContextDTO>({ orderItemId });

  const set = <K extends keyof OrderItemContextDTO>(k: K, v: OrderItemContextDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const d = await getItemContext(orderItemId);
      setData(d ?? { orderItemId });
    })();
  }, [orderItemId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertItemContext(orderItemId, data);
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.context.barcode")}</label>
          <input
            className={styles.input}
            value={data.barcode || ""}
            onChange={e => set("barcode", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.context.reference")}</label>
          <input
            className={styles.input}
            value={data.reference || ""}
            onChange={e => set("reference", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.context.priceTable")}</label>
          <input
            className={styles.input}
            value={data.priceTable || ""}
            onChange={e => set("priceTable", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.context.taxStatus")}</label>
          <select
            className={styles.select}
            value={data.taxStatus ?? ""}
            onChange={e => set("taxStatus", e.target.value as TaxStatus)}
          >
            <option value="">{t("common:common.select")}</option>
            {Object.values(TaxStatus).map(v => (
              <option key={v} value={v}>
                {t(`orderItem.enums.taxStatus.${v}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.context.fiscalClassification")}</label>
          <input
            className={styles.input}
            value={data.fiscalClassification || ""}
            onChange={e => set("fiscalClassification", e.target.value)}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.btn}>{t("common:common.save")}</button>
      </div>
    </form>
  );
}
