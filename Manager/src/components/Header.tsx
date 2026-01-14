

import React from "react";
import styles from "../styles/Header.module.css"; // ✅ importa como module
import { useAuth } from "../routes/AuthContext";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles["header-title"]}>
        🚀 SIGEVE - Sistema para Gestão de Vestuário
      </div>
      <div className={styles["header-actions"]}>
        <span>⚙️</span>
        <span>🔔</span>
        <span>👤 {user?.sub}</span>
      </div>
    </header>
  );
};

export default Header;
