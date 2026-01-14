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
      // Default logout behavior
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
        <h3>💰 Sistema Financeiro</h3>
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
              <h4 className="sidebar-section-title">Movimentações</h4>

              <button
                className={`sidebar-button ${isActive('/contas-pagar') ? 'active' : ''}`}
                onClick={handleNavigation('/contas-pagar')}
              >
                <span className="sidebar-icon">📉</span>
                Contas a Pagar
              </button>

              <button
                className={`sidebar-button ${isActive('/contas-receber') ? 'active' : ''}`}
                onClick={handleNavigation('/contas-receber')}
              >
                <span className="sidebar-icon">📈</span>
                Contas a Receber
              </button>

              <button
                className={`sidebar-button ${isActive('/fluxo-caixa') ? 'active' : ''}`}
                onClick={handleNavigation('/fluxo-caixa')}
              >
                <span className="sidebar-icon">💵</span>
                Fluxo de Caixa
              </button>

              <button
                className={`sidebar-button ${isActive('/movimentos-caixa') ? 'active' : ''}`}
                onClick={handleNavigation('/movimentos-caixa')}
              >
                <span className="sidebar-icon">🏦</span>
                Movimentos de Caixa
              </button>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Operações</h4>

              <button
                className={`sidebar-button ${isActive('/transferencias') ? 'active' : ''}`}
                onClick={handleNavigation('/transferencias')}
              >
                <span className="sidebar-icon">🔄</span>
                Transferências
              </button>

              <button
                className={`sidebar-button ${isActive('/conciliacao') ? 'active' : ''}`}
                onClick={handleNavigation('/conciliacao')}
              >
                <span className="sidebar-icon">⚖️</span>
                Conciliação
              </button>

              <button
                className={`sidebar-button ${isActive('/fechamento-diario') ? 'active' : ''}`}
                onClick={handleNavigation('/fechamento-diario')}
              >
                <span className="sidebar-icon">🔒</span>
                Fechamento Diário
              </button>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Contabilidade</h4>

              <button
                className={`sidebar-button ${isActive('/plano-contas') ? 'active' : ''}`}
                onClick={handleNavigation('/plano-contas')}
              >
                <span className="sidebar-icon">📊</span>
                Plano de Contas
              </button>

              <button
                className={`sidebar-button ${isActive('/lancamentos-contabeis') ? 'active' : ''}`}
                onClick={handleNavigation('/lancamentos-contabeis')}
              >
                <span className="sidebar-icon">📝</span>
                Lançamentos Contábeis
              </button>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Fiscal</h4>

              <button
                className={`sidebar-button ${isActive('/configuracao-impostos') ? 'active' : ''}`}
                onClick={handleNavigation('/configuracao-impostos')}
              >
                <span className="sidebar-icon">⚙️</span>
                Configuração de Impostos
              </button>

              <button
                className={`sidebar-button ${isActive('/impostos-pagar') ? 'active' : ''}`}
                onClick={handleNavigation('/impostos-pagar')}
              >
                <span className="sidebar-icon">💰</span>
                Impostos a Pagar
              </button>

              <button
                className={`sidebar-button ${isActive('/notas-fiscais') ? 'active' : ''}`}
                onClick={handleNavigation('/notas-fiscais')}
              >
                <span className="sidebar-icon">📄</span>
                Notas Fiscais
              </button>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Relatórios</h4>

              <button
                className={`sidebar-button ${isActive('/relatorios') ? 'active' : ''}`}
                onClick={handleNavigation('/relatorios')}
              >
                <span className="sidebar-icon">📋</span>
                Relatórios Financeiros
              </button>
            </div>
          </>
        )}

        {/* ABA CONFIGURAÇÕES */}
        {activeTab === 'configuracoes' && (
          <>
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
                className={`sidebar-button ${isActive('/empresas') ? 'active' : ''}`}
                onClick={handleNavigation('/empresas')}
              >
                <span className="sidebar-icon">🏭</span>
                Empresas
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

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Financeiro</h4>

              <button
                className={`sidebar-button ${isActive('/categorias-financeiras') ? 'active' : ''}`}
                onClick={handleNavigation('/categorias-financeiras')}
              >
                <span className="sidebar-icon">🏷️</span>
                Categorias Financeiras
              </button>

              <button
                className={`sidebar-button ${isActive('/centros-custo') ? 'active' : ''}`}
                onClick={handleNavigation('/centros-custo')}
              >
                <span className="sidebar-icon">🏢</span>
                Centros de Custo
              </button>

              <button
                className={`sidebar-button ${isActive('/metodos-pagamento') ? 'active' : ''}`}
                onClick={handleNavigation('/metodos-pagamento')}
              >
                <span className="sidebar-icon">💳</span>
                Métodos de Pagamento
              </button>

              <button
                className={`sidebar-button ${isActive('/bank-accounts') ? 'active' : ''}`}
                onClick={handleNavigation('/bank-accounts')}
              >
                <span className="sidebar-icon">🏛️</span>
                Contas Bancárias
              </button>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Cadastros</h4>

              <button
                className={`sidebar-button ${isActive('/clientes') ? 'active' : ''}`}
                onClick={handleNavigation('/clientes')}
              >
                <span className="sidebar-icon">👥</span>
                Clientes
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