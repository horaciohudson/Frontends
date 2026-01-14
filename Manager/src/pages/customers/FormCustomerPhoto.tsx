import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerPhoto } from "../../models/CustomerPhoto";
import { getCustomerPhoto, createCustomerPhoto, updateCustomerPhoto, deleteCustomerPhoto } from "../../service/customerPhoto";
import styles from "../../styles/customers/FormCustomerPhoto.module.css";

interface Props {
  customer: Customer;
  onSalvar?: () => void;
}

export default function FormCustomerPhoto({ customer, onSalvar }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [customerPhoto, setCustomerPhoto] = useState<CustomerPhoto | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar a foto existente, se houver
  const carregarPhoto = async () => {
    if (!customer?.customerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const photo = await getCustomerPhoto(customer.customerId);
      setCustomerPhoto(photo);
      
      if (photo?.photoBase64) {
        const photoUrl = `data:image/jpeg;base64,${photo.photoBase64}`;
        setPreview(photoUrl);
      } else {
        setPreview(null);
      }
      
    } catch (err: any) {
      setError(t("customerPhoto.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer?.customerId) {
      carregarPhoto();
    } else {
      setCustomerPhoto(null);
      setPreview(null);
      setFile(null);
      setModoEdicao(false);
    }
  }, [customer?.customerId]);

  // Efeito adicional para garantir que o preview seja sempre atualizado quando customerPhoto mudar
  useEffect(() => {
    if (customerPhoto?.photoBase64 && !file) {
      const photoUrl = `data:image/jpeg;base64,${customerPhoto.photoBase64}`;
      setPreview(photoUrl);
    } else if (!customerPhoto?.photoBase64 && !file) {
      setPreview(null);
    }
  }, [customerPhoto?.photoBase64, file]);

  // Gerar preview ao selecionar arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    setFile(file);
    
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError(t("customerPhoto.selectValidImage"));
        setFile(null);
        setPreview(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.onerror = () => {
        setError("Erro ao ler o arquivo");
      };
      reader.readAsDataURL(file);
      setModoEdicao(true);
    } else {
      setPreview(null);
    }
  };

  const resetarFormulario = () => {
    setFile(null);
    // Restaurar a foto existente se houver
    if (customerPhoto?.photoBase64) {
      const photoUrl = `data:image/jpeg;base64,${customerPhoto.photoBase64}`;
      setPreview(photoUrl);
    } else {
      setPreview(null);
    }
    setModoEdicao(false);
    setError(null);
  };

  // Salvar foto
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError(t("customerPhoto.fileRequired"));
      return;
    }

    try {
      setLoading(true);
      
      let res;
      if (customerPhoto?.id) {
        res = await updateCustomerPhoto(customer.customerId, file);
      } else {
        res = await createCustomerPhoto(customer.customerId, file);
      }

      setCustomerPhoto(res);
      setModoEdicao(false);
      setFile(null);
      
      // Atualizar o preview com a foto salva
      if (res.photoBase64) {
        const photoUrl = `data:image/jpeg;base64,${res.photoBase64}`;
        setPreview(photoUrl);
      } else {
        setPreview(null);
      }
      
      if (onSalvar) onSalvar();
    } catch (err: any) {
      setError(err.response?.data?.message || t("customerPhoto.saveError"));
    } finally {
      setLoading(false);
    }
  };

  // Excluir foto
  const handleExcluir = async () => {
    if (!customerPhoto?.id) return;
    if (!confirm(t("customerPhoto.confirmDelete"))) return;
    
    try {
      setLoading(true);
      
      await deleteCustomerPhoto(customerPhoto.id);
      setCustomerPhoto(null);
      setPreview(null);
      setFile(null);
      setModoEdicao(false);
      
      if (onSalvar) onSalvar();
    } catch (err: any) {
      setError(err.response?.data?.message || t("customerPhoto.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 style={{ color: "#365a7c" }}>{t("customerPhoto.title")}</h3>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerPhoto.title")}</h3>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSalvar} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={styles["column-file"]}>
            <label className={styles["form-label"]}>{t("customerPhoto.selectFile")}:</label>
            <input
              type="file"     
              accept="image/*"
              onChange={handleFileChange}
              className={styles["form-input"]}
              disabled={!modoEdicao}
            />
          </div>
          <div className={styles["column-file"]}>
            <label className={styles["form-label"]}>
              {modoEdicao ? t("customerPhoto.newPhotoPreview") : t("customerPhoto.preview")}:
            </label>
            {preview ? (
              <img
                src={preview}
                alt={t("customerPhoto.previewAlt")}
                className={styles["photo-image"]}
                style={{ maxWidth: 150, maxHeight: 150, borderRadius: 8, border: "1px solid #ccc" }}
              />
            ) : (
              <span style={{ color: "#aaa" }}>
                {modoEdicao ? t("customerPhoto.selectImagePreview") : t("customerPhoto.noPhoto")}
              </span>
            )}
          </div>
        </div>
        
        <div className={styles["form-actions"]}>
          {modoEdicao ? (
            <>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? t("customerPhoto.saving") : t("customerPhoto.save")}
              </button>
              <button 
                type="button" 
                className={`${styles.button} ${styles.cancel}`} 
                onClick={resetarFormulario}
                disabled={loading}
              >
                {t("customerPhoto.cancel")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles["button-new"]}
                onClick={() => setModoEdicao(true)}
                disabled={loading}
              >
                {customerPhoto ? t("customerPhoto.changePhoto") : t("customerPhoto.newPhoto")}
              </button>
              {customerPhoto && (
                <button
                  type="button"
                  className={styles["button-delete"]}
                  onClick={handleExcluir}
                  disabled={loading}
                >
                  {t("customerPhoto.delete")}
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}