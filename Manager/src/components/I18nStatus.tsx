import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function I18nStatus() {
  const { t, i18n: i18nInstance } = useTranslation();

  const testCommonTranslations = () => {
    console.log('Common translations test');
  };

  const testCommercialTranslations = () => {
    console.log('Commercial translations test');
  };

  const checkResourceBundles = () => {
    console.log('Resource bundles check');
  };

  const forceReloadCommon = () => {
    i18n.reloadResources('pt', 'common');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>i18n Status</h3>
      <p><strong>Current Language:</strong> {i18nInstance.language}</p>
      <p><strong>Is Initialized:</strong> {i18nInstance.isInitialized ? 'Yes' : 'No'}</p>
      <p><strong>Has Common Namespace:</strong> {i18nInstance.hasResourceBundle(i18nInstance.language, 'common') ? 'Yes' : 'No'}</p>
      <p><strong>Has Commercial Namespace:</strong> {i18nInstance.hasResourceBundle(i18nInstance.language, 'commercial') ? 'Yes' : 'No'}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={testCommonTranslations} style={{ marginRight: '10px' }}>
          Test Common
        </button>
        <button onClick={testCommercialTranslations} style={{ marginRight: '10px' }}>
          Test Commercial
        </button>
        <button onClick={checkResourceBundles} style={{ marginRight: '10px' }}>
          Check Bundles
        </button>
        <button onClick={forceReloadCommon}>
          Reload Common
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Translation Tests:</h4>
        <p><strong>Common - New:</strong> {t('buttons.new', { ns: 'commercial' })}</p>
        <p><strong>Commercial - New:</strong> {t('buttons.new', { ns: 'commercial' })}</p>
      </div>
    </div>
  );
}


