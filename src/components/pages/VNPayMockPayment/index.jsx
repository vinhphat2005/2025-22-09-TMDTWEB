import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from 'hooks/useOrder';
import { Loader } from 'components/common';
import styles from './index.module.scss';

const VNPayMockPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createOrder, isLoading } = useOrder();
  const [selectedBank, setSelectedBank] = useState('');

  // Get order info from location state
  const { orderInfo, billingAddress } = location.state || {};

  const banks = [
    { code: 'NCB', name: 'Ngân hàng NCB' },
    { code: 'VIETCOMBANK', name: 'Vietcombank' },
    { code: 'TECHCOMBANK', name: 'Techcombank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'VIETINBANK', name: 'VietinBank' },
  ];

  const handlePayment = async () => {
    if (!selectedBank) {
      alert('Vui lòng chọn ngân hàng!');
      return;
    }

    // Simulate payment process
    const transactionNo = `TXN${Date.now()}`;
    const payDate = new Date().toISOString();

    console.log('💳 Processing mock payment...');

    await createOrder(
      {
        method: 'vnpay',
        transactionNo,
        bankCode: selectedBank,
        payDate,
        status: 'success',
      },
      billingAddress
    );

    // Navigate to success page
    navigate('/payment/vnpay-success', {
      state: {
        transactionNo,
        orderId: orderInfo?.orderId,
        amount: orderInfo?.amount,
        bankCode: selectedBank,
      },
    });
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  return (
    <div className={styles.container}>
      {isLoading && <Loader />}
      {!isLoading && (
        <div className={styles.payment_card}>
          <div className={styles.header}>
            <img
              src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
              alt="VNPAY"
              className={styles.logo}
            />
            <h1 className={styles.title}>Cổng thanh toán VNPAY</h1>
          </div>

          <div className={styles.order_info}>
            <h2>Thông tin đơn hàng</h2>
            <div className={styles.info_row}>
              <span>Mã đơn hàng:</span>
              <strong>{orderInfo?.orderId}</strong>
            </div>
            <div className={styles.info_row}>
              <span>Số tiền:</span>
              <strong className={styles.amount}>
                {orderInfo?.amount?.toLocaleString('vi-VN')} VND
              </strong>
            </div>
            <div className={styles.info_row}>
              <span>Nội dung:</span>
              <span>{orderInfo?.orderInfo}</span>
            </div>
          </div>

          <div className={styles.bank_selection}>
            <h2>Chọn phương thức thanh toán</h2>
            <div className={styles.bank_list}>
              {banks.map((bank) => (
                <label key={bank.code} className={styles.bank_option}>
                  <input
                    type="radio"
                    name="bank"
                    value={bank.code}
                    checked={selectedBank === bank.code}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  />
                  <span>{bank.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.demo_notice}>
            ℹ️ <strong>Demo Mode:</strong> Đây là giao diện mô phỏng VNPAY. 
            Trong thực tế, bạn sẽ được chuyển sang trang ngân hàng để nhập thông tin thẻ.
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cancel_button}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Hủy giao dịch
            </button>
            <button
              className={styles.pay_button}
              onClick={handlePayment}
              disabled={isLoading || !selectedBank}
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VNPayMockPayment;
