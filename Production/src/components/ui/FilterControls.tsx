import React from 'react';
import './FilterControls.css';

interface FilterControlsProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterActive: 'all' | 'active' | 'inactive';
    onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
    productCounts: {
        total: number;
        active: number;
        inactive: number;
    };
}

const FilterControls: React.FC<FilterControlsProps> = ({
    searchTerm,
    onSearchChange,
    filterActive,
    onFilterChange,
    productCounts
}) => {
    return (
        <div className="filter-controls">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Buscar por descrição, SKU ou código de barras..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="form-input"
                />
            </div>

            <div className="filter-buttons">
                <button
                    className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
                    onClick={() => onFilterChange('all')}
                >
                    Todos ({productCounts.total})
                </button>
                <button
                    className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
                    onClick={() => onFilterChange('active')}
                >
                    Ativos ({productCounts.active})
                </button>
                <button
                    className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
                    onClick={() => onFilterChange('inactive')}
                >
                    Inativos ({productCounts.inactive})
                </button>
            </div>
        </div>
    );
};

export default FilterControls;