import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/paymentMethods/FormPaymentMethod.module.css";
import { PaymentMethod, PaymentMethodKind, InterestPayer, PricingMode, PeriodUnit, RoundingStrategy } from "../../models/PaymentMethod";

interface Props {
  item: PaymentMethod | null;
  onSave: (item: PaymentMethod) => void;
  onCancel: () => void;
}

export default function FormPaymentMethod({ item, onSave, onCancel }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [data, setData] = useState<PaymentMethod>({
    id: 0,
    code: "",
    name: "",
    kind: PaymentMethodKind.CASH,
    maxInstallmentsNoInterest: 1,
    maxInstallmentsWithInterest: 0,
    minValuePerInstallment: 0.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: true,
    requiresAuthorization: false,
    maxInstallments: 1,
    posDisplayOrder: 0,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 0.0,
    rateM: 0.0,
    periodic: false,
    firstInstallment: true,
    withTef: false,
    active: true,
  });
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  

  useEffect(() => {
    if (item) {
      setData(item);
      setEditMode(true);
    } else {
      setData({
        id: 0,
        code: "",
        name: "",
        kind: PaymentMethodKind.CASH,
        maxInstallmentsNoInterest: 1,
        maxInstallmentsWithInterest: 0,
        minValuePerInstallment: 0.0,
        interestPayer: InterestPayer.CUSTOMER,
        pricingMode: PricingMode.COMPOUND,
        period: PeriodUnit.MONTHLY,
        roundingStrategy: RoundingStrategy.BANKERS,
        posEnabled: true,
        requiresAuthorization: false,
        maxInstallments: 1,
        posDisplayOrder: 0,
        rounding: "bankers",
        roundingEnabled: true,
        rateR: 0.0,
        rateM: 0.0,
        periodic: false,
        firstInstallment: true,
        withTef: false,
        active: true,
      });
      setEditMode(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Auto-ajustar campos relacionados baseado no tipo
      if (name === 'kind') {
        const kind = value as PaymentMethodKind;
        switch (kind) {
          case PaymentMethodKind.CASH:
            updated.maxInstallmentsNoInterest = 1;
            updated.maxInstallmentsWithInterest = 0;
            updated.rateR = 0.0;
            updated.rateM = 0.0;
            updated.withTef = false;
            updated.requiresAuthorization = false;
            break;
          case PaymentMethodKind.CREDIT_CARD:
            updated.maxInstallmentsNoInterest = 3;
            updated.maxInstallmentsWithInterest = 12;
            updated.rateR = 2.5;
            updated.rateM = 1.8;
            updated.withTef = true;
            updated.requiresAuthorization = true;
            updated.periodic = true;
            break;
          case PaymentMethodKind.DEBIT_CARD:
            updated.maxInstallmentsNoInterest = 1;
            updated.maxInstallmentsWithInterest = 0;
            updated.rateR = 1.5;
            updated.rateM = 1.2;
            updated.withTef = true;
            updated.requiresAuthorization = false;
            break;
          case PaymentMethodKind.PIX:
            updated.maxInstallmentsNoInterest = 1;
            updated.maxInstallmentsWithInterest = 0;
            updated.rateR = 0.0;
            updated.rateM = 0.0;
            updated.withTef = true;
            updated.requiresAuthorization = false;
            break;
          case PaymentMethodKind.BOLETO:
            updated.maxInstallmentsNoInterest = 1;
            updated.maxInstallmentsWithInterest = 0;
            updated.rateR = 0.0;
            updated.rateM = 0.0;
            updated.withTef = false;
            updated.posEnabled = false;
            break;
        }
        updated.maxInstallments = Math.max(updated.maxInstallmentsNoInterest, updated.maxInstallmentsWithInterest);
      }
      
      // Sincronizar roundingStrategy com rounding
      if (name === 'roundingStrategy') {
        updated.rounding = (value as RoundingStrategy).toLowerCase();
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!data.name.trim()) {
      alert(t("paymentMethods.nameRequired"));
      return;
    }

    if (!data.code.trim()) {
      alert(t("paymentMethods.codeRequired"));
      return;
    }

    onSave(data);
    setData({
      id: 0,
      code: "",
      name: "",
      kind: PaymentMethodKind.CASH,
      maxInstallmentsNoInterest: 1,
      maxInstallmentsWithInterest: 0,
      minValuePerInstallment: 0.0,
      interestPayer: InterestPayer.CUSTOMER,
      pricingMode: PricingMode.COMPOUND,
      period: PeriodUnit.MONTHLY,
      roundingStrategy: RoundingStrategy.BANKERS,
      posEnabled: true,
      requiresAuthorization: false,
      maxInstallments: 1,
      posDisplayOrder: 0,
      rounding: "bankers",
      roundingEnabled: true,
      rateR: 0.0,
      rateM: 0.0,
      periodic: false,
      firstInstallment: true,
      withTef: false,
      active: true,
    });
    setEditMode(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["payment-method-form"]}>
      <div className={styles["payment-method-form-row"]}>
        <label htmlFor="code">{t("paymentMethods.code")}:</label>
        <input
          ref={inputRef}
          type="text"
          id="code"
          name="code"
          value={data.code}
          onChange={handleChange}
          disabled={!editMode}
          required
          maxLength={20}
        />

        <label htmlFor="name">{t("paymentMethods.name")}:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          disabled={!editMode}
          required
          maxLength={80}
        />

        <label htmlFor="kind">{t("paymentMethods.kind")}:</label>
        <select
          id="kind"
          name="kind"
          value={data.kind}
          onChange={handleChange}
          disabled={!editMode}
          required
        >
          {Object.values(PaymentMethodKind).map(kind => (
            <option key={kind} value={kind}>
              {t(`paymentMethods.kinds.${kind}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles["payment-method-form-row"]}>
        <label htmlFor="maxInstallmentsNoInterest">{t("paymentMethods.maxInstallmentsNoInterest")}:</label>
        <input
          type="number"
          id="maxInstallmentsNoInterest"
          name="maxInstallmentsNoInterest"
          value={data.maxInstallmentsNoInterest}
          onChange={handleChange}
          disabled={!editMode}
          min="1"
          max="99"
        />

        <label htmlFor="maxInstallmentsWithInterest">{t("paymentMethods.maxInstallmentsWithInterest")}:</label>
        <input
          type="number"
          id="maxInstallmentsWithInterest"
          name="maxInstallmentsWithInterest"
          value={data.maxInstallmentsWithInterest}
          onChange={handleChange}
          disabled={!editMode}
          min="0"
          max="99"
        />

        <label htmlFor="minValuePerInstallment">{t("paymentMethods.minValuePerInstallment")}:</label>
        <input
          type="number"
          id="minValuePerInstallment"
          name="minValuePerInstallment"
          value={data.minValuePerInstallment}
          onChange={handleChange}
          disabled={!editMode}
          min="0"
          step="0.01"
        />
      </div>

      <div className={styles["payment-method-form-row"]}>
        <label htmlFor="interestPayer">{t("paymentMethods.interestPayer")}:</label>
        <select
          id="interestPayer"
          name="interestPayer"
          value={data.interestPayer}
          onChange={handleChange}
          disabled={!editMode}
        >
          {Object.values(InterestPayer).map(payer => (
            <option key={payer} value={payer}>
              {t(`paymentMethods.interestPayers.${payer}`)}
            </option>
          ))}
        </select>

        <label htmlFor="pricingMode">{t("paymentMethods.pricingMode")}:</label>
        <select
          id="pricingMode"
          name="pricingMode"
          value={data.pricingMode}
          onChange={handleChange}
          disabled={!editMode}
        >
          {Object.values(PricingMode).map(mode => (
            <option key={mode} value={mode}>
              {t(`paymentMethods.pricingModes.${mode}`)}
            </option>
          ))}
        </select>

        <label htmlFor="roundingStrategy">{t("paymentMethods.roundingStrategy")}:</label>
        <select
          id="roundingStrategy"
          name="roundingStrategy"
          value={data.roundingStrategy}
          onChange={handleChange}
          disabled={!editMode}
        >
          {Object.values(RoundingStrategy).map(strategy => (
            <option key={strategy} value={strategy}>
              {t(`paymentMethods.roundingStrategies.${strategy}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles["payment-method-form-row"]}>
        <label htmlFor="rateR">{t("paymentMethods.rateR")}:</label>
        <input
          type="number"
          id="rateR"
          name="rateR"
          value={data.rateR}
          onChange={handleChange}
          disabled={!editMode}
          min="0"
          step="0.01"
        />

        <label htmlFor="rateM">{t("paymentMethods.rateM")}:</label>
        <input
          type="number"
          id="rateM"
          name="rateM"
          value={data.rateM}
          onChange={handleChange}
          disabled={!editMode}
          min="0"
          step="0.01"
        />

        <label htmlFor="posDisplayOrder">{t("paymentMethods.posDisplayOrder")}:</label>
        <input
          type="number"
          id="posDisplayOrder"
          name="posDisplayOrder"
          value={data.posDisplayOrder}
          onChange={handleChange}
          disabled={!editMode}
          min="0"
        />
      </div>

      <div className={styles["payment-method-form-row"]}>
        <label>
          <input
            type="checkbox"
            name="active"
            checked={data.active}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.active")}
        </label>

        <label>
          <input
            type="checkbox"
            name="posEnabled"
            checked={data.posEnabled}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.posEnabled")}
        </label>

        <label>
          <input
            type="checkbox"
            name="requiresAuthorization"
            checked={data.requiresAuthorization}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.requiresAuthorization")}
        </label>
      </div>

      <div className={styles["payment-method-form-row"]}>
        <label>
          <input
            type="checkbox"
            name="roundingEnabled"
            checked={data.roundingEnabled}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.roundingEnabled")}
        </label>

        <label>
          <input
            type="checkbox"
            name="periodic"
            checked={data.periodic}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.periodic")}
        </label>

        <label>
          <input
            type="checkbox"
            name="withTef"
            checked={data.withTef}
            onChange={handleChange}
            disabled={!editMode}
          />
          {t("paymentMethods.withTef")}
        </label>
      </div>

      <div className={styles["payment-method-form-row"]}>
        {editMode ? (
          <>
            <button type="submit" className={styles.button}>
              {data.id && data.id > 0 ? t("paymentMethods.update") : t("paymentMethods.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setData({
                  id: 0,
                  code: "",
                  name: "",
                  kind: PaymentMethodKind.CASH,
                  maxInstallmentsNoInterest: 1,
                  maxInstallmentsWithInterest: 0,
                  minValuePerInstallment: 0.0,
                  interestPayer: InterestPayer.CUSTOMER,
                  pricingMode: PricingMode.COMPOUND,
                  period: PeriodUnit.MONTHLY,
                  roundingStrategy: RoundingStrategy.BANKERS,
                  posEnabled: true,
                  requiresAuthorization: false,
                  maxInstallments: 1,
                  posDisplayOrder: 0,
                  rounding: "bankers",
                  roundingEnabled: true,
                  rateR: 0.0,
                  rateM: 0.0,
                  periodic: false,
                  firstInstallment: true,
                  withTef: false,
                  active: true,
                });
                onCancel();
              }}
              className={`${styles.button} ${styles.cancel}`}
            >
              {t("paymentMethods.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles["new-button"]}
            onClick={() => {
              setData({
                id: 0,
                code: "",
                name: "",
                kind: PaymentMethodKind.CASH,
                maxInstallmentsNoInterest: 1,
                maxInstallmentsWithInterest: 0,
                minValuePerInstallment: 0.0,
                interestPayer: InterestPayer.CUSTOMER,
                pricingMode: PricingMode.COMPOUND,
                period: PeriodUnit.MONTHLY,
                roundingStrategy: RoundingStrategy.BANKERS,
                posEnabled: true,
                requiresAuthorization: false,
                maxInstallments: 1,
                posDisplayOrder: 0,
                rounding: "bankers",
                roundingEnabled: true,
                rateR: 0.0,
                rateM: 0.0,
                periodic: false,
                firstInstallment: true,
                withTef: false,
                active: true,
              });
              setEditMode(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            {t("paymentMethods.new")}
          </button>
        )}
      </div>
    </form>
  );
}
