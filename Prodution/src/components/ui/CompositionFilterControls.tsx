import React from 'react';
import './CompositionFilterControls.css';

interface CompositionFilterControlsProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterActive: 'all' | 'active' | 'inactive';
    onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
    filterApproved: 'all' | 'approved' | 'pending';
    onApprovedFilterChange: (filter: 'all' | 'approved' | 'pending') => void;
    compositionCounts: {
        total: number;
        active: number;
        inactive: number;
        approved: number;
        pending: number;
    };
}

const CompositionFilterControls: React.FC<CompositionFilterControlsProps> = ({
    searchTerm,
    onSearchChange,
    filterActive,
    onFilterChange,
    filterApproved,
    onApprovedFilterChange,
    compositionCounts
}) => {
    return (
        <div className="composition-filter-controls">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Buscar por nome da composição ou produto..."
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
                        Todos ({compositionCounts.total})
                    </button>
                    <button
                        className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
                        onClick={() => onFilterChange('active')}
                    >
                        Ativos ({compositionCounts.active})
                    </button>
                    <button
                        className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
                        onClick={() => onFilterChange('inactive')}
                    >
                        Inativos ({compositionCounts.inactive})
                    </button>
                </div>
            </div>

            <div className="filter-section">
                <h4 className="filter-section-title">Aprovação</h4>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterApproved === 'all' ? 'active' : ''}`}
                        onClick={() => onApprovedFilterChange('all')}
                    >
                        Todos ({compositionCounts.total})
                    </button>
                    <button
                        className={`filter-btn ${filterApproved === 'approved' ? 'active' : ''}`}
                        onClick={() => onApprovedFilterChange('approved')}
                    >
                        Aprovados ({compositionCounts.approved})
                    </button>
                    <button
                        className={`filter-btn ${filterApproved === 'pending' ? 'active' : ''}`}
                        onClick={() => onApprovedFilterChange('pending')}
                    >
                        Pendentes ({compositionCounts.pending})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompositionFilterControls;