import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Customer } from "../../models/Customer";
import { CustomerAddress } from "../../models/CustomerAddress";
import { apiNoPrefix } from "../../service/api";
import styles from "../../styles/customers/FormCustomerAddress.module.css";

interface Props {
  customer: Customer;
  onSave?: () => void;
}

export default function FormCustomerAddress({ customer, onSave }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [address, setAddress] = useState<CustomerAddress>({
    id: 0,
    customer: customer,
    addressType: "COMMERCIAL",
    street: "",
    district: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAddressData = async () => {
    try {
      console.log("🏠 Loading address data for customer:", customer.customerId);
      const res = await apiNoPrefix.get(`/api/customer-addresses/customer/${customer.customerId}`);
      console.log("📊 Address data response:", res.data);
      
      if (res.data && res.data.length > 0) {
        console.log("✅ Setting address data:", res.data);
        setAddresses(res.data);
      } else {
        console.log("❌ No address data found");
        setAddresses([]);
      }
    } catch (err: any) {
      console.error("❌ Error loading address data:", err);
      setError(t("customerAddress.loadError"));
    }
  };

  useEffect(() => {
    console.log("🔄 FormCustomerAddress useEffect triggered");
    console.log("📋 Customer object:", customer);
    console.log("🆔 Customer ID:", customer?.customerId);
    
    if (customer?.customerId) {
      console.log("✅ Valid customer ID found, loading address data...");
      loadAddressData();
    } else {
      console.log("❌ No valid customer ID found");
    }
  }, [customer.customerId]);

  const resetForm = () => {
    setAddress({
      id: 0,
      customer: customer,
      addressType: "COMMERCIAL",
      street: "",
      district: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setEditMode(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Só validar se estiver no modo de edição
    if (editMode && (!address.addressType || !address.street)) {
      setError(t("customerAddress.typeRequired") + " " + t("customerAddress.streetRequired"));
      return;
    }

    try {
      const payload = {
        customerId: customer.customerId,
        addressType: address.addressType,
        street: address.street,
        district: address.district,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      };

      const res = address.id
        ? await apiNoPrefix.put(`/api/customer-addresses/${address.id}`, payload)
        : await apiNoPrefix.post("/api/customer-addresses", payload);

      const savedAddress = {
        id: res.data.id,
        customer: customer,
        addressType: res.data.addressType,
        street: res.data.street,
        district: res.data.district,
        city: res.data.city,
        state: res.data.state,
        zipCode: res.data.zipCode,
      };

      setAddresses((prev) =>
        address.id ? prev.map((a) => (a.id === address.id ? savedAddress : a)) : [...prev, savedAddress]
      );
      resetForm();
      if (onSave) onSave();
    } catch (err: any) {
      console.error("Error saving address:", err);
      setError(err.response?.data?.message || t("customerAddress.saveError"));
    }
  };

  const handleEdit = (a: CustomerAddress) => {
    setAddress(a);
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("customerAddress.confirmDelete"))) return;
    try {
      await apiNoPrefix.delete(`/api/customer-addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (onSave) onSave();
    } catch (err: any) {
      console.error("Error deleting address:", err);
      setError(err.response?.data?.message || t("customerAddress.deleteError"));
    }
  };

  const handleNew = () => {
    resetForm();
    setEditMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={styles.container}>
      <h3 style={{ color: "#365a7c" }}>{t("customerAddress.title")}</h3>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSave} className={styles["form-container"]}>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-type"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.type")}:</label>
            <select
              value={address.addressType}
              onChange={(e) =>
                setAddress({
                  ...address,
                  addressType: e.target.value as "COMMERCIAL" | "RESIDENTIAL" | "BILLING",
                })
              }
              className={styles["form-input"]}
              disabled={!editMode}
              ref={inputRef as React.Ref<HTMLSelectElement>}
            >
              <option value="">{t("customers.select")}...</option>
              <option value="RESIDENTIAL">{t("customerAddress.residential")}</option>
              <option value="COMMERCIAL">{t("customerAddress.commercial")}</option>
              <option value="BILLING">{t("customerAddress.billing")}</option>
            </select>
          </div>
          <div className={`${styles.column} ${styles["column-street"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.street")}:</label>
            <input
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-district"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.district")}:</label>
            <input
              value={address.district}
              onChange={(e) => setAddress({ ...address, district: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>
        <div className={styles["form-row"]}>
          <div className={`${styles.column} ${styles["column-city"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.city")}:</label>
            <input
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-state"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.state")}:</label>
            <input
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
          <div className={`${styles.column} ${styles["column-zipCode"]}`}>
            <label className={styles["form-label"]}>{t("customerAddress.zipCode")}:</label>
            <input
              value={address.zipCode}
              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
              className={styles["form-input"]}
              disabled={!editMode}
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editMode ? (
            <>
              <button type="submit" className={styles.button}>
                {address.id ? t("customerAddress.update") : t("customerAddress.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancel}`}
                onClick={resetForm}
              >
                {t("customerAddress.cancel")}
              </button>
            </>
          ) : (
            <button type="button" className={styles["button-new"]} onClick={handleNew}>
              {t("customerAddress.newAddress")}
            </button>
          )}
        </div>
      </form>

      <table className={styles["address-table"]}>
        <thead>
          <tr>
            <th>{t("customerAddress.type")}</th>
            <th>{t("customerAddress.street")}</th>
            <th>{t("customerAddress.district")}</th>
            <th>{t("customerAddress.city")}</th>
            <th>{t("customerAddress.state")}</th>
            <th>{t("customerAddress.zipCode")}</th>
            <th>{t("customerAddress.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {addresses.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles["no-data"]}>
                {t("customerAddress.noAddresses")}
              </td>
            </tr>
          ) : (
            addresses.map((a) => (
              <tr key={a.id}>
                <td>{a.addressType}</td>
                <td>{a.street}</td>
                <td>{a.district}</td>
                <td>{a.city}</td>
                <td>{a.state}</td>
                <td>{a.zipCode}</td>
                <td>
                  <button onClick={() => handleEdit(a)} className={styles["button-edit"]}>
                    {t("customerAddress.edit")}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className={styles["button-delete"]}>
                    {t("customerAddress.delete")}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}