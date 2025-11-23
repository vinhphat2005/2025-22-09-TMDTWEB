import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useCollection } from 'hooks/useCollection';
import { useAdmin } from 'hooks/useAdmin';

import { Loader, ConfirmModal, ProductCard, Button } from 'components/common';

import styles from './index.module.scss';

const AdminCollections = () => {
  const { getCollection } = useCollection();
  const { deleteVariant, isLoading } = useAdmin();

  const [variants, setVariants] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [productToBeDeleted, setProductToBeDeleted] = useState(null);

  useEffect(() => {
    if (!variants) {
      const fetchVariants = async () => {
        console.log('🔵 Fetching variants...');
        const fetchedVariants = await getCollection({
          collectionName: 'products',
          isNewQuery: true,
        });
        console.log('✅ Fetched variants:', fetchedVariants);
        setVariants(fetchedVariants);
      };

      fetchVariants();
    }
  }, [variants]);

  const handleDeleteStart = ({ productId, variantId }) => {
    setProductToBeDeleted({ productId, variantId });
    setIsConfirmOpen(true);
  };

  const handleDeleteOnConfirm = async () => {
    setIsConfirmOpen(false);
    await deleteVariant(productToBeDeleted);

    setVariants(null);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setProductToBeDeleted(null);
  };

  // Agregar filter de categorias para admin
  useEffect(() => { }, []);

  return (
    <>
      {isConfirmOpen && (
        <ConfirmModal
          show={isConfirmOpen}
          close={closeConfirm}
          handleConfirm={handleDeleteOnConfirm}
          text="Are you sure you want to delete this variant? If product only has this variant, the whole product will be deleted."
        />
      )}
      {(!variants || isLoading) && <Loader />}
      {variants && (
        <section>
          <div className={`${styles.container} main-container`}>
            <h1>Admin Products/Variants</h1>
            <div className={styles.products_wrapper}>
              {variants.map((variant) => (
                <div key={variant.variantId} style={{ position: 'relative' }}>
                  <ProductCard
                    variantId={variant.variantId}
                    productId={variant.productId}
                    model={variant.model}
                    color={variant.color}
                    colorDisplay={variant.colorDisplay}
                    currentPrice={variant.price}
                    actualPrice={variant.actualPrice}
                    type={variant.type}
                    slug={variant.slug}
                    slides={variant.slides || []}
                    skus={variant.skus || []}
                    allVariants={variant.allVariants || [variant]}
                    discount={variant.discount}
                    isSoldOut={variant.isSoldOut}
                    numberOfVariants={variant.numberOfVariants}
                  />
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginTop: '10px',
                    justifyContent: 'center'
                  }}>
                    <Link to={`/admin/products/${variant.productId}`}>
                      <Button style={{ 
                        padding: '8px 24px',
                        backgroundColor: '#3d3d3d',
                        color: 'white',
                        borderRadius: '6px'
                      }}>
                        Edit Product
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleDeleteStart({
                        productId: variant.productId,
                        variantId: variant.variantId
                      })}
                      style={{ 
                        padding: '8px 24px',
                        backgroundColor: 'rgba(243, 121, 120, 0.95)',
                        color: 'white',
                        borderRadius: '6px'
                      }}
                    >
                      Delete Variant
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AdminCollections;
