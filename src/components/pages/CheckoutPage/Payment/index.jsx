import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { BiChevronLeft } from 'react-icons/bi';

import { useAuthContext } from 'hooks/useAuthContext';
import { useCheckoutContext } from 'hooks/useCheckoutContext';
import { useCheckout } from 'hooks/useCheckout';
import { useOrder } from 'hooks/useOrder';

import CheckoutSummary from '../CheckoutSummary';
import AddressForm from '../AddressForm';
import { Button, Loader } from 'components/common';
import { formatCardNumber, formatExpiryDate, formatCvv } from 'helpers/format';
import styles from './index.module.scss';
import { PayPalButton } from "react-paypal-button-v2";

const Payment = () => {
  const navigate = useNavigate();

  const { addresses } = useAuthContext();
  const { shippingAddress } = useCheckoutContext();
  const { selectPreviousStep } = useCheckout();
  const { createOrder, isLoading, error } = useOrder();

  const [paymentOption, setPaymentOption] = useState('creditCard');
  const [navigation, setNavigation] = useState(false);

  const [cardInput, setCardInput] = useState({
    cardNumber: '',
    name: '',
    expiryDate: '',
    securityCode: '',
  });

  const handleCardNumberInput = (e) => {
    setCardInput((prevState) => ({
      ...prevState,
      cardNumber: formatCardNumber(e.target.value),
    }));
  };

  const handleNameInput = (e) => {
    setCardInput((prevState) => ({ ...prevState, name: e.target.value }));
  };

  const handleExpiryDateInput = (e) => {
    setCardInput((prevState) => ({
      ...prevState,
      expiryDate: formatExpiryDate(e.target.value),
    }));
  };

  const handleSecurityCodeInput = (e) => {
    setCardInput((prevState) => ({
      ...prevState,
      securityCode: formatCvv(e.target.value),
    }));
  };

  const options = [...addresses, { label: 'Add new address', value: 'new' }];

  const [billingAddress, setBillingAddress] = useState('same');
  const [isDisabled, setIsDisabled] = useState(false);
  const [defaultOption, setDefaultOption] = useState(null);
  const [newAddress, setNewAddress] = useState({});

  const [billingInput, setBillingInput] = useState({
    id: '',
    name: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    label: '',
    value: '',
  });

  useEffect(() => {
    let initialOption;

    if (shippingAddress.id) {
      initialOption = options.find(
        (option) => option.value === shippingAddress.id
      );
    }

    if (!initialOption) {
      initialOption = options.find((option) => option.isMain);
    }

    if (!initialOption) {
      setDefaultOption({ label: 'Add new address', value: 'new' });
      setBillingInput({
        ...billingInput,
        label: 'Add new Address',
        value: 'new',
      });
    } else {
      setDefaultOption(initialOption);
      setBillingInput({ ...billingInput, ...initialOption });
    }
  }, []);

  useEffect(() => {
    if (billingInput.value === 'new') {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [billingInput.value]);

  const handleBillingInput = (key, value) => {
    setBillingInput((prevState) => ({
      ...prevState,
      [key]: value,
    }));

    setNewAddress((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSelectAddress = (option) => {
    if (option.value === 'new') {
      setBillingInput((prevState) => ({
        ...prevState,
        id: newAddress.id || '',
        name: newAddress.name || '',
        lastName: newAddress.lastName || '',
        address: newAddress.address || '',
        city: newAddress.city || '',
        state: newAddress.state || '',
        zipCode: newAddress.zipCode || '',
        phoneNumber: newAddress.phoneNumber || '',
        label: option.label,
        value: option.value,
      }));
    } else {
      setBillingInput((prevState) => ({
        ...prevState,
        id: option.id || '',
        name: option.name || '',
        lastName: option.lastName || '',
        address: option.address || '',
        city: option.city || '',
        state: option.state || '',
        zipCode: option.zipCode || '',
        phoneNumber: option.phoneNumber || '',
        label: option.label,
        value: option.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (paymentOption !== 'creditCard' && paymentOption !== 'PaypalDelivery') {
    //   // Nếu chưa chọn, hiển thị thông báo và ngăn chặn việc thực hiện hành động tiếp theo
    //   alert('Please select a payment method (Credit card or Paypal).');
    //   return;
    // }
    await createOrder(cardInput, {
      address: billingInput.address,
      city: billingInput.city,
      id: billingInput.id,
      name: billingInput.name,
      lastName: billingInput.lastName,
      phoneNumber: billingInput.phoneNumber,
      state: billingInput.state,
      zipCode: billingInput.zipCode,
    });

    setNavigation(true);
  };

  useEffect(() => {
    if (navigation && !error) {
      navigate('/account');
    } else {
      setNavigation(false);
    }
  }, [navigation]);

  const cardNumberStyles = {
    label:
      cardInput.cardNumber.length > 0
        ? styles.label_focus
        : styles.label_no_focus,
    input:
      cardInput.cardNumber.length > 0
        ? styles.input_focus
        : styles.input_no_focus,
  };

  const nameStyles = {
    label:
      cardInput.name.length > 0 ? styles.label_focus : styles.label_no_focus,
    input:
      cardInput.name.length > 0 ? styles.input_focus : styles.input_no_focus,
  };

  const expiryDateStyles = {
    label:
      cardInput.expiryDate.length > 0
        ? styles.label_focus
        : styles.label_no_focus,
    input:
      cardInput.expiryDate.length > 0
        ? styles.input_focus
        : styles.input_no_focus,
  };

  const securityCodeStyles = {
    label:
      cardInput.securityCode.length > 0
        ? styles.label_focus
        : styles.label_no_focus,
    input:
      cardInput.securityCode.length > 0
        ? styles.input_focus
        : styles.input_no_focus,
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <Loader containerClassName={styles.loader_container} noPortal={true} />
      )}
      {!isLoading && (
        <div className={styles.wrapper}>
          <>
            <CheckoutSummary />
            <form id="form" onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.payment_options_container}>
                <h2 className={styles.title}>Payment Method</h2>

                <div className={styles.payment_options_wrapper}>
                  <div>
                    <label className={styles.payment_option}>
                      <input
                        type="radio"
                        value="creditCard"
                        checked={paymentOption === 'creditCard'}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className={
                          paymentOption === 'creditCard'
                            ? styles.radio_selected
                            : styles.radio_unselected
                        }
                      />
                      <span>Credit card
                      </span>
                    </label>
                  </div>
                  {paymentOption === 'creditCard' && (
                    <div className={styles.inputs_wrapper}>
                      <div className={styles.float_container}>
                        <label
                          htmlFor="cardNumber"
                          className={cardNumberStyles.label}
                        >
                          Card number
                        </label>
                        <input
                          id="cardNumber"
                          onChange={handleCardNumberInput}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          value={cardInput.cardNumber}
                          type="text"
                          inputMode="numeric"
                          placeholder="Card number"
                          className={cardNumberStyles.input}
                          required
                        />
                      </div>
                      <div className={styles.float_container}>
                        <label htmlFor="name" className={nameStyles.label}>
                          Name on card
                        </label>
                        <input
                          id="name"
                          onChange={handleNameInput}
                          value={cardInput.name}
                          type="text"
                          placeholder="Name on card"
                          className={nameStyles.input}
                          autoComplete="off"
                          required
                        />
                      </div>
                      <div className={styles.card_security}>
                        <div className={styles.float_container}>
                          <label
                            htmlFor="expiryDate"
                            className={expiryDateStyles.label}
                            autoComplete="off"
                          >
                            Expiration Date (MM/YY)
                          </label>
                          <input
                            id="expiryDate"
                            onChange={handleExpiryDateInput}
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            value={cardInput.expiryDate}
                            type="text"
                            placeholder="Expiration Date (MM/YY)"
                            className={expiryDateStyles.input}
                            autoComplete="off"
                            required
                          />
                        </div>
                        <div className={styles.float_container}>
                          <label
                            htmlFor="securityCode"
                            className={securityCodeStyles.label}
                          >
                            Security code
                          </label>
                          <input
                            id="securityCode"
                            onChange={handleSecurityCodeInput}
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            value={cardInput.securityCode}
                            type="password"
                            placeholder="Security code"
                            className={securityCodeStyles.input}
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className={styles.payment_option}>
                      <input
                        type="radio"
                        value="Cash Delivery"
                        checked={paymentOption === 'Cash Delivery'}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className={
                          paymentOption === 'Cash Delivery'
                            ? styles.radio_selected
                            : styles.radio_unselected
                        }
                      />
                      <span>Cash Delivery
                      </span>
                    </label>
                  </div>
                  {/* PAYPAL */}
                  {/* <div>
                    <label className={styles.payment_option}>
                      <input

                        type="radio"
                        value="PaypalDelivery"
                        checked={paymentOption === 'PaypalDelivery'}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className={
                          paymentOption === 'PaypalDelivery'
                            ? styles.radio_selected
                            : styles.radio_unselected
                        }

                      />

                      <span>PayPal
                      </span>
                    </label>
                  </div>
                  {paymentOption === 'PaypalDelivery' && (
                    <div className={styles.inputs_wrapper}>
                      <div className={styles.float_container}>
                      </div>
                      <div className={styles.card_security}>
                        <div className={styles.float_container}>
                          <PayPalButton form="form" type="submit" className={styles.button}
                            amount="0.01"
                            onSuccess={(details, data) => {
                              alert("Giao dịch hoàn thành bởi " + details.payer.name.given_name);


                              // OPTIONAL: Call your server to save the transaction
                              return fetch("/paypal-transaction-complete", {
                                method: "post",
                                body: JSON.stringify({
                                  orderId: data.orderID
                                })
                              });
                            }}
                            options={{
                              clientId: "AQH-doU27MCWRYWOhihCN-5D795zFImnBd6Gc0_IV-IUCqklmKm8eputSVB8D4N34h3SgbCpWv5glRNJ"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                   
                  )} */}
                  {/* PAYPAL   */}
                </div>

              </div>
              <div className={styles.billing_address_container}>
                <h2 className={styles.billing_address_title}>
                  Billing Address
                </h2>
                <div className={styles.billing_address_wrapper}>
                  <div>
                    <label className={styles.payment_option}>
                      <input
                        type="radio"
                        value="same"
                        checked={billingAddress === 'same'}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className={
                          billingAddress === 'same'
                            ? styles.radio_selected
                            : styles.radio_unselected
                        }
                      />
                      <span>Same as shipping address</span>
                    </label>
                  </div>
                  <div>
                    <label className={styles.payment_option}>
                      <input
                        type="radio"
                        value="different"
                        checked={billingAddress === 'different'}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className={
                          billingAddress === 'different'
                            ? styles.radio_selected
                            : styles.radio_unselected
                        }
                      />
                      <span>Use different billing address</span>
                    </label>
                  </div>
                  {billingAddress === 'different' && (
                    <AddressForm
                      userInput={billingInput}
                      options={options}
                      defaultOption={defaultOption}
                      isDisabled={isDisabled}
                      handleInput={handleBillingInput}
                      handleSelectAddress={handleSelectAddress}
                      containerClassName={styles.billing_form_container}
                    />
                  )}
                </div>
              </div>
            </form>
            <div className={styles.form_controls}>
              <p onClick={selectPreviousStep} className={styles.back}>
                <span>
                  <BiChevronLeft />
                </span>
                Back to shipping
              </p>
              <Button form="form" type="submit" className={styles.button}>
                Pay now
              </Button>
            </div>
          </>
        </div>
      )}
    </div>
  );
};

export default Payment;
