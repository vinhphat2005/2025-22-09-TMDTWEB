import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const PayPalButton = ({ amount, onSuccess, onError, onCancel }) => {
  const paypalRef = useRef();

  useEffect(() => {
    // Load PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=${import.meta.env.VITE_PAYPAL_CURRENCY || 'USD'}`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.paypal
          .Buttons({
            // Create Order
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toFixed(2),
                      currency_code: import.meta.env.VITE_PAYPAL_CURRENCY || 'USD',
                    },
                    description: 'SKRT Ecommerce Purchase',
                  },
                ],
                application_context: {
                  shipping_preference: 'NO_SHIPPING', // Don't ask for shipping address in PayPal
                },
              });
            },

            // Approve Order (after user login)
            onApprove: async (data, actions) => {
              try {
                const order = await actions.order.capture();
                console.log('✅ PayPal Order Captured:', order);
                
                if (onSuccess) {
                  onSuccess(order);
                }
              } catch (error) {
                console.error('❌ PayPal Capture Error:', error);
                if (onError) {
                  onError(error);
                }
              }
            },

            // Error handler
            onError: (err) => {
              console.error('❌ PayPal Error:', err);
              if (onError) {
                onError(err);
              }
            },

            // Cancel handler
            onCancel: (data) => {
              console.log('⚠️ PayPal Payment Cancelled:', data);
              if (onCancel) {
                onCancel(data);
              }
            },

            // Style customization
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 45,
            },
          })
          .render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, onSuccess, onError, onCancel]);

  return <div ref={paypalRef} />;
};

PayPalButton.propTypes = {
  amount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
};

export default PayPalButton;
