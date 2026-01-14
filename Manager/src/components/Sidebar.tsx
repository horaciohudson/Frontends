// src/components/Sidebar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import styles from '../styles/components/Sidebar.module.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  console.log("Token está disponível?", localStorage.getItem("token"));
  return (
    <aside className= {styles.sidebar}>
      <h2>📁 Menu</h2>
      <button onClick={() => navigate('/')}>🏠 Dashboard</button>
      <button onClick={() => navigate('/referenciais')}>📂 Referenciais</button>
      <button onClick={() => navigate('/principais')}>📋 Principais</button>
      <button onClick={() => navigate('/comerciais')}>🛍 Comerciais</button>    
      <button onClick={() => navigate('/relatorios')}>📈 Relatórios</button>
      <button onClick={() => navigate('/utilitarios')}>🛠️ Utilitários</button>

      <hr />
      <button onClick={logout}>🚪 Sair</button>
    </aside>
  );
}
