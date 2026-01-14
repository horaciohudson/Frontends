import { useState, useEffect } from 'react';
import { productsAPI, salesAPI, usersAPI } from '../../services/api';
import SalesChart from './SalesChart';
import LowStockAlert from './LowStockAlert';
import './AdminDashboard.css';

interface AdminDashboardProps {
    onNavigate: (view: string) => void;
    onEditProduct?: (productId: number) => void;
}

interface DashboardStats {
    totalProducts: number;
    totalSalesToday: number;
    totalUsers: number;
    pendingSales: number;
}

function AdminDashboard({ onNavigate, onEditProduct }: AdminDashboardProps) {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalSalesToday: 0,
        totalUsers: 0,
        pendingSales: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Load products count
            const productsResponse = await productsAPI.getAll(0, 1);
            const totalProducts = productsResponse.data.data?.totalElements || 0;

            // Load users count
            const usersResponse = await usersAPI.getAll();
            const totalUsers = usersResponse.data?.length || 0;

            // Load sales count
            const salesResponse = await salesAPI.getAll(0, 100); // Get more to count today's sales
            const allSales = salesResponse.data.data?.content || [];

            // Count today's sales
            const today = new Date().toDateString();
            const totalSalesToday = allSales.filter((sale: any) => {
                const saleDate = new Date(sale.saleDate).toDateString();
                return saleDate === today;
            }).length;

            // Count pending sales
            const pendingSales = allSales.filter((sale: any) =>
                sale.status === 'PENDING_PAYMENT' || sale.status === 'PENDING'
            ).length;

            setStats({
                totalProducts,
                totalSalesToday,
                totalUsers,
                pendingSales
            });
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>🛠️ Painel Administrativo</h1>
                <p>Gerencie produtos, categorias, usuários e vendas do sistema</p>
            </div>

            <div className="dashboard-cards">
                <div className="dashboard-card" onClick={() => onNavigate('products')}>
                    <div className="card-icon">👕</div>
                    <div className="card-content">
                        <h3>Gerenciar Produtos</h3>
                        <p>Criar, editar e gerenciar produtos de vestuário</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('categories')}>
                    <div className="card-icon">📂</div>
                    <div className="card-content">
                        <h3>Gerenciar Categorias</h3>
                        <p>Organizar categorias e subcategorias de vestuário</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('sizes')}>
                    <div className="card-icon">📏</div>
                    <div className="card-content">
                        <h3>Gerenciar Tamanhos</h3>
                        <p>Cadastrar e gerenciar tamanhos de produtos</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('colors')}>
                    <div className="card-icon">🎨</div>
                    <div className="card-content">
                        <h3>Gerenciar Cores</h3>
                        <p>Cadastrar e gerenciar cores de produtos</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('stock')}>
                    <div className="card-icon">📦</div>
                    <div className="card-content">
                        <h3>Gerenciar Estoque</h3>
                        <p>Visualizar e gerenciar níveis de estoque</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('wholesalers')}>
                    <div className="card-icon">🏢</div>
                    <div className="card-content">
                        <h3>Gerenciar Revendedores</h3>
                        <p>Revisar e aprovar cadastros de revendedores</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('companies')}>
                    <div className="card-icon">🏢</div>
                    <div className="card-content">
                        <h3>Gerenciar Empresa</h3>
                        <p>Cadastrar e gerenciar dados da empresa gestora</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('users')}>
                    <div className="card-icon">👥</div>
                    <div className="card-content">
                        <h3>Gerenciar Usuários</h3>
                        <p>Administrar contas de usuários e permissões</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('sales')}>
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>Gerenciar Vendas</h3>
                        <p>Acompanhar pedidos e gerenciar vendas (varejo)</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('wholesale-orders')}>
                    <div className="card-icon">📦</div>
                    <div className="card-content">
                        <h3>Gerenciar Pedidos Atacado</h3>
                        <p>Gerenciar pedidos de revendedores (B2B)</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('price-tables')}>
                    <div className="card-icon">💵</div>
                    <div className="card-content">
                        <h3>Tabelas de Preço</h3>
                        <p>Gerenciar tabelas de preço para atacado</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('payment-methods')}>
                    <div className="card-icon">💳</div>
                    <div className="card-content">
                        <h3>Métodos de Pagamento</h3>
                        <p>Configurar métodos de pagamento disponíveis</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('reviews')}>
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <h3>Gerenciar Avaliações</h3>
                        <p>Visualizar e moderar avaliações de produtos</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('reports')}>
                    <div className="card-icon">📊</div>
                    <div className="card-content">
                        <h3>Relatórios</h3>
                        <p>Visualizar estatísticas e relatórios</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('reviews')}>
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <h3>Avaliações</h3>
                        <p>Moderar avaliações de produtos</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card" onClick={() => onNavigate('settings')}>
                    <div className="card-icon">⚙️</div>
                    <div className="card-content">
                        <h3>Configurações</h3>
                        <p>Configurar parâmetros do sistema</p>
                    </div>
                    <div className="card-arrow">→</div>
                </div>
            </div>

            <div className="dashboard-stats">
                <h2>📈 Estatísticas Rápidas</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👕</div>
                        <div className="stat-info">
                            <span className="stat-number">{loading ? '...' : stats.totalProducts}</span>
                            <span className="stat-label">Produtos Ativos</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <span className="stat-number">{loading ? '...' : stats.totalSalesToday}</span>
                            <span className="stat-label">Vendas Hoje</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <span className="stat-number">{loading ? '...' : stats.totalUsers}</span>
                            <span className="stat-label">Usuários</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <span className="stat-number">{loading ? '...' : stats.pendingSales}</span>
                            <span className="stat-label">Pedidos Pendentes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertas de Estoque Baixo */}
            <LowStockAlert
                onNavigateToProduct={(productId) => {
                    onNavigate('products');
                    // Pequeno delay para garantir que a view mudou antes de editar
                    setTimeout(() => onEditProduct?.(productId), 100);
                }}
            />

            {/* Gráficos de Vendas */}
            <SalesChart />
        </div>
    );
}

export default AdminDashboard;
