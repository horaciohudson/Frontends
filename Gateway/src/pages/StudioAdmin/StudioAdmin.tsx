import React, { useEffect, useState } from 'react';
import { StudioAdminUser, StudioCostSync, StudioCreateUserRequest, StudioSetting } from '../../types';
import { studioAdminService } from '../../services/studioAdminService';
import './StudioAdmin.css';

const initialForm: StudioCreateUserRequest = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    admin: false,
};

const StudioAdmin: React.FC = () => {
    const [users, setUsers] = useState<StudioAdminUser[]>([]);
    const [settings, setSettings] = useState<StudioSetting[]>([]);
    const [costSyncItems, setCostSyncItems] = useState<StudioCostSync[]>([]);
    const [costStatusFilter, setCostStatusFilter] = useState<string>('ALL');
    const [costOperatorFilter, setCostOperatorFilter] = useState<string>('');
    const [costCorrelationFilter, setCostCorrelationFilter] = useState<string>('');
    const [costSortField, setCostSortField] = useState<'createdAt' | 'status' | 'totalCost' | 'createdBy' | 'lastActionBy'>('createdAt');
    const [costSortDirection, setCostSortDirection] = useState<'asc' | 'desc'>('desc');
    const [form, setForm] = useState<StudioCreateUserRequest>(initialForm);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordReset, setPasswordReset] = useState<Record<string, string>>({});

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, settingsData, costsData] = await Promise.all([
                studioAdminService.listUsers(),
                studioAdminService.listSettings(),
                studioAdminService.listCostSync(),
            ]);
            setUsers(usersData);
            setSettings(settingsData);
            setCostSyncItems(costsData);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar dados do Studio.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await studioAdminService.createUser(form);
            setUsers((prev) => [...prev, created].sort((a, b) => a.username.localeCompare(b.username)));
            setForm(initialForm);
            setMessage(`Usuário ${created.username} criado com sucesso.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao criar usuário.');
            setMessage('');
        }
    };

    const handleToggleStatus = async (user: StudioAdminUser) => {
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            const updated = await studioAdminService.updateUserStatus(user.userId, newStatus);
            setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)));
            setMessage(`Status do usuário ${updated.username} atualizado para ${updated.status}.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao atualizar status.');
            setMessage('');
        }
    };

    const handleResetPassword = async (user: StudioAdminUser) => {
        const newPassword = passwordReset[user.userId] || '';
        if (!newPassword.trim()) {
            setError(`Informe a nova senha para ${user.username}.`);
            return;
        }
        try {
            const result = await studioAdminService.resetPassword(user.userId, newPassword);
            setPasswordReset((prev) => ({ ...prev, [user.userId]: '' }));
            setMessage(`${result.message} (${user.username})`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao resetar senha.');
            setMessage('');
        }
    };

    const handleUpdateSetting = async (setting: StudioSetting) => {
        try {
            const updated = await studioAdminService.updateSetting(setting.key, setting.value);
            setSettings((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));
            setMessage(`Configuração ${updated.key} atualizada.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || `Erro ao atualizar ${setting.key}.`);
            setMessage('');
        }
    };

    const loadCostSync = async (status?: string, correlationId?: string) => {
        try {
            const costs = await studioAdminService.listCostSync(status, correlationId);
            setCostSyncItems(costs);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar status de custos.');
        }
    };

    const handleFilterCostStatus = async (status: string) => {
        setCostStatusFilter(status);
        await loadCostSync(
            status === 'ALL' ? undefined : status,
            costCorrelationFilter.trim() || undefined
        );
    };

    const handleFilterCorrelation = async () => {
        await loadCostSync(
            costStatusFilter === 'ALL' ? undefined : costStatusFilter,
            costCorrelationFilter.trim() || undefined
        );
    };

    const handleSendCost = async (cost: StudioCostSync) => {
        try {
            const updated = await studioAdminService.sendCostToFinancial(cost.costId);
            setCostSyncItems((prev) => prev.map((item) => (item.costId === updated.costId ? updated : item)));
            setMessage(`Custo ${updated.costReference} processado com status ${updated.status}.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || `Erro ao enviar custo ${cost.costReference}.`);
            setMessage('');
        }
    };

    const handleReprocessPending = async () => {
        try {
            const updatedList = await studioAdminService.reprocessPendingCosts();
            const updatedMap = new Map(updatedList.map((item) => [item.costId, item]));
            setCostSyncItems((prev) =>
                prev.map((item) => updatedMap.get(item.costId) || item)
            );
            setMessage(`Reprocessamento concluído: ${updatedList.length} custo(s) avaliados.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao reprocessar pendentes.');
            setMessage('');
        }
    };

    const handleReprocessFiltered = async () => {
        try {
            const effectiveStatus = costStatusFilter === 'ALL' ? undefined : costStatusFilter;
            const effectiveCorrelation = costCorrelationFilter.trim() || undefined;
            const updatedList = await studioAdminService.reprocessCosts(effectiveStatus, effectiveCorrelation);
            const updatedMap = new Map(updatedList.map((item) => [item.costId, item]));
            setCostSyncItems((prev) => prev.map((item) => updatedMap.get(item.costId) || item));
            setMessage(`Reprocessamento por filtro concluído: ${updatedList.length} custo(s) processados.`);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao reprocessar filtro atual.');
            setMessage('');
        }
    };

    const formatMoney = (amount: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency || 'BRL',
            minimumFractionDigits: 2,
        }).format(amount ?? 0);
    };

    const normalizedOperatorFilter = costOperatorFilter.trim().toLowerCase();
    const filteredCostItems = costSyncItems.filter((item) => {
        if (!normalizedOperatorFilter) {
            return true;
        }
        const createdBy = (item.createdBy || '').toLowerCase();
        const lastActionBy = (item.lastActionBy || '').toLowerCase();
        return createdBy.includes(normalizedOperatorFilter) || lastActionBy.includes(normalizedOperatorFilter);
    });

    const sortedCostItems = [...filteredCostItems].sort((a, b) => {
        const direction = costSortDirection === 'asc' ? 1 : -1;
        if (costSortField === 'createdAt') {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return (aDate - bDate) * direction;
        }
        if (costSortField === 'status') {
            return (a.status || '').localeCompare(b.status || '') * direction;
        }
        if (costSortField === 'createdBy') {
            return (a.createdBy || '').localeCompare(b.createdBy || '') * direction;
        }
        if (costSortField === 'lastActionBy') {
            return (a.lastActionBy || '').localeCompare(b.lastActionBy || '') * direction;
        }
        const aTotal = Number(a.totalCost || 0);
        const bTotal = Number(b.totalCost || 0);
        return (aTotal - bTotal) * direction;
    });

    const handleSortCosts = (field: 'createdAt' | 'status' | 'totalCost' | 'createdBy' | 'lastActionBy') => {
        if (costSortField === field) {
            setCostSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setCostSortField(field);
        setCostSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    };

    const getSortIndicator = (field: 'createdAt' | 'status' | 'totalCost' | 'createdBy' | 'lastActionBy') => {
        if (costSortField !== field) {
            return '';
        }
        return costSortDirection === 'asc' ? ' ▲' : ' ▼';
    };

    const exportCostsCsv = () => {
        const separator = ';';
        const headers = [
            'Referencia',
            'Status',
            'Total',
            'Moeda',
            'CorrelationId',
            'CriadoPor',
            'UltimaAcaoPor',
            'Tentativas',
            'CriadoEm',
            'SincronizadoEm',
            'Erro',
        ];

        const escapeCsv = (value: string) => `"${(value || '').replaceAll('"', '""')}"`;
        const formatNumberCsv = (value: number) =>
            new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value ?? 0);
        const formatDateCsv = (value?: string) => {
            if (!value) return '';
            return new Date(value).toLocaleString('pt-BR');
        };

        const lines = sortedCostItems.map((cost) =>
            [
                cost.costReference || '',
                cost.status || '',
                formatNumberCsv(Number(cost.totalCost ?? 0)),
                cost.currency || 'BRL',
                cost.correlationId || '',
                cost.createdBy || '',
                cost.lastActionBy || '',
                String(cost.attemptCount ?? 0),
                formatDateCsv(cost.createdAt),
                formatDateCsv(cost.syncedAt),
                cost.lastError || '',
            ]
                .map(escapeCsv)
                .join(separator)
        );

        const csvContent = [headers.join(separator), ...lines].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `studio-cost-sync-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const costSummary = costSyncItems.reduce(
        (acc, item) => {
            const status = (item.status || '').toUpperCase();
            acc.total += 1;
            if (status === 'SENT') acc.sent += 1;
            else if (status === 'ERROR') acc.error += 1;
            else if (status === 'PENDING') acc.pending += 1;
            else acc.other += 1;
            return acc;
        },
        { total: 0, pending: 0, sent: 0, error: 0, other: 0 }
    );

    if (loading) {
        return <div className="studio-admin-page"><p>Carregando gestão do Studio...</p></div>;
    }

    return (
        <div className="studio-admin-page">
            <div className="studio-admin-header">
                <h1>Studio Admin</h1>
                <p>Gestão de usuários e configurações do login do Studio no Gateway.</p>
            </div>

            {message && <div className="studio-message success">{message}</div>}
            {error && <div className="studio-message error">{error}</div>}

            <div className="studio-grid">
                <section className="studio-card">
                    <h2>Criar Usuário Studio</h2>
                    <form onSubmit={handleCreateUser} className="studio-form">
                        <input
                            type="text"
                            placeholder="username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="nome completo"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="senha"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.admin}
                                onChange={(e) => setForm({ ...form, admin: e.target.checked })}
                            />
                            Usuário admin do Studio
                        </label>
                        <button type="submit">Criar Usuário</button>
                    </form>
                </section>

                <section className="studio-card">
                    <h2>Configurações Studio</h2>
                    <div className="settings-list">
                        {settings.map((setting) => (
                            <div key={setting.key} className="setting-item">
                                <div>
                                    <strong>{setting.key}</strong>
                                    <p>{setting.description}</p>
                                </div>
                                <input
                                    type="text"
                                    value={setting.value}
                                    onChange={(e) =>
                                        setSettings((prev) =>
                                            prev.map((s) =>
                                                s.key === setting.key ? { ...s, value: e.target.value } : s
                                            )
                                        )
                                    }
                                />
                                <button onClick={() => handleUpdateSetting(setting)}>Salvar</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="studio-card">
                <h2>Usuários Studio</h2>
                <table className="studio-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Roles</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.status}</td>
                                <td>{user.roles.join(', ')}</td>
                                <td>
                                    <div className="actions-row">
                                        <button onClick={() => handleToggleStatus(user)}>
                                            {user.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <input
                                            type="password"
                                            placeholder="nova senha"
                                            value={passwordReset[user.userId] || ''}
                                            onChange={(e) =>
                                                setPasswordReset((prev) => ({
                                                    ...prev,
                                                    [user.userId]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button onClick={() => handleResetPassword(user)}>Resetar Senha</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="studio-card">
                <div className="costs-header">
                    <h2>Sincronização de Custos (Modelagem para Financeiro)</h2>
                    <div className="costs-actions">
                        <input
                            type="text"
                            placeholder="Filtrar operador"
                            value={costOperatorFilter}
                            onChange={(e) => setCostOperatorFilter(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Correlation ID"
                            value={costCorrelationFilter}
                            onChange={(e) => setCostCorrelationFilter(e.target.value)}
                        />
                        <select
                            value={costStatusFilter}
                            onChange={(e) => handleFilterCostStatus(e.target.value)}
                        >
                            <option value="ALL">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="SENT">Enviado</option>
                            <option value="ERROR">Erro</option>
                        </select>
                        <button onClick={handleFilterCorrelation}>Aplicar Correlation</button>
                        <button onClick={handleReprocessPending}>Reprocessar Pendentes</button>
                        <button onClick={handleReprocessFiltered}>Reprocessar Filtro</button>
                        <button onClick={() => handleFilterCostStatus('ERROR')}>Ver Erros</button>
                        <button onClick={exportCostsCsv}>Exportar CSV</button>
                        <button onClick={() => loadCostSync(
                            costStatusFilter === 'ALL' ? undefined : costStatusFilter,
                            costCorrelationFilter.trim() || undefined
                        )}>
                            Atualizar
                        </button>
                    </div>
                </div>
                <div className="cost-summary-grid">
                    <div className="cost-summary-card">
                        <span>Total</span>
                        <strong>{costSummary.total}</strong>
                    </div>
                    <div className="cost-summary-card pending">
                        <span>Pendente</span>
                        <strong>{costSummary.pending}</strong>
                    </div>
                    <div className="cost-summary-card sent">
                        <span>Enviado</span>
                        <strong>{costSummary.sent}</strong>
                    </div>
                    <div className="cost-summary-card error">
                        <span>Erro</span>
                        <strong>{costSummary.error}</strong>
                    </div>
                </div>
                <table className="studio-table">
                    <thead>
                        <tr>
                            <th>Referência</th>
                            <th className="sortable" onClick={() => handleSortCosts('status')}>
                                Status{getSortIndicator('status')}
                            </th>
                            <th>Correlation ID</th>
                            <th className="sortable" onClick={() => handleSortCosts('totalCost')}>
                                Total{getSortIndicator('totalCost')}
                            </th>
                            <th className="sortable" onClick={() => handleSortCosts('createdBy')}>
                                Criado por{getSortIndicator('createdBy')}
                            </th>
                            <th className="sortable" onClick={() => handleSortCosts('lastActionBy')}>
                                Última ação por{getSortIndicator('lastActionBy')}
                            </th>
                            <th>Tentativas</th>
                            <th className="sortable" onClick={() => handleSortCosts('createdAt')}>
                                Criado em{getSortIndicator('createdAt')}
                            </th>
                            <th>Sincronizado em</th>
                            <th>Erro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCostItems.length === 0 && (
                            <tr>
                                <td colSpan={11}>Nenhum custo encontrado para o filtro selecionado.</td>
                            </tr>
                        )}
                        {sortedCostItems.map((cost) => (
                            <tr key={cost.costId}>
                                <td>{cost.costReference}</td>
                                <td>
                                    <span className={`status-chip status-${(cost.status || '').toLowerCase()}`}>
                                        {cost.status}
                                    </span>
                                </td>
                                <td>{cost.correlationId || '-'}</td>
                                <td>{formatMoney(cost.totalCost, cost.currency)}</td>
                                <td>{cost.createdBy || '-'}</td>
                                <td>{cost.lastActionBy || '-'}</td>
                                <td>{cost.attemptCount ?? 0}</td>
                                <td>{cost.createdAt ? new Date(cost.createdAt).toLocaleString('pt-BR') : '-'}</td>
                                <td>{cost.syncedAt ? new Date(cost.syncedAt).toLocaleString('pt-BR') : '-'}</td>
                                <td>{cost.lastError || '-'}</td>
                                <td>
                                    <button
                                        onClick={() => handleSendCost(cost)}
                                        disabled={cost.status === 'SENT'}
                                    >
                                        {cost.status === 'SENT' ? 'Enviado' : 'Reprocessar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default StudioAdmin;
