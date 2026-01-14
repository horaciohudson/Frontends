import Header from "../components/Header";
import Footer from "../components/Footer";
import CommercialSidebar from "../components/CommercialSidebar";
import { Outlet } from "react-router-dom";
import styles from "../styles/layouts/CommercialLayout.module.css";

const CommercialLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <CommercialSidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CommercialLayout;
