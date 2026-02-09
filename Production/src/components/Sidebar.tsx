import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
    onLogout?: () => void;
}

type SidebarTab = 'operacional' | 'configuracoes';

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<SidebarTab>('operacional');

    const handleNavigation = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(`🚀 Navegando para: ${path}`);
        navigate(path);
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>🏭 Sistema de Produção</h3>
            </div>

            {/* Tabs */}
            <div className="sidebar-tabs">
                <button
                    className={`sidebar-tab ${activeTab === 'operacional' ? 'active' : ''}`}
                    onClick={() => setActiveTab('operacional')}
                >
                    📊 Operacional
                </button>
                <button
                    className={`sidebar-tab ${activeTab === 'configuracoes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('configuracoes')}
                >
                    ⚙️ Configurações
                </button>
            </div>

            <nav className="sidebar-nav">
                {/* ABA OPERACIONAL */}
                {activeTab === 'operacional' && (
                    <>
                        <button
                            className={`sidebar-button ${isActive('/dashboard') ? 'active' : ''}`}
                            onClick={handleNavigation('/dashboard')}
                        >
                            <span className="sidebar-icon">📊</span>
                            Dashboard
                        </button>

                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Produção</h4>

                            <button
                                className={`sidebar-button ${isActive('/ordens-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/ordens-producao')}
                            >
                                <span className="sidebar-icon">🏭</span>
                                Ordens de Produção
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/execucao-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/execucao-producao')}
                            >
                                <span className="sidebar-icon">⚙️</span>
                                Execução de Produção
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/fechamento-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/fechamento-producao')}
                            >
                                <span className="sidebar-icon">🔒</span>
                                Fechamento de Produção
                            </button>
                        </div>

                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Estoque</h4>

                            <button
                                className={`sidebar-button ${isActive('/estoque-materias-primas') ? 'active' : ''}`}
                                onClick={handleNavigation('/estoque-materias-primas')}
                            >
                                <span className="sidebar-icon">📦</span>
                                Estoque de Matérias-Primas
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/movimentacoes-materias-primas') ? 'active' : ''}`}
                                onClick={handleNavigation('/movimentacoes-materias-primas')}
                            >
                                <span className="sidebar-icon">📋</span>
                                Movimentações
                            </button>
                        </div>

                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Custos</h4>

                            <button
                                className={`sidebar-button ${isActive('/custos-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/custos-producao')}
                            >
                                <span className="sidebar-icon">💰</span>
                                Custos de Produção
                            </button>
                        </div>
                    </>
                )}

                {/* ABA CONFIGURAÇÕES */}
                {activeTab === 'configuracoes' && (
                    <>
                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Cadastros</h4>

                            <button
                                className={`sidebar-button ${isActive('/cadastro-empresas') ? 'active' : ''}`}
                                onClick={handleNavigation('/cadastro-empresas')}
                            >
                                <span className="sidebar-icon">🏢</span>
                                Cadastro de Empresas
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/produtos-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/produtos-producao')}
                            >
                                <span className="sidebar-icon">🏷️</span>
                                Produtos de Produção
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/materias-primas') ? 'active' : ''}`}
                                onClick={handleNavigation('/materias-primas')}
                            >
                                <span className="sidebar-icon">🧱</span>
                                Matérias-Primas
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/composicoes') ? 'active' : ''}`}
                                onClick={handleNavigation('/composicoes')}
                            >
                                <span className="sidebar-icon">📝</span>
                                Composições (BOM)
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/etapas-producao') ? 'active' : ''}`}
                                onClick={handleNavigation('/etapas-producao')}
                            >
                                <span className="sidebar-icon">🔄</span>
                                Etapas de Produção
                            </button>

                            <div className="sidebar-item">
                                <button
                                    className={`sidebar-button ${isActive('/servicos') ? 'active' : ''}`}
                                    onClick={handleNavigation('/servicos')}
                                >
                                    <span className="sidebar-icon">🛠️</span>
                                    <span className="sidebar-text">Catálogo de Serviços</span>
                                </button>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Sistema</h4>

                            <button
                                className={`sidebar-button ${isActive('/tenants') ? 'active' : ''}`}
                                onClick={handleNavigation('/tenants')}
                            >
                                <span className="sidebar-icon">🏢</span>
                                Sistema Cliente
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/users') ? 'active' : ''}`}
                                onClick={handleNavigation('/users')}
                            >
                                <span className="sidebar-icon">👥</span>
                                Usuários
                            </button>

                            <button
                                className={`sidebar-button ${isActive('/permissions') ? 'active' : ''}`}
                                onClick={handleNavigation('/permissions')}
                            >
                                <span className="sidebar-icon">🔐</span>
                                Permissões
                            </button>
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-button logout-button" onClick={handleLogout}>
                    <span className="sidebar-icon">🚪</span>
                    Sair
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
