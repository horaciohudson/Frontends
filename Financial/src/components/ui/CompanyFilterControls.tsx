import React from 'react';
import './CompanyFilterControls.css';

interface CompanyFilterControlsProps {
    typeFilter: 'all' | 'supplier' | 'customer' | 'transporter';
    onTypeFilterChange: (filter: 'all' | 'supplier' | 'customer' | 'transporter') => void;
    companyCounts: {
        total: number;
        suppliers: number;
        customers: number;
        transporters: number;
    };
}

const CompanyFilterControls: React.FC<CompanyFilterControlsProps> = ({
    typeFilter,
    onTypeFilterChange,
    companyCounts
}) => {
    return (
        <div className="company-filter-controls">
            <div className="filter-buttons">
                <button
                    className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => onTypeFilterChange('all')}
                >
                    📋 Todas ({companyCounts.total})
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'supplier' ? 'active' : ''}`}
                    onClick={() => onTypeFilterChange('supplier')}
                >
                    🏭 Fornecedores ({companyCounts.suppliers})
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'customer' ? 'active' : ''}`}
                    onClick={() => onTypeFilterChange('customer')}
                >
                    👥 Clientes ({companyCounts.customers})
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'transporter' ? 'active' : ''}`}
                    onClick={() => onTypeFilterChange('transporter')}
                >
                    🚚 Transportadoras ({companyCounts.transporters})
                </button>
            </div>
        </div>
    );
};

export default CompanyFilterControls;