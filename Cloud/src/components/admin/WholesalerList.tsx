import { useState, useEffect } from 'react';
import { wholesalersAPI } from '../../services/api';
import './WholesalerList.css';

interface Wholesaler {
    id: number;
    wholesalerUuid: string;
    cnpj: string;
    companyName: string;
    tradeName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    commercialEmail: string;
    commercialPhone: string;
    legalRepName: string;
    createdAt: string;
    approvedAt?: string;
    rejectionReason?: string;
}

interface WholesalerListProps {
    onViewDetails: (wholesaler: Wholesaler) => void;
}

function WholesalerList({ onViewDetails }: WholesalerListProps) {
    const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('ALL');

    useEffect(() => {
        loadWholesalers();
    }, [filter]);

    const loadWholesalers = async () => {
        try {
            setLoading(true);
            const response = filter === 'ALL'
                ? await wholesalersAPI.getAll()
                : await wholesalersAPI.getByStatus(filter);

            setWholesalers(response.data.content || response.data);
        } catch (error) {
            console.error('Error loading wholesalers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            PENDING: { label: '⏳ Pendente', className: 'status-pending' },
            APPROVED: { label: '✅ Aprovado', className: 'status-approved' },
            REJECTED: { label: '❌ Rejeitado', className: 'status-rejected' },
            SUSPENDED: { label: '⚠️ Suspenso', className: 'status-suspended' }
        };

        const badge = badges[status] || { label: status, className: '' };
        return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatCNPJ = (cnpj: string) => {
        if (cnpj === '00000000000000') return 'Não informado';
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    if (loading) {
        return <div className="loading">⏳ Carregando revendedores...</div>;
    }

    return (
        <div className="wholesaler-list">
            <div className="list-header">
                <h2>📋 Gerenciar Revendedores</h2>
                <div className="filter-buttons">
                    <button
                        className={filter === 'ALL' ? 'active' : ''}
                        onClick={() => setFilter('ALL')}
                    >
                        Todos
                    </button>
                    <button
                        className={filter === 'PENDING' ? 'active' : ''}
                        onClick={() => setFilter('PENDING')}
                    >
                        ⏳ Pendentes
                    </button>
                    <button
                        className={filter === 'APPROVED' ? 'active' : ''}
                        onClick={() => setFilter('APPROVED')}
                    >
                        ✅ Aprovados
                    </button>
                    <button
                        className={filter === 'REJECTED' ? 'active' : ''}
                        onClick={() => setFilter('REJECTED')}
                    >
                        ❌ Rejeitados
                    </button>
                    <button
                        className={filter === 'SUSPENDED' ? 'active' : ''}
                        onClick={() => setFilter('SUSPENDED')}
                    >
                        ⚠️ Suspensos
                    </button>
                </div>
            </div>

            {wholesalers.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum revendedor encontrado.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="wholesaler-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Razão Social</th>
                                <th>CNPJ</th>
                                <th>Responsável</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Data Cadastro</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wholesalers.map((wholesaler) => (
                                <tr key={wholesaler.id}>
                                    <td>{getStatusBadge(wholesaler.status)}</td>
                                    <td>
                                        <strong>{wholesaler.companyName}</strong>
                                        {wholesaler.tradeName && wholesaler.tradeName !== wholesaler.companyName && (
                                            <div className="trade-name">{wholesaler.tradeName}</div>
                                        )}
                                    </td>
                                    <td>{formatCNPJ(wholesaler.cnpj)}</td>
                                    <td>{wholesaler.legalRepName}</td>
                                    <td>{wholesaler.commercialEmail}</td>
                                    <td>{wholesaler.commercialPhone || '-'}</td>
                                    <td>{formatDate(wholesaler.createdAt)}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => onViewDetails(wholesaler)}
                                            title="Ver detalhes e gerenciar"
                                        >
                                            👁️ Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default WholesalerList;
