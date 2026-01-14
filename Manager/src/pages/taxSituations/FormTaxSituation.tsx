// ✅ components/taxSituations/FormTaxSituation.tsx
import { useEffect, useState } from "react";
import { TaxSituation } from "../../models/taxSituation";
import styles from "../../styles/taxSituations/FormTaxSituation.module.css";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";

interface Props {
  item: TaxSituation | null;
  onSave: (item: TaxSituation) => void;
  onCancel: () => void;
  onNew: () => void;
}

export default function FormTaxSituation({ item, onSave, onCancel, onNew }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (item) {
      setCode(item.code);
      setName(item.name);
    } else {
      setCode("");
      setName("");
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() || !name.trim()) {
      alert(t("taxSituations.validation.fieldsRequired"));
      return;
    }

    const taxSituation: TaxSituation = {
      id: item?.id || 0,
      code: code.trim(),
      name: name.trim()
    };

    onSave(taxSituation);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles["taxSituation-form"]}>
        <div className={styles["taxSituation-form-row"]}>
          <label htmlFor="code">{t("taxSituations.code")}:</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={3}
            placeholder={t("taxSituations.codePlaceholder")}
          />

          <label htmlFor="name">{t("taxSituations.name")}:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            placeholder={t("taxSituations.namePlaceholder")}
          />
        </div>
        
        <div className={styles["taxSituation-form-buttons"]}>
          {!item ? (
            // Estado inicial - mostrar apenas botão Novo
            <button
              type="button"
              onClick={onNew}
              className={`${styles.button} ${styles.new}`}
            >
              {t("taxSituations.new")}
            </button>
          ) : item.id === 0 ? (
            // Modo de criação (Novo acionado) - mostrar botões Salvar e Cancelar
            <>
              <button type="submit" className={styles.button}>
                {t("taxSituations.save")}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className={`${styles.button} ${styles.cancel}`}
              >
                {t("taxSituations.cancel")}
              </button>
            </>
          ) : (
            // Modo de edição - mostrar botões Atualizar e Cancelar
            <>
              <button type="submit" className={styles.button}>
                {t("taxSituations.update")}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className={`${styles.button} ${styles.cancel}`}
              >
                {t("taxSituations.cancel")}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}