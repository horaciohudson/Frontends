import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './routes/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, senha);
      navigate('/');
    } catch (err) {
      setErro('Credenciais inválidas');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '5rem auto',
      padding: '2rem',
      background: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>🔐 Login no SIGEVE</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Usuário:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
          />
        </div>
        {erro && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {erro}
          </div>
        )}
        <button
          type="submit"
          style={{
            padding: '0.6rem 1rem',
            width: '100%',
            background: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
