import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    user?: {
        id: string | number;
        username: string;
        tenantId: string | number;
        tenantCode: string;
        tenantName?: string;
        roles?: string[];
    };
    onLogout: () => void;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const userForComponents = user ? {
        username: user.username,
        tenantCode: user.tenantCode || `T${user.tenantId}`,
        tenantName: user.tenantName || user.tenantCode || `T${user.tenantId}`
    } : undefined;

    return (
        <div className="dashboard-layout">
            <Sidebar onLogout={onLogout} />

            <div className="dashboard-content">
                <Header
                    user={userForComponents}
                    onToggleSidebar={toggleSidebar}
                />

                <main className="dashboard-main">
                    {children}
                </main>

                <footer className="dashboard-footer">
                    <div className="footer-content">
                        <span>© 2024 Sistema de Produção Integrado</span>
                        <span>Versão 1.0.0</span>
                    </div>
                </footer>
            </div>

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
