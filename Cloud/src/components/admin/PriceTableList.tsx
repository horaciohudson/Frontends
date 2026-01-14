import React, { useState, useEffect } from 'react';
import { priceTablesAPI } from '../../services/api';
import type { PriceTable } from '../../types/priceTable';
import './PriceTableList.css';

interface PriceTableListProps {
    onEdit?: (table: PriceTable) => void;
    onViewItems?: (table: PriceTable) => void;
}

const PriceTableList: React.FC<PriceTableListProps> = ({ onEdit, onViewItems }) => {
    const [tables, setTables] = useState<PriceTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        try {
            setLoading(true);
            const response = await priceTablesAPI.getAll();
            // Ensure we always have an array
            const data = Array.isArray(response.data) ? response.data : [];
            setTables(data);
            setError(null);
        } catch (err: any) {
            console.error('Error loading price tables:', err);
            setError('Erro ao carregar tabelas de preço');
            setTables([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (id: number) => {
        if (!window.confirm('Importar VARIANTES (tamanhos e cores) com estoque > 0?\n\nISTO VAI LIMPAR E RECARREGAR TODOS OS ITENS DA TABELA.')) {
            return;
        }

        try {
            const response = await priceTablesAPI.importWithVariants(id);
            alert(response.data || 'Variantes importadas com sucesso!');
            loadTables();
        } catch (err: any) {
            console.error('Error importing variants:', err);
            alert('Erro ao importar variantes: ' + (err.response?.data || err.message));
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await priceTablesAPI.activate(id);
            alert('Tabela ativada com sucesso!');
            loadTables();
        } catch (err: any) {
            console.error('Error activating table:', err);
            alert('Erro ao ativar tabela: ' + (err.response?.data || err.message));
        }
    };

    const handleDeactivate = async (id: number) => {
        try {
            await priceTablesAPI.deactivate(id);
            alert('Tabela desativada com sucesso!');
            loadTables();
        } catch (err: any) {
            console.error('Error deactivating table:', err);
            alert('Erro ao desativar tabela: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a tabela "${name}"?`)) {
            return;
        }

        try {
            await priceTablesAPI.delete(id);
            alert('Tabela excluída com sucesso!');
            loadTables();
        } catch (err: any) {
            console.error('Error deleting table:', err);
            alert('Erro ao excluir tabela: ' + (err.response?.data || err.message));
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div className="price-table-list-loading">Carregando tabelas...</div>;
    }

    if (error) {
        return <div className="price-table-list-error">{error}</div>;
    }

    return (
        <div className="price-table-list">
            <div className="price-table-list-header">
                <h2>📊 Tabelas de Preço Atacado</h2>
                <button className="btn-new" onClick={() => onEdit?.(null as any)}>
                    + Nova Tabela
                </button>
            </div>

            {tables.length === 0 ? (
                <div className="price-table-list-empty">
                    <p>Nenhuma tabela de preço cadastrada.</p>
                    <button className="btn-primary" onClick={() => onEdit?.(null as any)}>
                        Criar Primeira Tabela
                    </button>
                </div>
            ) : (
                <div className="price-table-grid">
                    {tables.map((table) => (
                        <div key={table.id} className={`price-table-card ${table.active ? 'active' : ''}`}>
                            <div className="card-header">
                                <h3>{table.name}</h3>
                                {table.active && <span className="badge-active">ATIVA</span>}
                                {table.isDefault && <span className="badge-default">PADRÃO</span>}
                            </div>

                            {table.description && (
                                <p className="card-description">{table.description}</p>
                            )}

                            <div className="card-info">
                                <div className="info-row">
                                    <span className="label">Desconto Padrão:</span>
                                    <span className="value">{table.defaultDiscountPercentage || 0}%</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Produtos:</span>
                                    <span className="value">{table.itemCount || 0}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Vigência:</span>
                                    <span className="value">
                                        {formatDate(table.validFrom)} até {formatDate(table.validUntil)}
                                    </span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-action btn-items"
                                    onClick={() => onViewItems?.(table)}
                                    title="Ver produtos"
                                >
                                    📦 Produtos
                                </button>

                                <button
                                    className="btn-action btn-import"
                                    onClick={() => handleImport(table.id)}
                                    title="Importar variantes (tamanhos e cores)"
                                >
                                    📥 Importar
                                </button>

                                {!table.active ? (
                                    <button
                                        className="btn-action btn-activate"
                                        onClick={() => handleActivate(table.id)}
                                        title="Ativar tabela"
                                    >
                                        ✅ Ativar
                                    </button>
                                ) : (
                                    <button
                                        className="btn-action btn-deactivate"
                                        onClick={() => handleDeactivate(table.id)}
                                        title="Desativar tabela"
                                    >
                                        ⏸️ Desativar
                                    </button>
                                )}

                                <button
                                    className="btn-action btn-edit"
                                    onClick={() => onEdit?.(table)}
                                    title="Editar tabela"
                                >
                                    ✏️ Editar
                                </button>

                                <button
                                    className="btn-action btn-delete"
                                    onClick={() => handleDelete(table.id, table.name)}
                                    title="Excluir tabela"
                                >
                                    🗑️ Excluir
                                </button>
                            </div>

                            <div className="card-footer">
                                <small>Criada em: {formatDate(table.createdAt)}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PriceTableList;
