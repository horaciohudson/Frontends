import React from 'react';
import type { ColumnDefinition, ActionDefinition, PaginationState } from '../../types/common';
import './DataTable.css';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  actions?: ActionDefinition<T>[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  keyField?: keyof T;
}

function DataTable<T extends { id?: number | string }>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onRowClick,
  actions,
  sortField,
  sortDirection = 'asc',
  emptyMessage = 'Nenhum registro encontrado',
  keyField = 'id' as keyof T
}: DataTableProps<T>) {

  // Verificação de segurança para garantir que data seja sempre um array
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (field: string) => {
    if (!onSort) return;

    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const renderSortIcon = (field: string, sortable?: boolean) => {
    if (!sortable) return null;

    if (sortField !== field) {
      return <span className="sort-icon">⇅</span>;
    }

    return <span className="sort-icon active">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const renderCell = (row: T, column: ColumnDefinition<T>) => {
    const value = column.key.toString().includes('.')
      ? column.key.toString().split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], row)
      : (row as Record<string, unknown>)[column.key as string];

    if (column.render) {
      return column.render(value, row);
    }

    return value as React.ReactNode;
  };

  const renderPagination = () => {
    if (!pagination || !onPageChange) return null;

    const { page, totalPages, totalElements, size } = pagination;
    const startItem = page * size + 1;
    const endItem = Math.min((page + 1) * size, totalElements);

    return (
      <div className="data-table-pagination">
        <span className="pagination-info">
          Mostrando {startItem} - {endItem} de {totalElements}
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            title="Primeira página"
          >
            ««
          </button>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            title="Página anterior"
          >
            «
          </button>
          <span className="pagination-current">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            title="Próxima página"
          >
            »
          </button>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
            title="Última página"
          >
            »»
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="data-table-container">
        <div className="data-table-loading">
          <div className="loading-spinner"></div>
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                >
                  {column.header}
                  {renderSortIcon(column.key as string, column.sortable)}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {safeData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              safeData.map((row, index) => (
                <tr
                  key={String(row[keyField]) || index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'clickable' : ''}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="actions-cell">
                      {actions
                        .filter((action) => !action.show || action.show(row))
                        .map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`action-btn ${action.variant || 'secondary'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            title={action.label}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

export default DataTable;
