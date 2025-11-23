import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyVNPayCallback } from 'helpers/vnpay';
import { useOrder } from 'hooks/useOrder';
import { Loader } from 'components/common';
import styles from './index.module.scss';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createOrder, isLoading } = useOrder();
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Lấy tất cả params từ URL
        const vnpParams = {};
        for (const [key, value] of searchParams.entries()) {
          vnpParams[key] = value;
        }

        console.log('📦 VNPAY Callback params:', vnpParams);

        // Verify callback
        const verifyResult = verifyVNPayCallback(vnpParams);
        console.log('✅ Verify result:', verifyResult);

        setResult(verifyResult);

        // Nếu thanh toán thành công, tạo order trong Firestore
        if (verifyResult.isSuccess) {
          const pendingOrder = sessionStorage.getItem('pendingOrder');
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            
            console.log('💾 Creating order in Firestore...');
            
            await createOrder(
              {
                method: 'vnpay',
                transactionNo: verifyResult.transactionNo,
                bankCode: verifyResult.bankCode,
                payDate: verifyResult.payDate,
              },
              orderData.billingAddress
            );

            // Clear pending order
            sessionStorage.removeItem('pendingOrder');
            console.log('✅ Order created successfully!');
          }

          setTimeout(() => {
            navigate('/account');
          }, 3000);
        }
        
        setIsProcessing(false);
      } catch (error) {
        console.error('❌ Error processing VNPAY callback:', error);
        setResult({
          isValid: false,
          isSuccess: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
        });
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, navigate, createOrder]);

  if (isProcessing) {
    return (
      <div className={styles.container}>
        <Loader />
        <p className={styles.processing}>Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.result_card}>
        {result?.isSuccess ? (
          <>
            <div className={styles.success_icon}>✓</div>
            <h1 className={styles.title}>Thanh toán thành công!</h1>
            <p className={styles.message}>{result.message}</p>
            <div className={styles.details}>
              <div className={styles.detail_row}>
                <span className={styles.label}>Mã giao dịch:</span>
                <span className={styles.value}>{result.transactionNo}</span>
              </div>
              <div className={styles.detail_row}>
                <span className={styles.label}>Mã đơn hàng:</span>
                <span className={styles.value}>{result.orderId}</span>
              </div>
              <div className={styles.detail_row}>
                <span className={styles.label}>Số tiền:</span>
                <span className={styles.value}>
                  {result.amount?.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className={styles.detail_row}>
                <span className={styles.label}>Ngân hàng:</span>
                <span className={styles.value}>{result.bankCode}</span>
              </div>
            </div>
            <p className={styles.redirect}>
              Đang chuyển hướng về trang tài khoản...
            </p>
          </>
        ) : (
          <>
            <div className={styles.error_icon}>✕</div>
            <h1 className={styles.title}>Thanh toán thất bại</h1>
            <p className={styles.message}>{result?.message}</p>
            <button
              className={styles.retry_button}
              onClick={() => navigate('/cart')}
            >
              Quay lại giỏ hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VNPayReturn;
