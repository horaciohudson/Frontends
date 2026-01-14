// src/components/Footer.tsx
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      SIGEVE © {new Date().getFullYear()} — Sistema de Gestão de Vendas
    </footer>
  );
};

export default Footer;
