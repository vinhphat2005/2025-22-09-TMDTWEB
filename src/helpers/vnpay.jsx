import CryptoJS from 'crypto-js';
import moment from 'moment';

/**
 * Tạo URL thanh toán VNPAY
 * @param {Object} orderInfo - Thông tin đơn hàng
 * @param {number} orderInfo.amount - Số tiền (VND)
 * @param {string} orderInfo.orderId - Mã đơn hàng
 * @param {string} orderInfo.orderInfo - Mô tả đơn hàng
 * @param {string} orderInfo.ipAddr - IP khách hàng
 * @returns {string} URL thanh toán
 */
export const createVNPayPaymentUrl = (orderInfo) => {
  const vnpayConfig = {
    vnp_TmnCode: import.meta.env.VITE_VNPAY_TMN_CODE,
    vnp_HashSecret: import.meta.env.VITE_VNPAY_HASH_SECRET,
    vnp_Url: import.meta.env.VITE_VNPAY_URL,
    vnp_ReturnUrl: import.meta.env.VITE_VNPAY_RETURN_URL,
  };

  const createDate = moment().format('YYYYMMDDHHmmss');
  const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

  let vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderInfo.orderId,
    vnp_OrderInfo: orderInfo.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: orderInfo.amount * 100, // VNPAY yêu cầu số tiền x100
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: orderInfo.ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Sắp xếp params theo thứ tự alphabet
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  // Tạo query string
  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  // Tạo secure hash
  const signData = queryString;
  const hmac = CryptoJS.HmacSHA512(signData, vnpayConfig.vnp_HashSecret);
  const signed = hmac.toString(CryptoJS.enc.Hex);

  return `${vnpayConfig.vnp_Url}?${queryString}&vnp_SecureHash=${signed}`;
};

/**
 * Xác thực callback từ VNPAY
 * @param {Object} vnpParams - Query params từ VNPAY return
 * @returns {Object} { isValid: boolean, message: string }
 */
export const verifyVNPayCallback = (vnpParams) => {
  const vnpayConfig = {
    vnp_HashSecret: import.meta.env.VITE_VNPAY_HASH_SECRET,
  };

  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  // Sắp xếp params theo thứ tự alphabet
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  // Tạo query string
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');

  // Tạo secure hash để so sánh
  const hmac = CryptoJS.HmacSHA512(signData, vnpayConfig.vnp_HashSecret);
  const signed = hmac.toString(CryptoJS.enc.Hex);

  if (secureHash === signed) {
    const responseCode = vnpParams.vnp_ResponseCode;
    
    if (responseCode === '00') {
      return {
        isValid: true,
        isSuccess: true,
        message: 'Giao dịch thành công',
        transactionNo: vnpParams.vnp_TransactionNo,
        orderId: vnpParams.vnp_TxnRef,
        amount: parseInt(vnpParams.vnp_Amount) / 100,
        bankCode: vnpParams.vnp_BankCode,
        payDate: vnpParams.vnp_PayDate,
      };
    } else {
      return {
        isValid: true,
        isSuccess: false,
        message: getResponseMessage(responseCode),
        responseCode,
      };
    }
  } else {
    return {
      isValid: false,
      isSuccess: false,
      message: 'Chữ ký không hợp lệ',
    };
  }
};

/**
 * Lấy message từ response code
 */
const getResponseMessage = (code) => {
  const messages = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
  };

  return messages[code] || 'Lỗi không xác định';
};

/**
 * Lấy IP của client (dùng cho development)
 */
export const getClientIp = () => {
  // Trong production nên dùng API backend để lấy real IP
  return '127.0.0.1';
};
