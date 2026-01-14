import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TestPrincipalNamespace() {
  const { t, i18n } = useTranslation();

  const checkPrincipalNamespace = () => {
    console.log('Principal namespace check');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Test Principal Namespace</h3>
      <p><strong>Current Language:</strong> {i18n.language}</p>
      <p><strong>Is Initialized:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</p>
      <p><strong>Has Principal Namespace:</strong> {i18n.hasResourceBundle(i18n.language, 'principal') ? 'Yes' : 'No'}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={checkPrincipalNamespace}>
          Check Principal Namespace
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Translation Tests:</h4>
        <p><strong>sidebar.dashboard:</strong> {t('sidebar.dashboard')}</p>
        <p><strong>customers.title:</strong> {t('customers.title')}</p>
        <p><strong>currentAccounts.title:</strong> {t('currentAccounts.title')}</p>
      </div>
    </div>
  );
}
