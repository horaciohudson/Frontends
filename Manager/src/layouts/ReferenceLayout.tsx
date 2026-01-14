import Header from "../components/Header";
import Footer from "../components/Footer";
import ReferenceSidebar from "../components/ReferenceSidebar";
import { Outlet } from "react-router-dom";
import styles from "../styles/layouts/ReferenceLayout.module.css";

const ReferenceLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <ReferenceSidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ReferenceLayout;
