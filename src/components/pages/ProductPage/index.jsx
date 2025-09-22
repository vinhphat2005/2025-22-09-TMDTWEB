import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css'; // Import Swiper styles

import { useProductContext } from 'hooks/useProductContext';
import { useCart } from 'hooks/useCart';
import { useToast } from 'hooks/useToast';

import ProductColors from './ProductColors';
import ProductSize from './ProductSize';
import ProductTags from './ProductTags';
import ProductSlider from './ProductSlider';
import {
  Button,
  Loader,
  Slider,
  MediaContainer,
  NotFound,
} from 'components/common';

import { formatPrice } from 'helpers/format';

import styles from './index.module.scss';
//Icon Plus Close
import { IoIosAdd, IoIosClose } from 'react-icons/io';
// document.addEventListener("DOMContentLoaded", function () {
//   const paragraphs = document.querySelectorAll(".bulleted-paragraph");
//   paragraphs.forEach((p) => {
//     if (p.textContent.trim() !== "") {
//       p.classList.add("has-content");
//     }
//   });
// });
const ProductPage = () => {
  const {
    productIsReady,
    selectedProduct,
    selectedVariant,
    selectedSize,
    selectedSkuId,
    singleSize,
  } = useProductContext();
  const { addItem, isLoading, error } = useCart();
  const { sendToast } = useToast();

  const [notify, setNotify] = useState(false);
  //ButtonShowHide

  const [isRotated, setIsRotated] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const toggleContent = () => {
    setIsHidden(!isHidden);
    setIsRotated(!isRotated);

  };


  const handleAddToCart = async () => {
    await addItem({
      productId: selectedProduct.productId,
      variantId: selectedVariant.variantId,
      skuId: selectedSkuId,
      size: selectedSize,
      model: selectedProduct.model,
      type: selectedProduct.type,
      color: selectedVariant.color,
      price: selectedVariant.variantPrice,
      slug: selectedProduct.slug + '-' + selectedVariant.color,
      image: selectedVariant.images[0].src,
    });
    setNotify(true);
  };

  useEffect(() => {
    if (notify) {
      if (!error) {
        sendToast({
          addToCart: true,
          content: {
            image: selectedVariant.images[0].src,
            message: `${selectedProduct.model} ${selectedProduct.type} - ${selectedVariant.color
              } ${selectedVariant.color ? ` - ${selectedVariant.color.toUpperCase()}` : ''}`,
          },
        });
      } else if (error) {
        sendToast({ error: true, content: { message: error.message } });
      }

      setNotify(false);
    }
  }, [notify]);

  let addEventHandler = false;

  if (singleSize) {
    if (singleSize.quantity > 0) {
      addEventHandler = true;
    }
  } else {
    if (selectedSize.length > 0) {
      addEventHandler = true;
    }
  }

  const buttonContent = singleSize
    ? singleSize.quantity > 0
      ? `ADD ${selectedVariant.color.toUpperCase()} TO BAG`
      : 'OUT OF STOCK'
    : selectedSize.length === 0
      ? 'SELECT STORAGE'
      : `ADD ${selectedVariant.color.toUpperCase()} TO BAG`;

  const buttonStyles = `
    ${singleSize
      ? singleSize.quantity > 0
        ? styles.button
        : styles.button_disabled
      : selectedSize.length === 0
        ? styles.button_disabled
        : styles.button
    }
  `;

  const isButtonDisabled = singleSize
    ? singleSize.quantity > 0
      ? false
      : true
    : selectedSize.length === 0
      ? true
      : false;

  const isBigScreen = useMediaQuery({
    query: '(min-width: 1024px)',
  });

  return (
    <div className={styles.productPage}>
      {!productIsReady && (
        <div className={styles.loader_section}>
          <Loader />
        </div>
      )}
      {productIsReady && !selectedVariant && (
        <section className="main-container">
          <NotFound />
        </section>
      )}
      {productIsReady && selectedVariant && (
        <>
          {!isBigScreen && (
            <section className={styles.productSectionSmall}>
              <div className={styles.container_s}>
                <div className={styles.slider_container}>
                  <div className={styles.slider_wrapper}>
                    <Slider
                      slides={selectedVariant.images}
                      breakpoints={{
                        500: {
                          slidesPerView: 1.5,
                        },
                        600: {
                          slidesPerView: 1.7,
                        },
                        800: {
                          slidesPerView: 2,
                        },
                      }}
                      slidesPerView={1.3}
                      spaceBetween={30}
                      loop={true}
                      centeredSlides={true}
                      grabCursor={true}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[Pagination]}
                      sliderClassName={styles.slider}
                      slideClassName={styles.slide}
                      mediaContainerClassName={styles.image_container}
                      imageFillClassName={styles.image_fill}
                      imageClassName={styles.image}
                    >
                      {selectedVariant.images.map((image, index) => (
                        <div key={index} className={styles.slide}>
                          <img
                            src={image.src}
                            alt={`Slide ${index}`}
                            className={styles.image}
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
                <div className={styles.grid_footer}>
                  <div className={styles.details_wrapper}>
                    <div className={styles.details}>
                      <div className={styles.name_wrapper}>
                        <h1 className={styles.name}>
                          {selectedProduct.model}
                        </h1>
                      </div>
                      {(selectedProduct.tags ||
                        selectedVariant.variantPrice <
                        selectedProduct.price) && (
                          <ProductTags
                            currentPrice={selectedVariant.variantPrice}
                            actualPrice={selectedProduct.price}
                          />
                        )}
                      <br />
                      <Button
                        className={styles.buttonShowHide} onClick={toggleContent}>
                        <span className="button-text">TechSpecs</span>
                        {isHidden ? (
                          <IoIosAdd className={`plus-icon ${isHidden ? '' : 'rotate-icon'}`} />
                        ) : (
                          <IoIosClose className={`close-icon ${isHidden ? '' : 'rotate-icon'}`} />
                        )}
                      </Button>
                      {!isHidden && (
                        <div>
                          <div className="boldDescription">
                            {selectedProduct.description}
                          </div>
                          <p className={styles.description1}>
                            {selectedProduct.description1}
                          </p>
                          <p className={styles.description2}>
                            {selectedProduct.description2}
                          </p>
                          <p className={styles.description3}>
                            {selectedProduct.description3}
                          </p>
                          <div className="boldDescription4">
                            {selectedProduct.description4}
                          </div>
                          <p className={styles.description5}>
                            {selectedProduct.description5}
                          </p>
                          <p className={styles.description6}>
                            {selectedProduct.description6}
                          </p>
                          <p className={styles.description7}>
                            {selectedProduct.description7}
                          </p>
                          <p className={styles.description8}>
                            {selectedProduct.description8}
                          </p>
                          <p className={styles.description9}>
                            {selectedProduct.description9}
                          </p>
                          <p className={styles.description10}>
                            {selectedProduct.description10}
                          </p>
                          <p className={styles.description11}>
                            {selectedProduct.description11}
                          </p>
                          <p className={styles.description12}>
                            {selectedProduct.description12}
                          </p>
                          <p className={styles.description13}>
                            {selectedProduct.description13}
                          </p>
                          <p className={styles.description14}>
                            {selectedProduct.description14}
                          </p>
                          <p className={styles.description15}>
                            {selectedProduct.description15}
                          </p>
                          <p className={styles.description16}>
                            {selectedProduct.description16}
                          </p>
                          <p className={styles.description17}>
                            {selectedProduct.description17}
                          </p>
                          <p className={styles.description18}>
                            {selectedProduct.description18}
                          </p>
                          <p className={styles.description19}>
                            {selectedProduct.description19}
                          </p>
                          <p className={styles.description20}>
                            {selectedProduct.description20}
                          </p>
                        </div>
                      )}
                      <p className={styles.color}>{selectedVariant.color}</p>

                    </div>
                    <p className={styles.price_wrapper}>
                      {selectedVariant.variantPrice <
                        selectedProduct.price ? (
                        <>
                          <span className={styles.discounted_price}>
                            {formatPrice(selectedVariant.variantPrice)}₫
                          </span>
                          <span className={styles.crossed_price}>
                            {formatPrice(selectedProduct.price)}₫
                          </span>
                        </>
                      ) : (
                        <span>{formatPrice(selectedProduct.price)}₫</span>
                      )}
                    </p>
                  </div>

                  <div className={styles.controls_wrapper}>
                    <div className={styles.variants_container}>
                      <div>
                        <p className={styles.number_of_colors}>
                          {selectedProduct.variants.length}{' '}
                          {selectedProduct.variants.length > 1
                            ? 'Colors'
                            : 'Color'}{' '}
                          <span>| {selectedVariant.color}</span>
                        </p>
                      </div>
                      <div className={styles.variants_wrapper}>
                        {selectedProduct.variants.map((variant) => (
                          <ProductColors
                            key={variant.variantId}
                            id={variant.variantId}
                            thumbnail={variant.images[0].src}
                            selectedId={selectedVariant.variantId}
                          />
                        ))}
                      </div>
                    </div>
                    {!singleSize && (
                      <div className={styles.sizes_container}>
                        <p className={styles.pick_size}>Select Storage</p>
                        <div className={styles.sizes_wrapper}>
                          {selectedVariant.sizes.map((size) => (
                            <ProductSize
                              key={size.skuId}
                              skuId={size.skuId}
                              value={size.value}
                              quantity={size.quantity}
                              selectedSize={selectedSize}
                            />
                          ))}
                        </div>

                      </div>
                    )}

                    {!isLoading && (
                      <Button
                        className={buttonStyles}
                        disabled={isButtonDisabled}
                        onClick={addEventHandler ? handleAddToCart : undefined}
                      >
                        <span className={styles.button_content_show}>
                          {buttonContent}
                        </span>
                      </Button>
                    )}
                    {isLoading && (
                      <Button className={buttonStyles} disabled={true}>
                        <span className={styles.button_loader}></span>
                        <span className={styles.button_content_no_show}>
                          {buttonContent}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {isBigScreen && (
            <section className="main-container">
              <div className={styles.container_b}>
                <div className={styles.details_wrapper}>
                  <div className={styles.details}>
                    <h1 className={styles.name}>{selectedProduct.model}</h1>
                    <p className={styles.price_wrapper}>
                      {selectedVariant.variantPrice <
                        selectedProduct.price ? (
                        <>
                          <span className={styles.discounted_price}>
                            {formatPrice(selectedVariant.variantPrice)}₫
                          </span>
                          <span className={styles.crossed_price}>
                            {formatPrice(selectedProduct.price)}₫
                          </span>
                        </>
                      ) : (
                        <span>{formatPrice(selectedProduct.price)}₫</span>
                      )}
                    </p>
                    {(selectedProduct.tags ||
                      selectedVariant.variantPrice <
                      selectedProduct.price) && (
                        <ProductTags
                          currentPrice={selectedVariant.variantPrice}
                          actualPrice={selectedProduct.price}
                        />
                      )}
                    <p className={styles.color}>{selectedVariant.color}</p>
                    <br />
                    <hr className={styles.hr} />
                    <Button
                      className={styles.buttonShowHide} onClick={toggleContent}>
                      <div className={styles.tech}>{isHidden ? 'TECH SPECS' : 'TECH SPECS'}</div>
                      {isHidden ? (
                        <IoIosAdd style={{ fontSize: '20px' }} className={`plus-icon ${isHidden ? '' : 'rotate-icon'}`} />
                      ) : (
                        <IoIosClose style={{ fontSize: '20px' }} className={`close-icon ${isHidden ? '' : 'rotate-icon'}`} />
                      )}
                    </Button>
                    <hr className={styles.hr} />
                    <br />
                    {!isHidden && (
                      <div className={styles.border}>
                        <div className="boldDescription">
                          {selectedProduct.description}
                        </div>
                        <p className={styles.description1}>
                          {selectedProduct.description1}
                        </p>
                        <p className={styles.description2}>
                          {selectedProduct.description2}
                        </p>
                        <p className={styles.description3}>
                          {selectedProduct.description3}
                        </p>
                        <div className="boldDescription">
                          {selectedProduct.description4}
                        </div>
                        <p className={styles.description5}>
                          {selectedProduct.description5}
                        </p>
                        <p className={styles.description6}>
                          {selectedProduct.description6}
                        </p>
                        <p className={styles.description7}>
                          {selectedProduct.description7}
                        </p>
                        <p className={styles.description8}>
                          {selectedProduct.description8}
                        </p>
                        <p className={styles.description9}>
                          {selectedProduct.description9}
                        </p>
                        <p className={styles.description10}>
                          {selectedProduct.description10}
                        </p>
                        <p className={styles.description11}>
                          {selectedProduct.description11}
                        </p>
                        <p className={styles.description12}>
                          {selectedProduct.description12}
                        </p>
                        <p className={styles.description13}>
                          {selectedProduct.description13}
                        </p>
                        <p className={styles.description14}>
                          {selectedProduct.description14}
                        </p>
                        <p className={styles.description15}>
                          {selectedProduct.description15}
                        </p>
                        <p className={styles.description16}>
                          {selectedProduct.description16}
                        </p>
                        <p className={styles.description17}>
                          {selectedProduct.description17}
                        </p>
                        <p className={styles.description18}>
                          {selectedProduct.description18}
                        </p>
                        <p className={styles.description19}>
                          {selectedProduct.description19}
                        </p>
                        <p className={styles.description20}>
                          {selectedProduct.description20}
                        </p>
                      </div>
                    )}

                  </div>
                  <br />
                  <div>
                    <div className="boldDescription">Discount
                      {selectedProduct.description21}
                    </div>
                    <p className={styles.description}>Giảm 500k khi thanh toán tại Store
                      {selectedProduct.description22}
                    </p>
                    <p className={styles.description}>Khuyến mãi toàn bộ sản phẩm iPhone và phụ kiện dịp cuối năm
                      {selectedProduct.description23}
                    </p>
                  </div>
                </div>

                <div className={styles.images}>
                  {selectedVariant.images.map((image, index) => (
                    <MediaContainer
                      key={index}
                      image={image.src}
                      alt={`Image ${index}`}
                      containerClassName={styles.image_container}
                      fillClassName={styles.image_fill}
                    />
                  ))}
                </div>
                <div className={styles.controls_wrapper}>
                  <div className={styles.variants_container}>
                    <div>
                      <p className={styles.number_of_colors}>
                        {selectedProduct.variants.length}{' '}
                        {selectedProduct.variants.length > 1
                          ? 'Colors'
                          : 'Color'}{' '}
                        <span>| {selectedVariant.color}</span>
                      </p>
                    </div>
                    <div className={styles.variants_wrapper}>
                      {selectedProduct.variants.map((variant) => (
                        <ProductColors
                          key={variant.variantId}
                          id={variant.variantId}
                          thumbnail={variant.images[0].src}
                          selectedId={selectedVariant.variantId}
                        />
                      ))}
                    </div>
                  </div>
                  {!singleSize && (
                    <div className={styles.sizes_container}>
                      <p className={styles.pick_size}>Select Storage</p>
                      <div className={styles.sizes_wrapper}>
                        {selectedVariant.sizes.map((size) => (
                          <ProductSize
                            key={size.skuId}
                            skuId={size.skuId}
                            value={size.value}
                            quantity={size.quantity}
                            selectedSize={selectedSize}
                          />
                        ))}

                      </div>
                    </div>
                  )}

                  {!isLoading && (
                    <Button
                      className={buttonStyles}
                      disabled={isButtonDisabled}
                      onClick={addEventHandler ? handleAddToCart : undefined}
                    >
                      <span className={styles.button_content_show}>
                        {buttonContent}
                      </span>
                    </Button>
                  )}
                  {isLoading && (
                    <Button className={buttonStyles} disabled={true}>
                      <span className={styles.button_loader}></span>
                      <span className={styles.button_content_no_show}>
                        {buttonContent}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}
          <ProductSlider
            titleBottom="Recommend Product"
            sortBy={{ field: 'price', direction: 'desc' }}
          />
        </>

      )}
    </div>
  );
};

export default ProductPage;
