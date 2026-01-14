import { useState } from 'react';
import './Filters.css';

export interface FilterState {
    categories: string[];
    priceRange: { min: number; max: number };
    condition: string[];
    inStock: boolean;
}

interface FiltersProps {
    categories: { id: string; name: string }[];
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

const DEFAULT_FILTERS: FilterState = {
    categories: [],
    priceRange: { min: 0, max: 10000 },
    condition: [],
    inStock: false
};

function Filters({ categories, onFilterChange, initialFilters = DEFAULT_FILTERS }: FiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        condition: true,
        stock: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryChange = (categoryId: string) => {
        const newCategories = filters.categories.includes(categoryId)
            ? filters.categories.filter(id => id !== categoryId)
            : [...filters.categories, categoryId];

        const newFilters = { ...filters, categories: newCategories };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (type: 'min' | 'max', value: number) => {
        const newFilters = {
            ...filters,
            priceRange: { ...filters.priceRange, [type]: value }
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleConditionChange = (condition: string) => {
        const newConditions = filters.condition.includes(condition)
            ? filters.condition.filter(c => c !== condition)
            : [...filters.condition, condition];

        const newFilters = { ...filters, condition: newConditions };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleStockChange = () => {
        const newFilters = { ...filters, inStock: !filters.inStock };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        setFilters(DEFAULT_FILTERS);
        onFilterChange(DEFAULT_FILTERS);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.categories.length > 0) count += filters.categories.length;
        if (filters.condition.length > 0) count += filters.condition.length;
        if (filters.inStock) count += 1;
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count += 1;
        return count;
    };

    const activeCount = getActiveFiltersCount();

    return (
        <div className="filters">
            <div className="filters-header">
                <h3>Filtros</h3>
                {activeCount > 0 && (
                    <button className="clear-filters" onClick={handleClearFilters}>
                        Limpar ({activeCount})
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('categories')}
                >
                    <span>Categorias</span>
                    <span className="toggle-icon">{expandedSections.categories ? '−' : '+'}</span>
                </button>
                {expandedSections.categories && (
                    <div className="filter-section-content">
                        {categories.map(category => (
                            <label key={category.id} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                />
                                <span>{category.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('price')}
                >
                    <span>Faixa de Preço</span>
                    <span className="toggle-icon">{expandedSections.price ? '−' : '+'}</span>
                </button>
                {expandedSections.price && (
                    <div className="filter-section-content">
                        <div className="price-inputs">
                            <div className="price-input-group">
                                <label>Mín</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={filters.priceRange.min}
                                    onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                                />
                            </div>
                            <span className="price-separator">-</span>
                            <div className="price-input-group">
                                <label>Máx</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={filters.priceRange.max}
                                    onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="price-range-display">
                            R$ {filters.priceRange.min} - R$ {filters.priceRange.max}
                        </div>
                    </div>
                )}
            </div>

            {/* Condition */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('condition')}
                >
                    <span>Condição</span>
                    <span className="toggle-icon">{expandedSections.condition ? '−' : '+'}</span>
                </button>
                {expandedSections.condition && (
                    <div className="filter-section-content">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.condition.includes('NEW')}
                                onChange={() => handleConditionChange('NEW')}
                            />
                            <span>Novo</span>
                        </label>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.condition.includes('USED')}
                                onChange={() => handleConditionChange('USED')}
                            />
                            <span>Usado</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Stock */}
            <div className="filter-section">
                <button
                    className="filter-section-header"
                    onClick={() => toggleSection('stock')}
                >
                    <span>Disponibilidade</span>
                    <span className="toggle-icon">{expandedSections.stock ? '−' : '+'}</span>
                </button>
                {expandedSections.stock && (
                    <div className="filter-section-content">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.inStock}
                                onChange={handleStockChange}
                            />
                            <span>Apenas em estoque</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Filters;
export type { FiltersProps };
