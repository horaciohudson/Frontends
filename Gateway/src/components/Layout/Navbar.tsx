import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/dashboard">
                        <h1>Sigeve Gateway</h1>
                    </Link>
                </div>

                <div className="navbar-menu">
                    <Link to="/dashboard" className="navbar-link">
                        Dashboard
                    </Link>
                    <Link to="/launcher" className="navbar-link">
                        Launcher
                    </Link>
                    <Link to="/health" className="navbar-link">
                        Health Check
                    </Link>
                    <Link to="/sync" className="navbar-link">
                        Data Sync
                    </Link>
                </div>

                <div className="navbar-user">
                    <span className="user-name">{user?.username}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Sair
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
