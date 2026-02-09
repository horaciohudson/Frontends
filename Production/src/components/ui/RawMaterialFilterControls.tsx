import React from 'react';
import './RawMaterialFilterControls.css';

interface RawMaterialFilterControlsProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterActive: 'all' | 'active' | 'inactive';
    onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
    stockControlFilter: 'all' | 'controlled' | 'not_controlled';
    onStockControlFilterChange: (filter: 'all' | 'controlled' | 'not_controlled') => void;
    materialCounts: {
        total: number;
        active: number;
        inactive: number;
        controlled: number;
        notControlled: number;
    };
}

const RawMaterialFilterControls: React.FC<RawMaterialFilterControlsProps> = ({
    searchTerm,
    onSearchChange,
    filterActive,
    onFilterChange,
    stockControlFilter,
    onStockControlFilterChange,
    materialCounts
}) => {
    return (
        <div className="raw-material-filter-controls">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Buscar por código ou nome..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="form-input"
                />
            </div>

            <div className="filter-section">
                <h4 className="filter-section-title">Status</h4>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
                        onClick={() => onFilterChange('all')}
                    >
                        Todos ({materialCounts.total})
                    </button>
                    <button
                        className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
                        onClick={() => onFilterChange('active')}
                    >
                        Ativos ({materialCounts.active})
                    </button>
                    <button
                        className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
                        onClick={() => onFilterChange('inactive')}
                    >
                        Inativos ({materialCounts.inactive})
                    </button>
                </div>
            </div>

            <div className="filter-section">
                <h4 className="filter-section-title">Controle de Estoque</h4>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${stockControlFilter === 'all' ? 'active' : ''}`}
                        onClick={() => onStockControlFilterChange('all')}
                    >
                        Todos ({materialCounts.total})
                    </button>
                    <button
                        className={`filter-btn ${stockControlFilter === 'controlled' ? 'active' : ''}`}
                        onClick={() => onStockControlFilterChange('controlled')}
                    >
                        Controlados ({materialCounts.controlled})
                    </button>
                    <button
                        className={`filter-btn ${stockControlFilter === 'not_controlled' ? 'active' : ''}`}
                        onClick={() => onStockControlFilterChange('not_controlled')}
                    >
                        Não Controlados ({materialCounts.notControlled})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RawMaterialFilterControls;