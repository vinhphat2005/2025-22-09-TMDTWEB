import { useProduct } from 'hooks/useProduct';

import { MediaContainer } from 'components/common';

import styles from './index.module.scss';

const ProductColors = ({ id, thumbnail, selectedId, color, model }) => {
  const { selectVariant } = useProduct();

  let shouldAddEventHandler = false;
  if (selectedId !== id) {
    shouldAddEventHandler = true;
  }

  const handleSelectVariant = () => {
    if (id === selectedId) {
      return;
    }
    selectVariant(id);
  };

  let variantStyles =
    selectedId === id ? styles.thumbnail_selected : styles.thumbnail;

  return (
    <MediaContainer
      image={thumbnail}
      alt={`${model || 'Product'} - ${color || 'Color variant'} thumbnail`}
      onClick={shouldAddEventHandler ? handleSelectVariant : undefined}
      containerClassName={styles.image_container}
      fillClassName={styles.image_fill}
      mediaClassName={variantStyles}
    />
  );
};

export default ProductColors;
