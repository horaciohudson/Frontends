import { useEffect, useRef, useState, memo, useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceItem } from '../../models/ServiceItem';
import { Service } from '../../models/Service';
import { UnitType } from '../../enums/UnitType';
import { TRANSLATION_NAMESPACES } from '../../locales';
import api from '../../service/api';
import styles from '../../styles/services/FormItemService.module.css';

interface Props {
  service: Service;
}

const initial: ServiceItem = {
  id: null,
  serviceId: null,
  description: '',
  quantity: '1',
  unitType: UnitType.UNIT,
  unitPrice: '0',
  discount: '0',
  taxPercentage: '0',
  taxValue: '0',
};

function FormServiceItem({ service }: Props) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.PRINCIPAL, 'enums']);
  
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState<ServiceItem>({ ...initial, serviceId: service?.id });
  const [editingMode, setEditingMode] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    console.log('🚀 Starting item loading for serviceId:', service?.id);
    if (service?.id) {
      setIsLoading(true);
      loadItems(service.id);
    } else {
      setItems([]);
      setForm({ ...initial });
      setError(t("serviceItem.serviceRequired"));
      setIsLoading(false);
    }
  }, [service?.id, t]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, serviceId: service?.id || null }));
  }, [service?.id]);

  useEffect(() => {
    const base = (Number(form.unitPrice) * Number(form.quantity)) - Number(form.discount);
    const tax = (base * Number(form.taxPercentage)) / 100;
    setForm((prev) => ({ ...prev, taxValue: tax.toFixed(2) }));
  }, [form.unitPrice, form.quantity, form.discount, form.taxPercentage]);

  // Aplicar foco quando entrar no modo de edição
  useLayoutEffect(() => {
    if (shouldFocus && descriptionRef.current && editingMode) {
      descriptionRef.current.focus();
      console.log('🎯 Foco aplicado via useLayoutEffect no campo description');
      setShouldFocus(false); // Reset do estado
    }
  }, [shouldFocus, editingMode]);

  const mapItem = (data: any): ServiceItem => {
    console.log('📌 Mapping item:', JSON.stringify(data, null, 2));
    return {
      id: Number(data.id) || null,
      serviceId: Number(data.serviceId) || null,
      description: data.description || '',
      quantity: data.quantity?.toString() || '1',
      unitType: data.unitType || UnitType.UNIT,
      unitPrice: data.unitPrice?.toString() || '0',
      discount: data.discount?.toString() || '0',
      taxPercentage: data.taxPercentage?.toString() || '0',
      taxValue: data.taxValue?.toString() || '0',
    };
  };

  const loadItems = async (serviceId: number) => {
    try {
      const res = await api.get(`/service-items?serviceId=${serviceId}`);
      console.log('📡 GET /service-items response:', JSON.stringify(res.data, null, 2));
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setItems(list.map(mapItem));
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError(err.response?.data?.message || t("serviceItem.loadError"));
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    console.log('🧹 Resetting form');
    setForm({ ...initial, serviceId: service?.id });
    setEditingMode(false);
    setShouldFocus(false);
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    
    // Limpar o foco do campo description
    if (descriptionRef.current) {
      descriptionRef.current.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Changing ${name}:`, value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 handleSave called:', JSON.stringify(form, null, 2));
    if (!service?.id) {
      setError(t("serviceItem.serviceRequired"));
      console.log('🚫 Validation failed: serviceId =', service?.id);
      return;
    }
    if (!form.description) {
      setError(t("serviceItem.descriptionRequired"));
      console.log('🚫 Validation failed: description =', form.description);
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError(t("serviceItem.quantityRequired"));
      console.log('🚫 Validation failed: quantity =', form.quantity);
      return;
    }
    if (isSubmitting) {
      console.log('🚫 Submission ignored: already in progress');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        id: form.id || null,
        serviceId: service.id,
        description: form.description,
        quantity: Number(form.quantity) || 1,
        unitType: form.unitType,
        unitPrice: Number(form.unitPrice) || 0,
        discount: Number(form.discount) || 0,
        taxPercentage: Number(form.taxPercentage) || 0,
        taxValue: Number(form.taxValue) || 0,
      };
      console.log('📤 Payload sent:', JSON.stringify(payload, null, 2));
      let res: any;
      if (form.id) {
        console.log('🔄 Updating item with id:', form.id);
        res = await api.put(`/service-items/${form.id}`, payload);
        console.log('✅ Save response (PUT):', JSON.stringify(res.data, null, 2));
        setSuccessMessage(t("serviceItem.updateSuccess"));
        setItems((prev) =>
          prev.map((i) => (i.id === res.data.id ? mapItem(res.data) : i))
        );
      } else {
        console.log('➕ Creating new item');
        res = await api.post('/service-items', payload);
        console.log('✅ Save response (POST):', JSON.stringify(res.data, null, 2));
        setSuccessMessage(t("serviceItem.saveSuccess"));
        setItems((prev) => [...prev, mapItem(res.data)]);
      }
      resetForm();
    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.response?.data?.message || t("serviceItem.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id: number | null) => {
    console.log('🗑️ handleDelete called: id =', id);
    if (!id) {
      setError('Invalid ID for deletion.');
      console.log('🚫 Invalid ID for deletion');
      return;
    }
    if (deleting) {
      console.log('🚫 Deletion already in progress');
      return;
    }
    if (!confirm(t("serviceItem.confirmDelete"))) {
      console.log('❌ Deletion cancelled by user');
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/service-items/${id}`);
      console.log('✅ Item deleted: id =', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSuccessMessage(t("serviceItem.deleteSuccess"));
      resetForm();
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError(err.response?.data?.message || t("serviceItem.deleteError"));
    } finally {
      setDeleting(false);
    }
  }, [deleting, t]);

  const handleEdit = (item: ServiceItem) => {
    console.log('✏️ Editing item:', JSON.stringify(item, null, 2));
    setForm({ ...item });
    
    // Habilitar a edição
    setEditingMode(true);
    setSuccessMessage(t("serviceItem.editing"));
    
    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleNew = () => {
    console.log('➕ handleNew called');
    resetForm();
    
    // Habilitar a edição
    setEditingMode(true);
    setSuccessMessage(t("serviceItem.creating"));
    
    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (isLoading) return <div className={styles.container}>{t("serviceItem.loading")}</div>;

  console.log('🔍 Items in table:', JSON.stringify(items, null, 2));

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.aviso}>{successMessage}</p>}
      
      {!service?.id && <p>{t("serviceItem.selectServiceMessage")}</p>}
      {service?.id && (
        <form ref={formRef} onSubmit={handleSave} onKeyDown={handleKeyDown} className={styles['form-container']}>
          <div className={styles['form-linha']}>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.service")}:</label>
              <input
                value={service.name || ''}
                className={styles['form-input']}
                disabled
                type="text"
                aria-label={t("serviceItem.service")}
              />
            </div>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.description")}:</label>
              <input
                ref={descriptionRef}
                name="description"
                value={form.description}
                onChange={handleChange}
                className={styles['form-input']}
                type="text"
                required
                disabled={!editingMode}
                aria-label={t("serviceItem.description")}
              />
            </div>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.unitType")}:</label>
              <select
                name="unitType"
                value={form.unitType}
                onChange={handleChange}
                className={styles['form-input']}
                disabled={!editingMode}
                aria-label={t("serviceItem.unitType")}
              >
                <option value={UnitType.UNIT}>{t('unitType.UNIT', { ns: 'enums', defaultValue: 'Unit' })}</option>
                <option value={UnitType.PIECE}>{t('unitType.PIECE', { ns: 'enums', defaultValue: 'Piece' })}</option>
                <option value={UnitType.METER}>{t('unitType.METER', { ns: 'enums', defaultValue: 'Meter' })}</option>
                <option value={UnitType.KILO}>{t('unitType.KILO', { ns: 'enums', defaultValue: 'Kilogram' })}</option>
                <option value={UnitType.LITER}>{t('unitType.LITER', { ns: 'enums', defaultValue: 'Liter' })}</option>
                <option value={UnitType.HOUR}>{t('unitType.HOUR', { ns: 'enums', defaultValue: 'Hour' })}</option>
                <option value={UnitType.KWH}>{t('unitType.KWH', { ns: 'enums', defaultValue: 'Kilowatt-hour' })}</option>
              </select>
            </div>
          </div>
          <div className={styles['form-linha']}>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.quantity")}:</label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className={styles['form-input']}
                type="number"
                step="0.01"
                required
                disabled={!editingMode}
                aria-label={t("serviceItem.quantity")}
              />
            </div>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.unitPrice")} ({t("services.serviceDetails.currency")}):</label>
              <input
                name="unitPrice"
                value={form.unitPrice}
                onChange={handleChange}
                className={styles['form-input']}
                type="number"
                step="0.01"
                disabled={!editingMode}
                aria-label={t("serviceItem.unitPrice")}
              />
            </div>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.discount")} ({t("services.serviceDetails.currency")}):</label>
              <input
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className={styles['form-input']}
                type="number"
                step="0.01"
                disabled={!editingMode}
                aria-label={t("serviceItem.discount")}
              />
            </div>
          </div>
          <div className={styles['form-linha']}>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.taxPercentage")} ({t("services.serviceDetails.percentage")}):</label>
              <div className={styles['campo-sufixo']}>
                <input
                  name="taxPercentage"
                  value={form.taxPercentage}
                  onChange={handleChange}
                  className={styles['form-input']}
                  type="number"
                  step="0.01"
                  disabled={!editingMode}
                  aria-label={t("serviceItem.taxPercentage")}
                />
                <span className={styles.sufixo}>{t("services.serviceDetails.percentage")}</span>
              </div>
            </div>
            <div className={styles.coluna}>
              <label className={styles['form-label']}>{t("serviceItem.taxValue")} ({t("services.serviceDetails.currency")}):</label>
              <input
                name="taxValue"
                value={form.taxValue}
                disabled
                className={styles['form-input']}
                type="number"
                step="0.01"
                aria-label={t("serviceItem.taxValue")}
              />
            </div>
            <div className={styles.coluna}>
              {/* Espaço reservado para futuras expansões */}
            </div>
          </div>

          <div className={styles['form-actions']}>
            {!editingMode && (
              <button
                type="button"
                className={styles['button-novo']}
                onClick={handleNew}
              >
                {t("serviceItem.new")}
              </button>
            )}
            {editingMode && (
              <>
                <button type="submit" className={styles.button} disabled={isSubmitting}>
                  {form.id ? t("serviceItem.update") : t("serviceItem.save")}
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.cancelar}`}
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  {t("serviceItem.cancel")}
                </button>
              </>
            )}
          </div>
        </form>
      )}
      <table className={styles['cliente-table']}>
        <thead>
          <tr>
            <th>{t("serviceItem.description")}</th>
            <th>{t("serviceItem.unitType")}</th>
            <th>{t("serviceItem.quantity")}</th>
            <th>{t("serviceItem.unitPrice")}</th>
            <th>{t("serviceItem.discount")}</th>
            <th>{t("serviceItem.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id ? `item-${i.id}` : `no-id-${i.description}-${Math.random()}`}>
              <td>{i.description}</td>
              <td>{i.unitType ? t('unitType.' + i.unitType, { ns: 'enums', defaultValue: i.unitType }) : t("common.noData")}</td>
              <td>{i.quantity}</td>
              <td>{i.unitPrice}</td>
              <td>{i.discount}</td>
              <td>
                <button
                  className={styles['button-editar']}
                  onClick={() => handleEdit(i)}
                  disabled={editingMode || isSubmitting}
                >
                  {t("serviceItem.edit")}
                </button>
                <button
                  className={styles['button-excluir']}
                  onClick={() => handleDelete(i.id)}
                  disabled={i.id == null || deleting || editingMode || isSubmitting}
                >
                  {t("serviceItem.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormServiceItem);
