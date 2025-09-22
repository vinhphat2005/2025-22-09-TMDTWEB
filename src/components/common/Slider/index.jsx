import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/pagination';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import MediaContainer from '../MediaContainer';
import './sliderStyles.css';

const Slider = ({
  slides,
  clearPlaceholders,
  onVariantPick,
  onCardPick,
  showPlaceholder,
  toPage,
  bp,
  slidesPerView,
  spaceBetween,
  loop,
  centeredSlides,
  grabCursor,
  autoplay,
  pagination,
  navigation,
  allowTouchMove = true,
  nested,
  modules,
  onTouchStart,
  onTouchEnd,
  sliderClassName,
  slideClassName,
  mediaContainerClassName,
  imageFillClassName,
  imagePlaceholderClassName,
  imageClassName,
}) => {
  const [slugCheck, setSlugCheck] = useState(false);

  useEffect(() => {
    if (toPage) {
      const pathname = window.location.pathname;
      setSlugCheck(slides[0].url === pathname.split('/')[2]);
    }
  }, [slides, toPage]);

  return (
    <>
      <Swiper
        breakpoints={bp ? bp : undefined}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        loop={loop}
        centeredSlides={centeredSlides}
        grabCursor={grabCursor}
        autoplay={autoplay}
        pagination={pagination}
        navigation={navigation}
        allowTouchMove={allowTouchMove}
        nested={nested}
        modules={modules}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`${sliderClassName} slider-navigation`}
      >
        {navigation && (
          <>
            <div
              className={`swiper-button image-swiper-button-prev ${showPlaceholder ? 'no-show' : undefined}`}
            >
              <FaArrowLeft />
            </div>
            <div
              className={`swiper-button image-swiper-button-next ${showPlaceholder ? 'no-show' : undefined}`}
            >
              <FaArrowRight />
            </div>
          </>
        )}
        {slides.map((slide) => (
          <SwiperSlide
            key={slide.id} // Assuming slide.id is unique for each slide
            className={slideClassName}
            onClick={
              onVariantPick
                ? () => onVariantPick({ variantId: slide.id })
                : onCardPick
                  ? onCardPick
                  : undefined
            }
          >
            <MediaContainer
              image={slide.src}
              to={toPage && toPage + slide.url}
              alt={slide.alt || ''}
              slugCheck={slugCheck}
              clearPlaceholders={clearPlaceholders}
              containerClassName={mediaContainerClassName}
              fillClassName={imageFillClassName}
              placeholderClassName={imagePlaceholderClassName}
              mediaClassName={imageClassName}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

Slider.propTypes = {
  slides: PropTypes.array.isRequired,
  clearPlaceholders: PropTypes.func,
  onVariantPick: PropTypes.func,
  onCardPick: PropTypes.func,
  showPlaceholder: PropTypes.bool,
  toPage: PropTypes.string,
  bp: PropTypes.object,
  slidesPerView: PropTypes.number,
  spaceBetween: PropTypes.number,
  loop: PropTypes.bool,
  centeredSlides: PropTypes.bool,
  grabCursor: PropTypes.bool,
  autoplay: PropTypes.object,
  pagination: PropTypes.object,
  navigation: PropTypes.object,
  allowTouchMove: PropTypes.bool,
  nested: PropTypes.bool,
  modules: PropTypes.object,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  sliderClassName: PropTypes.string,
  slideClassName: PropTypes.string,
  mediaContainerClassName: PropTypes.string,
  imageFillClassName: PropTypes.string,
  imagePlaceholderClassName: PropTypes.string,
  imageClassName: PropTypes.string,
};

export default Slider;
