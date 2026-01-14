import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWholesaleCart } from '../contexts/WholesaleCartContext';
import { Navigate, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import './WholesaleOrderSummary.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

function WholesaleOrderSummary() {
    const { hasRole, isAuthenticated, user } = useAuth();
    const { items, total, minimumOrderValue, meetsMinimumOrder, getTotalPieces, getSelectedProductsCount, clearCart } = useWholesaleCart();
    const navigate = useNavigate();
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [confirmingOrder, setConfirmingOrder] = useState(false);

    // Group items by product
    const productGroups = items.reduce((acc, item) => {
        if (!acc[item.productId]) {
            acc[item.productId] = {
                productName: item.productName,
                productSku: item.productSku,
                items: []
            };
        }
        acc[item.productId].items.push(item);
        return acc;
    }, {} as Record<number, { productName: string; productSku: string; items: typeof items }>);

    const handleBackToGrid = () => {
        navigate('/wholesale/grid');
    };

    const handleConfirmOrder = async () => {
        try {
            setConfirmingOrder(true);

            // Get user ID from auth context
            const userId = user?.id;
            if (!userId) {
                alert('Erro: Usuário não identificado');
                return;
            }

            // Get wholesaler ID from backend
            const token = localStorage.getItem('token');
            let wholesalerId: number | undefined;

            console.log('Fetching wholesaler for user ID:', userId);

            try {
                const wholesalerResponse = await axios.get(
                    `${API_URL}/api/wholesalers/user/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                wholesalerId = wholesalerResponse.data.id;
                console.log('Wholesaler found:', wholesalerId);
            } catch (error: any) {
                console.error('Error fetching wholesaler:', error);
                console.error('Error response:', error.response?.data);
                alert('Erro: Cadastro de revendedor não encontrado. Complete seu cadastro primeiro.');
                setConfirmingOrder(false);
                return;
            }

            if (!wholesalerId) {
                alert('Erro: ID do revendedor não encontrado.');
                setConfirmingOrder(false);
                return;
            }

            console.log('Creating order with wholesalerId:', wholesalerId, 'userId:', userId);

            // Create order from cart
            const response = await axios.post(
                `${API_URL}/api/wholesale-orders`,
                null,
                {
                    params: { wholesalerId, userId },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const order = response.data;

            // Clear cart after successful order creation
            await clearCart();

            // Show success message
            const orderTotal = order.totalAmount ?? total;
            const orderNumber = order.orderNumber ?? 'N/A';
            const orderStatus = order.status ?? 'PENDING';

            alert(`Pedido ${orderNumber} criado com sucesso!\n\nStatus: ${orderStatus}\nTotal: R$ ${orderTotal.toFixed(2)}`);

            // Navigate to orders page or catalog
            navigate('/wholesale/catalog');

        } catch (error: any) {
            console.error('Error confirming order:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Erro ao confirmar pedido. Tente novamente.';
            alert(`Erro ao confirmar pedido:\n${errorMessage}`);
        } finally {
            setConfirmingOrder(false);
        }
    };

    const generatePDF = () => {
        setGeneratingPDF(true);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('PEDIDO ATACADO', pageWidth / 2, 20, { align: 'center' });

            // Order Info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
            doc.text(`Cliente: ${user?.firstName || ''} ${user?.lastName || ''}`, 14, 40);
            doc.text(`Email: ${user?.email || ''}`, 14, 45);

            // Summary Box
            doc.setDrawColor(200, 200, 200);
            doc.rect(14, 50, pageWidth - 28, 25);
            doc.setFontSize(9);
            doc.text(`Produtos: ${getSelectedProductsCount()}`, 18, 58);
            doc.text(`Total de Peças: ${getTotalPieces()}`, 18, 63);
            doc.text(`Valor Total: R$ ${total.toFixed(2)}`, 18, 68);
            doc.text(`Pedido Mínimo: R$ ${minimumOrderValue.toFixed(2)} ${meetsMinimumOrder ? '✓' : '✗'}`, 18, 73);

            // Products Table
            const tableData: any[] = [];
            Object.values(productGroups).forEach(group => {
                group.items.forEach((item, index) => {
                    const variant = item.variantDescription || 'Produto padrão';
                    tableData.push([
                        index === 0 ? group.productSku : '',
                        index === 0 ? group.productName : '',
                        variant,
                        item.quantity.toString(),
                        `R$ ${item.wholesalePrice.toFixed(2)}`,
                        `R$ ${item.subtotal.toFixed(2)}`
                    ]);
                });
            });

            doc.autoTable({
                startY: 80,
                head: [['SKU', 'Produto', 'Variante', 'Qtd', 'Preço Unit.', 'Subtotal']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' }
                }
            });

            // Total
            const finalY = (doc as any).lastAutoTable.finalY || 80;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: R$ ${total.toFixed(2)}`, pageWidth - 14, finalY + 15, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Condições de Pagamento: 30 dias', 14, finalY + 30);
            doc.text('Desconto Médio: 30%', 14, finalY + 35);
            doc.text(`Pedido Mínimo: R$ ${minimumOrderValue.toFixed(2)}`, 14, finalY + 40);

            // Save PDF
            const fileName = `Pedido_Atacado_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    if (items.length === 0) {
        return (
            <div className="wholesale-summary">
                <div className="container">
                    <div className="empty-summary">
                        <h2>📋 Nenhum produto no pedido</h2>
                        <p>Adicione produtos ao carrinho para revisar seu pedido</p>
                        <button className="btn btn-primary" onClick={() => navigate('/wholesale/catalog')}>
                            Ir para Catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wholesale-summary">
            <div className="container">
                {/* Header */}
                <div className="summary-header">
                    <h1>📋 Resumo do Pedido Atacado</h1>
                    <p className="subtitle">Revise seu pedido antes de confirmar</p>
                </div>

                {/* Order Details */}
                <div className="order-details-card">
                    <h2>Detalhes do Pedido</h2>

                    {/* Summary Stats */}
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-label">Produtos Diferentes:</span>
                            <span className="stat-value">{getSelectedProductsCount()}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total de Peças:</span>
                            <span className="stat-value">{getTotalPieces()}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Valor Total:</span>
                            <span className="stat-value highlight">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="products-summary-list">
                        {Object.values(productGroups).map((group, index) => (
                            <div key={index} className="product-summary-group">
                                <div className="product-summary-header">
                                    <h3>{group.productName}</h3>
                                    <span className="product-sku">SKU: {group.productSku}</span>
                                </div>

                                <table className="variants-table">
                                    <thead>
                                        <tr>
                                            <th>Variante</th>
                                            <th>Quantidade</th>
                                            <th>Preço Unit.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.variantDescription || 'Produto padrão'}
                                                    {item.size && <span className="variant-tag">Tam: {item.size}</span>}
                                                    {item.color && <span className="variant-tag color">Cor: {item.color}</span>}
                                                </td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-right">R$ {item.wholesalePrice.toFixed(2)}</td>
                                                <td className="text-right font-bold">R$ {item.subtotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="pricing-breakdown">
                        <div className="breakdown-row">
                            <span>Subtotal:</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="breakdown-row">
                            <span>Desconto Médio:</span>
                            <span className="discount">30%</span>
                        </div>
                        <div className="breakdown-row total">
                            <span>Total do Pedido:</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="payment-terms">
                        <h3>Condições de Pagamento</h3>
                        <ul>
                            <li>📅 Prazo: 30 dias</li>
                            <li>💰 Desconto médio: 30%</li>
                            <li>📦 Pedido mínimo: R$ {minimumOrderValue.toFixed(2)}</li>
                        </ul>
                    </div>

                    {/* Validation Messages */}
                    {!meetsMinimumOrder && (
                        <div className="validation-error">
                            ⚠️ Pedido mínimo de R$ {minimumOrderValue.toFixed(2)} não atingido.
                            Faltam R$ {(minimumOrderValue - total).toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="summary-actions">
                    <button className="btn btn-secondary" onClick={handleBackToGrid}>
                        ← Voltar e Editar
                    </button>

                    <button
                        className="btn btn-outline"
                        onClick={generatePDF}
                        disabled={generatingPDF}
                    >
                        {generatingPDF ? '📄 Gerando PDF...' : '📄 Baixar PDF'}
                    </button>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleConfirmOrder}
                        disabled={!meetsMinimumOrder || confirmingOrder}
                    >
                        {confirmingOrder ? '⏳ Confirmando...' : '✓ Confirmar Pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WholesaleOrderSummary;
