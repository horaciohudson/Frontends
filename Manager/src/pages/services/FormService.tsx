import { useEffect, useRef, useState, memo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Service, Group } from '../../models/Service';
import { TRANSLATION_NAMESPACES } from '../../locales';
import api from '../../service/api';
import styles from '../../styles/services/FormService.module.css';

interface Props {
  onSelectService: (service: Service | null) => void;
  onDoubleClickService?: (service: Service) => void;
}

const initial: Service = {
  id: null,
  name: '',
  groupId: null,
  groupName: '',
  technicalRef: '',
  baseValue: '0',
  costValue: '0',
  saleValue: '0',
  compositionValue: '0',
  salespersonCommission: '0',
  brokerCommission: '0',
  issPercentage: '0',
  issValue: '0',
  hasComposition: false,
  isProduct: false,
  intervalMinutes: 0,
  active: true,
};

const FormService = ({ onSelectService, onDoubleClickService }: Props) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<Service>(initial);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [shouldFocus, setShouldFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    console.log('🚀 Starting initial loading');
    setIsLoading(true);
    Promise.all([loadServices(), loadGroups()])
      .then(() => {
        console.log('✅ Initial loading completed');
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error in initial loading:', err);
        setError(t("services.serviceDetails.loadError"));
        setIsLoading(false);
      });
  }, [t]);

  // Aplicar foco quando entrar no modo de edição
  useLayoutEffect(() => {
    if (shouldFocus && nameRef.current && editingMode) {
      nameRef.current.focus();
      console.log('🎯 Foco aplicado via useLayoutEffect no campo name');
      setShouldFocus(false); // Reset do estado
    }
  }, [shouldFocus, editingMode]);

  const loadServices = async () => {
    try {
      const res = await api.get('/services');
      console.log('📡 GET /services response:', JSON.stringify(res.data, null, 2));
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedList = list.map((e: any) => ({
        id: Number(e.id) || null,
        name: e.name || '',
        groupId: Number(e.groupId) || null,
        groupName: e.groupName || '',
        technicalRef: e.technicalRef || '',
        baseValue: e.baseValue?.toString() || '0',
        costValue: e.costValue?.toString() || '0',
        saleValue: e.saleValue?.toString() || '0',
        compositionValue: e.compositionValue?.toString() || '0',
        salespersonCommission: e.salespersonCommission?.toString() || '0',
        brokerCommission: e.brokerCommission?.toString() || '0',
        issPercentage: e.issPercentage?.toString() || '0',
        issValue: e.issValue?.toString() || '0',
        hasComposition: Boolean(e.hasComposition),
        isProduct: Boolean(e.isProduct),
        intervalMinutes: Number(e.intervalMinutes) || 0,
        active: Boolean(e.active),
      }));
      console.log('📥 Services received:', JSON.stringify(mappedList, null, 2));
      setServices(mappedList);
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError(err.response?.data?.message || t("services.serviceDetails.loadError"));
    }
  };

  const loadGroups = async () => {
    try {
      const res = await api.get('/groups');
      console.log('📡 GET /groups response:', JSON.stringify(res.data, null, 2));
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setGroups(list.map((g: any) => ({
        id: Number(g.id) || null,
        name: g.name || '',
      })));
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError(err.response?.data?.message || t("services.serviceDetails.loadError"));
    }
  };

  const resetForm = () => {
    console.log('🧹 Resetting form');
    setForm(initial);
    setEditingMode(false);
    setShouldFocus(false);
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    onSelectService(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    console.log(`📝 Changing ${name}:`, value || checked);
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'groupId' ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 handleSave called:', JSON.stringify(form, null, 2));
    if (!formRef.current || e.currentTarget !== formRef.current) {
      console.log('🚫 Submission ignored: event not originated from form');
      return;
    }
    if (isSubmitting) {
      console.log('🚫 Submission ignored: already in progress');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!form.name) {
      setError(t("services.serviceDetails.nameRequired"));
      console.log('🚫 Validation failed: name =', form.name);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        id: form.id || null,
        name: form.name,
        groupId: form.groupId || null,
        groupName: form.groupName || null,
        technicalRef: form.technicalRef || null,
        baseValue: form.baseValue ? Number(form.baseValue) : null,
        costValue: form.costValue ? Number(form.costValue) : null,
        saleValue: form.saleValue ? Number(form.saleValue) : null,
        compositionValue: form.compositionValue ? Number(form.compositionValue) : null,
        salespersonCommission: form.salespersonCommission ? Number(form.salespersonCommission) : null,
        brokerCommission: form.brokerCommission ? Number(form.brokerCommission) : null,
        issPercentage: form.issPercentage ? Number(form.issPercentage) : null,
        issValue: form.issValue ? Number(form.issValue) : null,
        hasComposition: form.hasComposition,
        isProduct: form.isProduct,
        intervalMinutes: form.intervalMinutes ? Number(form.intervalMinutes) : null,
        active: form.active,
      };
      console.log('📤 Payload sent:', JSON.stringify(payload, null, 2));
      let res;
      if (form.id) {
        res = await api.put(`/services/${form.id}`, payload);
        console.log('✅ Save response (PUT):', JSON.stringify(res.data, null, 2));
        setSuccessMessage(t("services.serviceDetails.updateSuccess"));
        setServices((prev) =>
          prev.map((s) =>
            s.id === res.data.id
                              ? {
                    id: Number(res.data.id) || null,
                    name: res.data.name || '',
                    groupId: Number(res.data.groupId) || null,
                    groupName: res.data.groupName || '',
                    technicalRef: res.data.technicalRef || '',
                    baseValue: res.data.baseValue?.toString() || '0',
                    costValue: res.data.costValue?.toString() || '0',
                    saleValue: res.data.saleValue?.toString() || '0',
                    compositionValue: res.data.compositionValue?.toString() || '0',
                    salespersonCommission: res.data.salespersonCommission?.toString() || '0',
                    brokerCommission: res.data.brokerCommission?.toString() || '0',
                    issPercentage: res.data.issPercentage?.toString() || '0',
                    issValue: res.data.issValue?.toString() || '0',
                    hasComposition: Boolean(res.data.hasComposition),
                    isProduct: Boolean(res.data.isProduct),
                    intervalMinutes: Number(res.data.intervalMinutes) || 0,
                    active: Boolean(res.data.active),
                  }
              : s
          )
        );
      } else {
        res = await api.post('/services', payload);
        console.log('✅ Save response (POST):', JSON.stringify(res.data, null, 2));
        setSuccessMessage(t("services.serviceDetails.saveSuccess"));
        setServices((prev) => [
          ...prev,
          {
            id: Number(res.data.id) || null,
            name: res.data.name || '',
            groupId: Number(res.data.groupId) || null,
            groupName: res.data.groupName || '',
            technicalRef: res.data.technicalRef || '',
            baseValue: res.data.baseValue?.toString() || '0',
            costValue: res.data.costValue?.toString() || '0',
            saleValue: res.data.saleValue?.toString() || '0',
            compositionValue: res.data.compositionValue?.toString() || '0',
            salespersonCommission: res.data.salespersonCommission?.toString() || '0',
            brokerCommission: res.data.brokerCommission?.toString() || '0',
            issPercentage: res.data.issPercentage?.toString() || '0',
            issValue: res.data.issValue?.toString() || '0',
            hasComposition: Boolean(res.data.hasComposition),
            isProduct: Boolean(res.data.isProduct),
            intervalMinutes: Number(res.data.intervalMinutes) || 0,
            active: Boolean(res.data.active),
          },
        ]);
      }
      onSelectService({
        id: Number(res.data.id) || null,
        name: res.data.name || '',
      });
      resetForm();
    } catch (err: any) {
      console.error('Error saving:', err);
      const msg = err.response?.status === 409
        ? t("services.serviceDetails.alreadyExists")
        : err.response?.data?.message || t("services.serviceDetails.saveError");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleDelete = debounce(async (id: number | null) => {
    console.log('🗑️ handleDelete called: id =', id);
    if (!id) {
      setError('Invalid ID for deletion.');
      return;
    }
    if (deleting) {
      console.log('🚫 Deletion already in progress');
      return;
    }
    if (!confirm(t("services.serviceDetails.confirmDelete"))) {
      console.log('❌ Deletion cancelled by user');
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/services/${id}`);
      console.log('✅ Service deleted: id =', id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setSuccessMessage(t("services.serviceDetails.deleteSuccess"));
      resetForm();
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError(err.response?.data?.message || t("services.serviceDetails.deleteError"));
    } finally {
      setDeleting(false);
    }
  }, 100);

  const handleEdit = (service: Service) => {
    console.log('✏️ Editing service:', JSON.stringify(service, null, 2));
    console.log('📌 groupId in handleEdit:', service.groupId);
    setForm({ ...service });
    setEditingMode(true);
    setSuccessMessage(t("services.serviceDetails.editing"));
    onSelectService({
      id: service.id,
      name: service.name,
    });
    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleNew = () => {
    console.log('➕ handleNew called');
    resetForm();
    setEditingMode(true);
    setSuccessMessage(t("services.serviceDetails.creating"));
    // Marcar que deve aplicar o foco
    setShouldFocus(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('⌨️ Enter blocked in input');
    }
  };

  if (isLoading) return <div className={styles.container}>{t("services.serviceDetails.loading")}</div>;

  console.log('🔍 Services in table:', JSON.stringify(services, null, 2));

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.aviso}>{successMessage}</p>}
      
      <form ref={formRef} onSubmit={handleSave} className={styles['form-container']}>
        <div className={styles['form-linha']}>
          <div className={`${styles.coluna} ${styles['coluna-nome']}`}>
            <label className={styles['form-label']}>{t("services.serviceDetails.name")}:</label>
            <input
              ref={nameRef}
              name="name"
              value={form.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="text"
              required
              aria-label={t("services.serviceDetails.name")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.group")}:</label>
            <select
              name="groupId"
              value={form.groupId || ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              aria-label={t("services.serviceDetails.group")}
            >
              <option value="">{t("services.serviceDetails.select")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.technicalRef")}:</label>
            <input
              name="technicalRef"
              value={form.technicalRef}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="text"
              aria-label={t("services.serviceDetails.technicalRef")}
            />
          </div>
        </div>
        <div className={styles['form-linha']}>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.baseValue")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="baseValue"
              value={form.baseValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.baseValue")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.costValue")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="costValue"
              value={form.costValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.costValue")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.saleValue")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="saleValue"
              value={form.saleValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.saleValue")}
            />
          </div>
        </div>
        <div className={styles['form-linha']}>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.compositionValue")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="compositionValue"
              value={form.compositionValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.compositionValue")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.salespersonCommission")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="salespersonCommission"
              value={form.salespersonCommission}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.salespersonCommission")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.brokerCommission")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="brokerCommission"
              value={form.brokerCommission}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.brokerCommission")}
            />
          </div>
        </div>
        <div className={styles['form-linha']}>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.issPercentage")} (%):</label>
            <input
              name="issPercentage"
              value={form.issPercentage}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.issPercentage")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.issValue")} ({t("services.serviceDetails.currency")}):</label>
            <input
              name="issValue"
              value={form.issValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              step="0.01"
              aria-label={t("services.serviceDetails.issValue")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.interval")} ({t("services.serviceDetails.minutes")}):</label>
            <input
              name="intervalMinutes"
              value={form.intervalMinutes}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles['form-input']}
              disabled={!editingMode}
              type="number"
              aria-label={t("services.serviceDetails.interval")}
            />
          </div>
        </div>
        <div className={styles['form-linha']}>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.hasComposition")}:</label>
            <input
              name="hasComposition"
              type="checkbox"
              checked={form.hasComposition}
              onChange={handleChange}
              className={styles['form-checkbox']}
              disabled={!editingMode}
              aria-label={t("services.serviceDetails.hasComposition")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.isProduct")}:</label>
            <input
              name="isProduct"
              type="checkbox"
              checked={form.isProduct}
              onChange={handleChange}
              className={styles['form-checkbox']}
              disabled={!editingMode}
              aria-label={t("services.serviceDetails.isProduct")}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles['form-label']}>{t("services.serviceDetails.active")}:</label>
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
              className={styles['form-checkbox']}
              disabled={!editingMode}
              aria-label={t("services.serviceDetails.active")}
            />
          </div>
        </div>

        <div className={styles['form-actions']}>
          {!editingMode && (
            <button
              type="button"
              className={styles['button-novo']}
              onClick={handleNew}
            >
              {t("services.serviceDetails.newService")}
            </button>
          )}
          {editingMode && (
            <>
              <button type="submit" className={styles.button} disabled={isSubmitting}>
                {form.id ? t("services.serviceDetails.update") : t("services.serviceDetails.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={isSubmitting}
              >
                {t("services.serviceDetails.cancel")}
              </button>
            </>
          )}
        </div>
      </form>
      <table className={styles['cliente-table']}>
        <thead>
          <tr>
            <th>{t("services.serviceDetails.name")}</th>
            <th>{t("services.serviceDetails.group")}</th>
            <th>{t("services.serviceDetails.technicalRef")}</th>
            <th>{t("services.serviceDetails.baseValue")}</th>
            <th>{t("services.serviceDetails.costValue")}</th>
            <th>{t("services.serviceDetails.saleValue")}</th>
            <th>{t("services.serviceDetails.active")}</th>
            <th>{t("services.serviceDetails.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr 
              key={s.id ? `service-${s.id}` : `no-id-${s.name}`}
              className={styles['clickable-row']}
              onDoubleClick={() => onDoubleClickService?.(s)}
              title={t("services.serviceDetails.doubleClickToSelect")}
            >
              <td>{s.name}</td>
              <td>{s.groupName}</td>
              <td>{s.technicalRef}</td>
              <td>{s.baseValue}</td>
              <td>{s.costValue}</td>
              <td>{s.saleValue}</td>
              <td>{s.active ? t("services.serviceDetails.yes") : t("services.serviceDetails.no")}</td>
              <td>
                <button
                  className={styles['button-editar']}
                  onClick={() => handleEdit(s)}
                  disabled={editingMode || isSubmitting}
                >
                  {t("services.serviceDetails.edit")}
                </button>
                <button
                  className={styles['button-excluir']}
                  onClick={() => handleDelete(s.id)}
                  disabled={s.id == null || deleting || editingMode || isSubmitting}
                >
                  {t("services.serviceDetails.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormService);
