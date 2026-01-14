import React from 'react';
import { useTranslation } from 'react-i18next';
import { TRANSLATION_NAMESPACES } from '../locales';

const SimpleI18nTest: React.FC = () => {
  try {
    const { t, i18n } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
    
    return (
      <div style={{ padding: '10px', border: '1px solid green', margin: '10px' }}>
        <h4>🧪 Teste Simples i18n</h4>
        <p>Idioma: {i18n.language}</p>
        <p>Tradução: {t('banks.title')}</p>
      </div>
    );
  } catch (error) {
    console.error('❌ Erro no SimpleI18nTest:', error);
    return (
      <div style={{ padding: '10px', border: '1px solid red', margin: '10px' }}>
        <h4>❌ Erro no i18n</h4>
        <p>Erro: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
};

export default SimpleI18nTest;
