import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏠 Dashboard - Gearenty</h1>
          <div className="user-info">
            <span>Bem-vindo, {user?.nome || user?.login || 'Usuário'}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>🎉 Sistema funcionando!</h2>
            <p>Você está logado com sucesso no sistema Gearenty.</p>
            
            <div className="user-details">
              <h3>Informações do usuário:</h3>
              <ul>
                <li><strong>Login:</strong> {user?.login}</li>
                <li><strong>Nome:</strong> {user?.nome || 'Não informado'}</li>
                <li><strong>Email:</strong> {user?.email || 'Não informado'}</li>
                <li><strong>Tipo:</strong> {user?.tipo || 'Não informado'}</li>
              </ul>
            </div>

            <div className="actions">
              <button className="action-btn primary">
                📊 Ver Relatórios
              </button>
              <button className="action-btn secondary">
                ⚙️ Configurações
              </button>
              <button className="action-btn secondary">
                👥 Usuários
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Vendas</h3>
                <p className="stat-number">1,234</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Usuários</h3>
                <p className="stat-number">56</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Produtos</h3>
                <p className="stat-number">789</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Receita</h3>
                <p className="stat-number">R$ 45.678</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;