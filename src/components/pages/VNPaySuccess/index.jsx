import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './index.module.scss';

const VNPaySuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionNo, orderId, amount, bankCode } = location.state || {};

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/account');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.success_card}>
        <div className={styles.success_icon}>✓</div>
        <h1 className={styles.title}>Thanh toán thành công!</h1>
        <p className={styles.subtitle}>
          Giao dịch của bạn đã được xử lý thành công
        </p>

        <div className={styles.details}>
          <div className={styles.detail_row}>
            <span className={styles.label}>Mã giao dịch:</span>
            <span className={styles.value}>{transactionNo}</span>
          </div>
          <div className={styles.detail_row}>
            <span className={styles.label}>Mã đơn hàng:</span>
            <span className={styles.value}>{orderId}</span>
          </div>
          <div className={styles.detail_row}>
            <span className={styles.label}>Số tiền:</span>
            <span className={styles.value}>
              {amount?.toLocaleString('vi-VN')} VND
            </span>
          </div>
          <div className={styles.detail_row}>
            <span className={styles.label}>Ngân hàng:</span>
            <span className={styles.value}>{bankCode}</span>
          </div>
          <div className={styles.detail_row}>
            <span className={styles.label}>Thời gian:</span>
            <span className={styles.value}>
              {new Date().toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        <div className={styles.demo_badge}>
          🎓 Demo Mode - Mô phỏng cho mục đích học tập
        </div>

        <p className={styles.redirect}>
          Tự động chuyển về trang tài khoản sau 5 giây...
        </p>

        <button
          className={styles.button}
          onClick={() => navigate('/account')}
        >
          Xem đơn hàng của tôi
        </button>
      </div>
    </div>
  );
};

export default VNPaySuccess;
