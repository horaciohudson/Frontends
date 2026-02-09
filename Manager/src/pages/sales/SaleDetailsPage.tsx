// src/pages/sales/SaleDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SaleService } from "../../service/Sale";
import { Sale, SaleStatus } from "../../models/Sale";
import styles from "../../styles/sales/SaleDetailsPage.module.css";

export default function SaleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadSale();
        }
    }, [id]);

    const loadSale = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await SaleService.getById(id);
            setSale(data);
        } catch (err) {
            console.error("Error loading sale:", err);
            alert("Erro ao carregar venda. Redirecionando...");
            navigate("/comerciais/sales");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !sale) return;

        if (!window.confirm("Tem certeza que deseja excluir esta venda?")) {
            return;
        }

        try {
            await SaleService.delete(id);
            alert("Venda excluída com sucesso!");
            navigate("/comerciais/sales");
        } catch (err) {
            console.error("Error deleting sale:", err);
            alert("Erro ao excluir venda. Tente novamente.");
        }
    };

    const handleConfirmSale = async () => {
        if (!id || !sale) return;

        if (!window.confirm("Confirma a venda? Após confirmar, não será possível editar os itens.")) {
            return;
        }

        try {
            setLoading(true);
            const updatedSale = await SaleService.confirmSale(id);
            setSale(updatedSale);
            alert("Venda confirmada com sucesso!");
        } catch (err: any) {
            console.error("Error confirming sale:", err);
            alert(`Erro ao confirmar venda: ${err.message || "Erro desconhecido"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizeSale = async () => {
        if (!id || !sale) return;

        if (!window.confirm("Confirma a emissão da Nota Fiscal?")) {
            return;
        }

        try {
            setLoading(true);
            const updatedSale = await SaleService.finalizeSale(id);
            setSale(updatedSale);
            alert(`Nota Fiscal emitida com sucesso! Número: ${updatedSale.nfeNumber || 'Gerando...'}`);
        } catch (err: any) {
            console.error("Error finalizing sale:", err);
            alert(`Erro ao emitir Nota Fiscal: ${err.message || "Erro desconhecido"}`);
            // Reload to get latest status anyway
            loadSale();
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: SaleStatus) => {
        switch (status) {
            case "OPEN":
                return <span className={`${styles.badge} ${styles.badgeOpen}`}>Aberta</span>;
            case "CONFIRMED":
                return <span className={`${styles.badge} ${styles.badgeConfirmed}`} style={{ backgroundColor: '#3b82f6', color: 'white' }}>Confirmada</span>;
            case "BILLED": // Legacy/Backend mapping might settle on CLOSED or BILLED, ensure consistency
            case "CLOSED":
                return <span className={`${styles.badge} ${styles.badgeClosed}`}>Faturada</span>;
            case "CANCELED":
                return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Cancelada</span>;
            default:
                return <span className={styles.badge}>{status}</span>;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading && !sale) return <div className={styles.loading}>Carregando...</div>;
    if (!sale) return <div className={styles.error}>Venda não encontrada</div>;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <button
                        onClick={() => navigate("/comerciais/sales")}
                        className={styles.backButton}
                    >
                        ← Voltar
                    </button>
                    <h1 className={styles.title}>📋 Detalhes da Venda</h1>
                </div>
                <div className={styles.headerRight}>
                    {sale.status === 'OPEN' && (
                        <button
                            onClick={handleConfirmSale}
                            className={styles.confirmButton}
                            style={{ backgroundColor: '#f59e0b', color: 'white', marginRight: '8px' }}
                            disabled={loading}
                        >
                            ✅ Confirmar Venda
                        </button>
                    )}

                    {sale.status === 'CONFIRMED' && (
                        <button
                            onClick={handleFinalizeSale}
                            className={styles.nfeButton}
                            style={{ backgroundColor: '#10b981', color: 'white', marginRight: '8px' }}
                            disabled={loading || sale.nfeStatus === 'AUTHORIZED'}
                        >
                            📜 Emitir Nota Fiscal
                        </button>
                    )}

                    <button
                        onClick={() => navigate(`/comerciais/sales/${id}/edit`)}
                        className={styles.editButton}
                        disabled={sale.status !== "OPEN"} // Strict logic: Only OPEN can be edited
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={handleDelete}
                        className={styles.deleteButton}
                        disabled={sale.status !== "OPEN"} // Only OPEN can be deleted (or maybe CANCELLED logic later)
                    >
                        🗑️ Excluir
                    </button>
                </div>
            </div>

            {/* Sale Info */}
            <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                    <h2 className={styles.infoTitle}>Informações da Venda</h2>
                    {getStatusBadge(sale.status)}
                </div>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>ID:</span>
                        <span className={styles.infoValue}>{sale.id}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Data de Criação:</span>
                        <span className={styles.infoValue}>{formatDate(sale.createdDate)}</span>
                    </div>
                    {sale.updatedDate && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Última Atualização:</span>
                            <span className={styles.infoValue}>{formatDate(sale.updatedDate)}</span>
                        </div>
                    )}
                    {sale.type && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Tipo:</span>
                            <span className={styles.infoValue}>{sale.type}</span>
                        </div>
                    )}

                    {/* NFe Info */}
                    {sale.nfeStatus && (
                        <>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Status NFe:</span>
                                <span
                                    className={styles.infoValue}
                                    style={{
                                        color: sale.nfeStatus === 'AUTHORIZED' ? 'green' :
                                            sale.nfeStatus === 'FAILED' ? 'red' : 'orange',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {sale.nfeStatus}
                                </span>
                            </div>
                            {sale.nfeNumber && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>NFe Nº:</span>
                                    <span className={styles.infoValue}>{sale.nfeNumber}</span>
                                </div>
                            )}
                            {sale.nfeErrorMessage && (
                                <div className={styles.infoItem} style={{ gridColumn: '1 / -1', color: 'red' }}>
                                    <span className={styles.infoLabel}>Erro NFe:</span>
                                    <span className={styles.infoValue}>{sale.nfeErrorMessage}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Customer Info */}
            <div className={styles.infoCard}>
                <h2 className={styles.infoTitle}>👤 Cliente</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nome:</span>
                        <span className={styles.infoValue}>{sale.customer.name}</span>
                    </div>
                    {sale.customer.cpfCnpj && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>CPF/CNPJ:</span>
                            <span className={styles.infoValue}>{sale.customer.cpfCnpj}</span>
                        </div>
                    )}
                    {sale.customer.email && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{sale.customer.email}</span>
                        </div>
                    )}
                    {sale.customer.telephone && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Telefone:</span>
                            <span className={styles.infoValue}>{sale.customer.telephone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Salesperson Info */}
            <div className={styles.infoCard}>
                <h2 className={styles.infoTitle}>💼 Vendedor</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nome:</span>
                        <span className={styles.infoValue}>{sale.salesperson.name}</span>
                    </div>
                    {sale.salesperson.codeName && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Código:</span>
                            <span className={styles.infoValue}>{sale.salesperson.codeName}</span>
                        </div>
                    )}
                    {sale.salespersonCommission !== undefined && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Comissão:</span>
                            <span className={styles.infoValue}>
                                {formatCurrency(sale.salespersonCommission)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className={styles.itemsCard}>
                <h2 className={styles.infoTitle}>🛒 Itens da Venda</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Produto</th>
                                <th>Tamanho</th>
                                <th>Cor</th>
                                <th>Unidade</th>
                                <th>Quantidade</th>
                                <th>Preço Unitário</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.itemNumber}</td>
                                    <td>
                                        <strong>{item.description}</strong>
                                    </td>
                                    <td>{item.sizeName || item.size || "-"}</td>
                                    <td>{item.colorName || "-"}</td>
                                    <td>{item.unit}</td>
                                    <td className={styles.centerAlign}>{item.quantity}</td>
                                    <td>{formatCurrency(item.unitPrice)}</td>
                                    <td className={styles.totalCell}>
                                        {formatCurrency(item.totalPrice)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals */}
            <div className={styles.totalsCard}>
                <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total de Produtos:</span>
                    <span className={styles.totalValue}>{sale.totalProducts}</span>
                </div>
                <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total de Itens:</span>
                    <span className={styles.totalValue}>{sale.totalItems}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span className={styles.totalLabel}>Total da Venda:</span>
                    <span className={styles.totalValue}>{formatCurrency(sale.totalSale)}</span>
                </div>
            </div>
        </div>
    );
}
