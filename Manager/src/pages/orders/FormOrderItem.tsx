// src/components/order-items/FormOrderItem.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrderItemDTO } from "../../models/Order";
import { UnitType } from "../../enums";
import { createOrderItem, updateOrderItem } from "../../service/OrderItems";
import styles from "../../styles/orders/FormOrderItem.module.css";

type Props = { 
  item: OrderItemDTO; 
  onSaved: () => void; 
  onClose: () => void; 
};

export default function FormOrderItem({ item, onSaved, onClose }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<OrderItemDTO>(item);
  const firstRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { 
    setData(item); 
    firstRef.current?.focus(); 
  }, [item]);
  
  const set = <K extends keyof OrderItemDTO>(k: K, v: OrderItemDTO[K]) => 
    setData(p => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (data.id) await updateOrderItem(data.id, data);
    else await createOrderItem(data);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.productId")}</label>
          <input 
            ref={firstRef} 
            type="number" 
            className={styles.input}
            value={data.productId ?? ""} 
            onChange={e => set("productId", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.description")}</label>
          <input 
            className={styles.input}
            value={data.description || ""} 
            onChange={e => set("description", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.itemSeq")}</label>
          <input 
            type="number" 
            className={styles.input}
            value={data.itemSeq} 
            onChange={e => set("itemSeq", Number(e.target.value) || 0)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.quantity")}</label>
          <input 
            type="number" 
            step="0.001" 
            className={styles.input}
            value={data.quantity ?? ""} 
            onChange={e => set("quantity", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.unitPrice")}</label>
          <input 
            type="number" 
            step="0.01" 
            className={styles.input}
            value={data.unitPrice ?? ""} 
            onChange={e => set("unitPrice", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.weight")}</label>
          <input 
            type="number" 
            step="0.01" 
            className={styles.input}
            value={data.weight ?? ""} 
            onChange={e => set("weight", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t("orderItem.general.unitType")}</label>
          <select 
            className={styles.select}
            value={data.unitType ?? ""} 
            onChange={e => set("unitType", e.target.value as UnitType)}
          >
            <option value="">{t("buttons.select")}</option>
            <option value={UnitType.UNIT}>{t('enums.unitType.UNIT')}</option>
            <option value={UnitType.PIECE}>{t('enums.unitType.PIECE')}</option>
            <option value={UnitType.METER}>{t('enums.unitType.METER')}</option>
            <option value={UnitType.KILO}>{t('enums.unitType.KILO')}</option>
            <option value={UnitType.LITER}>{t('enums.unitType.LITER')}</option>
            <option value={UnitType.HOUR}>{t('enums.unitType.HOUR')}</option>
            <option value={UnitType.KWH}>{t('enums.unitType.KWH')}</option>
          </select>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.button}>
          {data.id ? t("buttons.update") : t("buttons.save")}
        </button>
        <button type="button" className={styles.button} onClick={onClose}>
          {t("buttons.cancel")}
        </button>
      </div>
    </form>
  );
}
