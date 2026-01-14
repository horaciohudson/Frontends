import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import styles from '../styles/DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles["dashboard-wrapper"]}>
      <Header />
      
      <div className={styles["dashboard-body"]}>
        <Sidebar />
        <div className={styles["dashboard-content"]}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
