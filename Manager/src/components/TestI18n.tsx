import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../enums/OrderStatus';
import { OrderType } from '../enums/OrderType';

export default function TestI18n() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Teste de Traduções dos Enums</h3>
      
      <h4>OrderStatus:</h4>
      <ul>
        {Object.values(OrderStatus).map(status => (
          <li key={status}>
            <strong>{status}:</strong> {t(`order.enums.status.${status}`)}
          </li>
        ))}
      </ul>
      
      <h4>OrderType:</h4>
      <ul>
        {Object.values(OrderType).map(type => (
          <li key={type}>
            <strong>{type}:</strong> {t(`order.enums.orderType.${type}`)}
          </li>
        ))}
      </ul>
      
      <h4>Debug Info:</h4>
      <p>Idioma atual: {t('common.language') || 'N/A'}</p>
      <p>OrderStatus enum: {JSON.stringify(OrderStatus)}</p>
      <p>OrderType enum: {JSON.stringify(OrderType)}</p>
    </div>
  );
}
