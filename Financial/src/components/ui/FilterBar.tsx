import React from 'react';
import type { FilterDefinition, SelectOption } from '../../types/common';
import './FilterBar.css';

interface FilterBarProps {
  filters: FilterDefinition[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onSearch,
  onClear,
  loading = false
}) => {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const renderFilter = (filter: FilterDefinition) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            className="filter-input"
            placeholder={filter.placeholder || `Buscar ${filter.label.toLowerCase()}...`}
            value={(value as string) || ''}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );

      case 'select':
        return (
          <select
            className="filter-select"
            value={(value as string) || ''}
            onChange={(e) => handleChange(filter.key, e.target.value || undefined)}
          >
            <option value="">{filter.placeholder || `Todos`}</option>
            {filter.options?.map((option: SelectOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            className="filter-input"
            value={(value as string) || ''}
            onChange={(e) => handleChange(filter.key, e.target.value || undefined)}
          />
        );

      case 'dateRange':
        const rangeValue = value as { start?: string; end?: string } || {};
        return (
          <div className="filter-date-range">
            <input
              type="date"
              className="filter-input"
              placeholder="Data inicial"
              value={rangeValue.start || ''}
              onChange={(e) => handleChange(filter.key, { ...rangeValue, start: e.target.value || undefined })}
            />
            <span className="date-range-separator">até</span>
            <input
              type="date"
              className="filter-input"
              placeholder="Data final"
              value={rangeValue.end || ''}
              onChange={(e) => handleChange(filter.key, { ...rangeValue, end: e.target.value || undefined })}
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            className="filter-input"
            placeholder={filter.placeholder}
            value={(value as number) || ''}
            onChange={(e) => handleChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            onKeyDown={handleKeyDown}
          />
        );

      case 'multiSelect':
        const selectedValues = (value as string[]) || [];
        return (
          <div className="filter-multi-select">
            <select
              className="filter-select"
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  handleChange(filter.key, [...selectedValues, e.target.value]);
                }
              }}
            >
              <option value="">{filter.placeholder || 'Selecionar...'}</option>
              {filter.options
                ?.filter((opt: SelectOption) => !selectedValues.includes(String(opt.value)))
                .map((option: SelectOption) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            {selectedValues.length > 0 && (
              <div className="selected-tags">
                {selectedValues.map((val) => {
                  const option = filter.options?.find((o: SelectOption) => String(o.value) === val);
                  return (
                    <span key={val} className="selected-tag">
                      {option?.label || val}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => handleChange(filter.key, selectedValues.filter((v) => v !== val))}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-fields">
        {filters.map((filter) => (
          <div key={filter.key} className="filter-field">
            <label className="filter-label">{filter.label}</label>
            {renderFilter(filter)}
          </div>
        ))}
      </div>
      <div className="filter-actions">
        <button
          type="button"
          className="filter-btn search"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? 'Buscando...' : '🔍 Buscar'}
        </button>
        <button
          type="button"
          className="filter-btn clear"
          onClick={onClear}
          disabled={loading}
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
