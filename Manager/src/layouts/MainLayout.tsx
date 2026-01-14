import Header from "../components/Header";
import Footer from "../components/Footer";
import MainSidebar from "../components/MainSidebar";
import { Outlet } from "react-router-dom";
import styles from "../styles/layouts/MainLayout.module.css";

const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <MainSidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
