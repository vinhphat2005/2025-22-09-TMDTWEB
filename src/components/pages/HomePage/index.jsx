import HeroSection from './HeroSection';
import ProductSliderSection from './ProductSliderSection';
import SlideshowSection from './SlideshowSection';
import CollectionsSection from './CollectionsSection';
import styles from './index.module.scss';
// import { useProductContext } from 'hooks/useProductContext';
// import {index} from 'hooks/useProductContext';
// import ProductSlider from '../ProductPage/ProductSlider';

export const HomePage = () => {
  // const { selectedProduct } = useProductContext();
  return (
    <>

      <SlideshowSection />
      <ProductSliderSection
        titleBottom="New Arrivals"
        sortBy={{ field: 'price', direction: 'desc' }}
      />

      <CollectionsSection />
      <ProductSliderSection
        titleTop="Everyday"
        titleBottom="Essentials"
        sortBy={{ field: 'createdAt', direction: 'asc' }}
      />
      <HeroSection />
    </>
  );
};

export default HomePage;
