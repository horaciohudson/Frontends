import CustomerTabs from "./CustomerTabs";
import styles from "../../styles/customers/CustomerPage.module.css";

export default function CustomerPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <CustomerTabs />
      </div>
    </div>
  );
}
