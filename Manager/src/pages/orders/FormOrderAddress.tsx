// src/components/orders/FormOrderAddress.tsx
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderAddressDTO } from "../../models/Order";
import { AddressType } from "../../enums";
import { UUID } from "../../types/common";
import { upsertOrderAddress, listOrderAddresses, deleteOrderAddress } from "../../service/Order";

import styles from "../../styles/orders/FormOrderAddress.module.css";

type Props = {
  orderId: UUID;
  customerName?: string;
};

export default function FormOrderAddress({ orderId, customerName }: Props) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL, TRANSLATION_NAMESPACES.ENUMS]);
  const [data, setData] = useState<OrderAddressDTO>({ orderId });
  const [addresses, setAddresses] = useState<OrderAddressDTO[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof OrderAddressDTO>(k: K, v: OrderAddressDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  const loadAddresses = useCallback(async () => {
    try {
      console.log("🏠 Loading order addresses for orderId:", orderId);
      setIsLoading(true);
      const addressesList = await listOrderAddresses(orderId);
      console.log("📊 Order addresses response:", addressesList);
      
      // Se retornar um array de endereços
      if (Array.isArray(addressesList) && addressesList.length > 0) {
        console.log("✅ Setting order addresses:", addressesList);
        setAddresses(addressesList);
      } 
      // Se retornar um único endereço
      else if (addressesList && addressesList.orderId) {
        console.log("✅ Setting single order address:", addressesList);
        setAddresses([addressesList]);
      } 
      // Se não houver endereços
      else {
        console.log("❌ No order addresses found");
        setAddresses([]);
      }
      
      // Sempre manter formulário limpo
      setData({ orderId });
      setEditingMode(false);
    } catch (err: unknown) {
      // If 404 or no address found, it's not an error - just no address yet
      console.log("❌ Error loading order addresses:", err);
      setAddresses([]);
      setData({ orderId });
      setEditingMode(false);
      console.log("No address found for order, starting fresh");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadAddresses();
    }
  }, [orderId, loadAddresses]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação: impedir salvamento de endereço vazio
    if (!data.street && !data.city) {
      setError("Por favor, preencha pelo menos a rua ou a cidade antes de salvar.");
      return;
    }

    try {
      setIsLoading(true);
      await upsertOrderAddress(orderId, data);
      setSuccessMessage(t("orderAddresses.saveSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingMode(false);
      await loadAddresses();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(t("orderAddresses.saveError"));
      console.error(t("orderAddresses.saveError"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditFromTable = (address: OrderAddressDTO) => {
    setData(address);
    setEditingMode(true);
    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const handleDeleteFromTable = async (addressId: string) => {
    if (!confirm(t("orderAddresses.confirmDelete"))) return;
    try {
      setIsLoading(true);
      await deleteOrderAddress(addressId);
      setSuccessMessage(t("orderAddresses.deleteSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadAddresses();
      // Se estava editando este endereço, limpar formulário
      if (data.id === addressId) {
        resetForm();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(t("orderAddresses.deleteError"));
      console.error(t("orderAddresses.deleteError"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // CRÍTICO: Impede que o botão dispare o submit do form
    e.stopPropagation(); // Impede propagação do evento
    setData({ orderId, addressType: AddressType.DELIVERY });
    setEditingMode(true);
    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const resetForm = () => {
    setData({ orderId });
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles["form-container"]}>
        {/* Display customer info */}
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Cliente</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={customerName || "Nenhum cliente selecionado"}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>ID do Pedido</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={orderId || ""}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
            />
          </div>
          <div className={styles.coluna}>
            {/* Espaço vazio */}
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.addressType")}</label>
            <select
              className={styles["form-select"]}
              value={data.addressType ?? ""}
              onChange={e => set("addressType", e.target.value === "" ? undefined : e.target.value as AddressType)}
              disabled={!editingMode}
            >
              <option value="">{t("buttons.select")}</option>
              <option value={AddressType.COMMERCIAL}>{t('addressType.COMMERCIAL', { ns: 'enums' })}</option>
              <option value={AddressType.CORRESPONDENCE}>{t('addressType.CORRESPONDENCE', { ns: 'enums' })}</option>
              <option value={AddressType.BILLING}>{t('addressType.BILLING', { ns: 'enums' })}</option>
              <option value={AddressType.DELIVERY}>{t('addressType.DELIVERY', { ns: 'enums' })}</option>
              <option value={AddressType.REGISTERED}>{t('addressType.REGISTERED', { ns: 'enums' })}</option>
              <option value={AddressType.OTHER}>{t('addressType.OTHER', { ns: 'enums' })}</option>
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.street")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.street ?? ""}
              onChange={e => set("street", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.number")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.number ?? ""}
              onChange={e => set("number", e.target.value)}
              disabled={!editingMode}
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.complement")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.complement ?? ""}
              onChange={e => set("complement", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.neighborhood")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.neighborhood ?? ""}
              onChange={e => set("neighborhood", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.city")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.city ?? ""}
              onChange={e => set("city", e.target.value)}
              disabled={!editingMode}
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.state")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.state ?? ""}
              onChange={e => set("state", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.zipCode")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.zipCode ?? ""}
              onChange={e => set("zipCode", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.country")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.country ?? ""}
              onChange={e => set("country", e.target.value)}
              disabled={!editingMode}
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.phone")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.phone ?? ""}
              onChange={e => set("phone", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderAddresses.general.fax")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.fax ?? ""}
              onChange={e => set("fax", e.target.value)}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            {/* Espaço para futura expansão ou deixar vazio para manter layout 3 colunas */}
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={isLoading}>
                {data.id ? t("buttons.update") : t("buttons.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={isLoading}
              >
                {t("buttons.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("orderAddresses.newAddress")}
            </button>
          )}
        </div>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {/* Tabela de endereços */}
      {isLoading ? (
        <p className={styles.loading}>Carregando endereços...</p>
      ) : addresses.length > 0 ? (
        <table className={styles["address-table"]}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Endereço</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>CEP</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address, index) => {
              console.log(`🔍 Rendering address ${index}:`, address);
              console.log(`🆔 Address ID exists:`, !!address.id, address.id);
              return (
                <tr key={address.id || `address-${index}`}>
                  <td>{address.addressType ? t(`addressType.${address.addressType}`, { ns: 'enums' }) : '-'}</td>
                  <td>{`${address.street || ''} ${address.number || ''}`.trim() || '-'}</td>
                  <td>{address.city || '-'}</td>
                  <td>{address.state || '-'}</td>
                  <td>{address.zipCode || '-'}</td>
                  <td>{address.phone || '-'}</td>
                  <td>
                    <button
                      type="button"
                      className={styles["button-editar"]}
                      onClick={() => handleEditFromTable(address)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles["button-excluir"]}
                      onClick={() => {
                        if (!address.id) {
                          alert('Este endereço não pode ser excluído pois não possui ID');
                          return;
                        }
                        handleDeleteFromTable(address.id);
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>Nenhum endereço cadastrado para este pedido.</p>
      )}
    </div>
  );
}
