import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import styles from "../../styles/fiscalCodes/FormFiscalCode.module.css";
import { FiscalCode } from "../../models/FiscalCode";

interface Props {
  item: FiscalCode | null;
  onSave: (item: FiscalCode) => void;
  onCancel: () => void;
}

export default function FormFiscalCode({ item, onSave, onCancel }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [data, setData] = useState<FiscalCode>({
    id: 0,
    cfop: "",
    name: "",
    control: "",
    icmsCalc: "",
    outOfEstablishment: "",
    funruralCalc: "",
    ipiCalc: "",
    sicmCalc: "",
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
        cfop: "",
        name: "",
        control: "",
        icmsCalc: "",
        outOfEstablishment: "",
        funruralCalc: "",
        ipiCalc: "",
        sicmCalc: "",
      });
      setEditMode(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!data.name.trim()) {
      alert(t("fiscalCodes.nameRequired"));
      return;
    }

    if (!data.cfop.trim()) {
      alert(t("fiscalCodes.codeRequired"));
      return;
    }

    onSave(data);
    setData({
      id: 0,
      cfop: "",
      name: "",
      control: "",
      icmsCalc: "",
      outOfEstablishment: "",
      funruralCalc: "",
      ipiCalc: "",
      sicmCalc: "",
    });
    setEditMode(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["fiscal-code-form"]}>
      <div className={styles["fiscal-code-form-row"]}>
        <label htmlFor="cfop">{t("fiscalCodes.code")}:</label>
        <input
          ref={inputRef}
          type="text"
          id="cfop"
          name="cfop"
          value={data.cfop}
          onChange={handleChange}
          disabled={!editMode}
          required
        />

        <label htmlFor="name">{t("fiscalCodes.name")}:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          disabled={!editMode}
          required
        />

        <label htmlFor="control">{t("fiscalCodes.description")}:</label>
        <input
          type="text"
          id="control"
          name="control"
          value={data.control}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles["fiscal-code-form-row"]}>
        <label htmlFor="icmsCalc">ICMS:</label>
        <input
          type="text"
          id="icmsCalc"
          name="icmsCalc"
          value={data.icmsCalc}
          onChange={handleChange}
          disabled={!editMode}
        />

        <label htmlFor="outOfEstablishment">Fora do Estabelecimento:</label>
        <input
          type="text"
          id="outOfEstablishment"
          name="outOfEstablishment"
          value={data.outOfEstablishment}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles["fiscal-code-form-row"]}>
        <label htmlFor="funruralCalc">Funrural:</label>
        <input
          type="text"
          id="funruralCalc"
          name="funruralCalc"
          value={data.funruralCalc}
          onChange={handleChange}
          disabled={!editMode}
        />

        <label htmlFor="ipiCalc">IPI:</label>
        <input
          type="text"
          id="ipiCalc"
          name="ipiCalc"
          value={data.ipiCalc}
          onChange={handleChange}
          disabled={!editMode}
        />

        <label htmlFor="sicmCalc">SICM:</label>
        <input
          type="text"
          id="sicmCalc"
          name="sicmCalc"
          value={data.sicmCalc}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      <div className={styles["fiscal-code-form-row"]}>
        {editMode ? (
          <>
            <button type="submit" className={styles.button}>
              {data.id && data.id > 0 ? t("fiscalCodes.update") : t("fiscalCodes.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setData({
                  id: 0,
                  cfop: "",
                  name: "",
                  control: "",
                  icmsCalc: "",
                  outOfEstablishment: "",
                  funruralCalc: "",
                  ipiCalc: "",
                  sicmCalc: "",
                });
                onCancel();
              }}
              className={`${styles.button} ${styles.cancel}`}
            >
              {t("fiscalCodes.cancel")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles["new-button"]}
            onClick={() => {
              setData({
                id: 0,
                cfop: "",
                name: "",
                control: "",
                icmsCalc: "",
                outOfEstablishment: "",
                funruralCalc: "",
                ipiCalc: "",
                sicmCalc: "",
              });
              setEditMode(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            {t("fiscalCodes.new")}
          </button>
        )}
      </div>
    </form>
  );
}
