// src/pages/sales/SaleListPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SaleService } from "../../service/Sale";
import { Sale, SaleStatus } from "../../models/Sale";
import styles from "../../styles/sales/SaleListPage.module.css";

export default function SaleListPage() {
    const navigate = useNavigate();

    // State
    const [sales, setSales] = useState<Sale[]>([]);
    const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<SaleStatus | "ALL">("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Load sales
    const loadSales = useCallback(async () => {
        try {
            setLoading(true);
            const data = await SaleService.getAll();
            setSales(data);
            setFilteredSales(data);
        } catch (err) {
            console.error("Error loading sales:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    // Apply filters
    useEffect(() => {
        let filtered = [...sales];

        // Status filter
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(sale => sale.status === statusFilter);
        }

        // Search filter (customer name, salesperson name, or sale ID)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(sale =>
                sale.customer.name.toLowerCase().includes(searchLower) ||
                sale.salesperson.name.toLowerCase().includes(searchLower) ||
                sale.id.toLowerCase().includes(searchLower)
            );
        }

        // Date range filter
        if (startDate) {
            filtered = filtered.filter(sale =>
                new Date(sale.createdDate) >= new Date(startDate)
            );
        }
        if (endDate) {
            filtered = filtered.filter(sale =>
                new Date(sale.createdDate) <= new Date(endDate)
            );
        }

        setFilteredSales(filtered);
    }, [sales, statusFilter, search, startDate, endDate]);

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta venda?")) {
            return;
        }

        try {
            await SaleService.delete(id);
            await loadSales();
        } catch (err) {
            console.error("Error deleting sale:", err);
            alert("Erro ao excluir venda. Tente novamente.");
        }
    };

    // Get status badge
    const getStatusBadge = (status: SaleStatus) => {
        switch (status) {
            case "OPEN":
                return <span className={styles.badgeOpen}>Aberta</span>;
            case "CLOSED":
                return <span className={styles.badgeClosed}>Fechada</span>;
            case "CANCELLED":
                return <span className={styles.badgeCancelled}>Cancelada</span>;
            default:
                return <span>{status}</span>;
        }
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>📋 Vendas de Escritório</h1>
                <button
                    className={styles.newButton}
                    onClick={() => navigate("/comerciais/sales/new")}
                >
                    ➕ Nova Venda
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filtersContainer}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por cliente, vendedor ou ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as SaleStatus | "ALL")}
                            className={styles.filterSelect}
                        >
                            <option value="ALL">Todos</option>
                            <option value="OPEN">Aberta</option>
                            <option value="CLOSED">Fechada</option>
                            <option value="CANCELLED">Cancelada</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Data Inicial:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Data Final:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>

                    <button
                        className={styles.clearButton}
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                            setStartDate("");
                            setEndDate("");
                        }}
                    >
                        🔄 Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            {loading ? (
                <div className={styles.loading}>Carregando vendas...</div>
            ) : filteredSales.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>📭 Nenhuma venda encontrada</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Vendedor</th>
                                <th>Itens</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr
                                    key={sale.id}
                                    onDoubleClick={() => navigate(`/comerciais/sales/${sale.id}/edit`)}
                                    style={{ cursor: 'pointer' }}
                                    title="Duplo clique para editar"
                                >
                                    <td>{formatDate(sale.createdDate)}</td>
                                    <td>
                                        <strong>{sale.customer.name}</strong>
                                        {sale.customer.cpfCnpj && (
                                            <div className={styles.subText}>
                                                {sale.customer.cpfCnpj}
                                            </div>
                                        )}
                                    </td>
                                    <td>{sale.salesperson.name}</td>
                                    <td className={styles.centerAlign}>{sale.totalItems}</td>
                                    <td className={styles.priceCell}>
                                        {formatCurrency(sale.totalSale)}
                                    </td>
                                    <td>{getStatusBadge(sale.status)}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.viewButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/comerciais/sales/${sale.id}`);
                                                }}
                                                title="Ver detalhes"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className={styles.editButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/comerciais/sales/${sale.id}/edit`);
                                                }}
                                                title="Editar"
                                                disabled={sale.status === "CLOSED" || sale.status === "CANCELLED"}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(sale.id);
                                                }}
                                                title="Excluir"
                                                disabled={sale.status === "CLOSED"}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {filteredSales.length > 0 && (
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total de Vendas:</span>
                        <span className={styles.summaryValue}>{filteredSales.length}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Valor Total:</span>
                        <span className={styles.summaryValue}>
                            {formatCurrency(
                                filteredSales.reduce((sum, sale) => sum + sale.totalSale, 0)
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
