import { useState } from 'react';

import { useSeed } from 'hooks/useSeed';
import { useNewsletterExport } from 'hooks/useNewsletterExport';
import { Link } from 'react-router-dom';

import { ConfirmModal, Loader } from 'components/common';
import styles from './index.module.scss';

const AdminPage = () => {
  const { uploadProducts, isLoading, error } = useSeed();
  const { exportSubscribers, loading: exportLoading } = useNewsletterExport();

  const [needConfirm, setNeedConfirm] = useState(false);

  const handleConfirm = async () => {
    setNeedConfirm(false);
    await uploadProducts();
  };

  const handleExportEmails = async () => {
    try {
      await exportSubscribers();
      alert('Newsletter subscribers exported successfully! Check your Downloads folder for the CSV file.');
    } catch (err) {
      alert('Error exporting subscribers: ' + err.message);
    }
  };

  return (
    <>
      {(isLoading || exportLoading) && <Loader />}
      <ConfirmModal
        show={needConfirm}
        close={() => setNeedConfirm(false)}
        handleConfirm={handleConfirm}
        title="Seed Data"
        text={`Data in "src/data/products.json" will be seeded to Firestore. Firestore only allows a maximum of 500 documents with each batch of writes. Organize data accordingly before hitting confirm.`}
      />
      <section>
        <div className={`${styles.container} main-container`}>
          <h1>Panel</h1>
          <div className={styles.options_wrapper}>
            <Link to="/admin/products" className={styles.option}>
              <div>Products</div>
            </Link>
            <Link to="/admin/products/add" className={styles.option}>
              <div>Add Product</div>
            </Link>
            <div
              onClick={handleExportEmails}
              className={styles.option}
            >
              <div>📧 Export Newsletter Emails</div>
            </div>
            <div
              onClick={() => setNeedConfirm(true)}
              className={`${styles.option} ${styles.seed}`}
            >
              <div>Seed Data</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminPage;
