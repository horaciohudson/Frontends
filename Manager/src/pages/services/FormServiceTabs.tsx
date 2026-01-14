import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TRANSLATION_NAMESPACES } from '../../locales';
import FormService from './FormService';
import FormServiceItem from './FormServiceItem';
import { Service } from '../../models/Service';
import styles from '../../styles/services/FormServiceTabs.module.css';

export default function FormServiceTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  
  const [activeTab, setActiveTab] = useState<'service' | 'service-item'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleSelectService = (service: Service | null) => {
    setSelectedService(service);
  };

  const handleDoubleClickService = (service: Service) => {
    setSelectedService(service);
    setTimeout(() => setActiveTab('service-item'), 100);
  };

  const tabsEnabled = !!selectedService;

  return (
    <div className={styles.container}>
      <h2>{t('services.title')}</h2>
      {selectedService && (
        <div className={styles.activeService}>
          {t('services.activeService')}: <strong>{selectedService.name} ({selectedService.id})</strong>
        </div>
      )}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'service' ? styles.active : ''}`}
          onClick={() => setActiveTab('service')}
        >
          {t('services.service')}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'service-item' ? styles.active : ''}`}
          onClick={() => tabsEnabled && setActiveTab('service-item')}
          disabled={!tabsEnabled}
        >
          {t('services.serviceItem')}
        </button>
      </div>
      <div className={styles.content}>
        {activeTab === 'service' && (
          <FormService onSelectService={handleSelectService} onDoubleClickService={handleDoubleClickService} />
        )}
        {activeTab === 'service-item' && selectedService && (
          <FormServiceItem service={selectedService} />
        )}
      </div>
    </div>
  );
}
