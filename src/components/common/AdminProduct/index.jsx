import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { v4 as uuid } from 'uuid';

import { useAdmin } from 'hooks/useAdmin';

import ProductForm from './ProductForm';
import Variants from './Variants';

import { Button, Loader, CenterModal, ConfirmModal } from 'components/common';

import styles from './index.module.scss';

const AdminProduct = ({
  isEditPage,
  currentInventoryLevels,
  productId,
  productImages,
  productModel,
  productType,
  productCollection,
  productDescription,
  productDisplay,
  productChip,
  productCamera,
  productRam,
  productTruecamera,
  productFaceid,
  productBattery,
  productWeight,
  productTouchid,
  productBaseSku,
  productSizesInput,
  productTags,
  productVariants,
  productSizes,
}) => {
  const navigate = useNavigate();
  const [navigation, setNavigation] = useState(false);

  const {
    uploadFiles,
    deleteFile,
    createProduct,
    editProduct,
    deleteProduct,
    isLoading,
    error,
  } = useAdmin();

  const [images, setImages] = useState(productImages || []);
  const [pendingFiles, setPendingFiles] = useState([]); // File objects chưa upload

  const [productInput, setProductInput] = useState({
    model: productModel || '',
    type: productType || '',
    collection: productCollection || '',
    description: productDescription || '',
    display: productDisplay || '',
    chip: productChip || '',
    camera: productCamera || '',
    ram: productRam || '',
    truecamera: productTruecamera || '',
    faceid: productFaceid || '',
    battery: productBattery || '',
    weight: productWeight || '',
    touchid: productTouchid || '',

    tags: '',
    sku: productBaseSku || '',
    sizes: productSizesInput || {
      '64GB': false,
      '128GB': false,
      '256GB': false,
      '512GB': false,
      '1TB': false,
    },
  });

  const [tags, setTags] = useState(productTags || []);

  const [variants, setVariants] = useState(productVariants || []);

  const [sizes, setSizes] = useState(productSizes || []);

  const [isEditingVariants, setIsEditingVariants] = useState(false);
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    if (editCount === 0) {
      setIsEditingVariants(false);
    } else {
      setIsEditingVariants(true);
    }
  }, [editCount]);

  const [imagesMarkedForRemoval, setImagesMarkedForRemoval] = useState([]);

  const handleImagesInput = async (e) => {
    let inputFiles;

    e.dataTransfer
      ? (inputFiles = e.dataTransfer.files)
      : (inputFiles = e.target.files);

    if (inputFiles.length > 0) {
      // Tạo preview URLs tạm thời (chưa upload)
      const newPendingFiles = Array.from(inputFiles).map(file => ({
        file,
        name: file.name,
        src: URL.createObjectURL(file),
        id: `temp-${Date.now()}-${file.name}`,
        isPending: true
      }));
      
      setPendingFiles(prev => [...prev, ...newPendingFiles]);
      setImages(prev => [...prev, ...newPendingFiles]);
    }
  };

  const handleDeleteImage = (fileName) => {
    const imageToDelete = images.find((image) => image.name === fileName);
    const updatedImages = images.filter((image) => image.name !== fileName);

    // Nếu là ảnh pending (chưa upload), chỉ xóa khỏi state
    if (imageToDelete?.isPending) {
      setPendingFiles(prev => prev.filter(f => f.name !== fileName));
      // Revoke object URL để tránh memory leak
      URL.revokeObjectURL(imageToDelete.src);
    } else {
      // Nếu là ảnh đã upload, xử lý như cũ
      if (!isEditPage) {
        deleteFile('product-images', imageToDelete);
      } else {
        const updatedImagesMarkedForRemoval = [...imagesMarkedForRemoval];
        updatedImagesMarkedForRemoval.push(imageToDelete);
        setImagesMarkedForRemoval(updatedImagesMarkedForRemoval);
      }
    }

    const updatedVariants = [...variants];
    for (const variant of updatedVariants) {
      variant.images = variant.images.filter((image) => image.name !== fileName);
    }

    setImages(updatedImages);
    setVariants(updatedVariants);
  };

  const handleModelInput = (e) => {
    setProductInput((prevState) => ({ ...prevState, model: e.target.value }));
  };

  const handleTypeInput = (e) => {
    setProductInput((prevState) => ({ ...prevState, type: e.target.value }));
  };

  const handleCollectionInput = (e) => {
    setProductInput((prevState) => ({
      ...prevState,
      collection: e.target.value,
    }));
  };

  const handleDescriptionInput = (e) => {
    setProductInput((prevState) => ({
      ...prevState,
      description: e.target.value,
    }));
  };

  const handleTagsInput = (e) => {
    setProductInput((prevState) => ({ ...prevState, tags: e.target.value }));

    if (e.key === ',') {
      const checkForExistingTag = tags.find(
        (tag) => tag.content === e.target.value
      );

      if (checkForExistingTag) {
        return;
      }

      const updatedTags = tags;
      updatedTags.push({ content: e.target.value.split(',')[0].toLowerCase() });
      setTags(updatedTags);
      setProductInput((prevState) => ({ ...prevState, tags: '' }));
    }
  };

  const handleDeleteTags = (tagContent) => {
    const updatedTags = tags.filter((tag) => tag.content !== tagContent);
    setTags(updatedTags);
  };

  const handleSkuInput = (e) => {
    setProductInput((prevState) => ({
      ...prevState,
      sku: e.target.value,
    }));
  };

  const handleSizesInput = (e) => {
    const updatedSizesInput = { ...productInput.sizes };

    updatedSizesInput[e.target.value] = e.target.checked;

    const updatedSizes = Object.keys(updatedSizesInput).filter(
      (key) => updatedSizesInput[key]
    );

    setSizes(updatedSizes);
    setProductInput((prevState) => ({
      ...prevState,
      sizes: updatedSizesInput,
    }));
  };

  const handleAddVariant = () => {
    const updatedVariants = [...variants];

    updatedVariants.push({
      id: uuid(),
      color: '',
      colorDisplay: '',
      currentPrice: 0,
      actualPrice: 0,
      images: [],
      inventory: { s: 0, m: 0, l: 0, xl: 0, xxl: 0 },
    });

    setVariants(updatedVariants);
  };

  const handleEditVariantCount = (num) => {
    setEditCount((prevState) => prevState + num);
  };

  const handleDeleteVariant = (index) => {
    const updatedVariants = [...variants];

    updatedVariants.splice(index, 1);

    setVariants(updatedVariants);
  };

  const handleVariantEditSubmit = ({ variantIndex, ...updatedVariant }) => {
    const updatedVariants = [...variants];

    updatedVariants[variantIndex] = updatedVariant;

    setVariants(updatedVariants);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔵 Starting product submit...');
    console.log('Pending files:', pendingFiles.length);
    console.log('Images:', images.length);
    console.log('Variants:', variants.length);
    
    let finalImages = [];
    
    // Tách ảnh đã upload và ảnh pending
    const uploadedImages = images.filter(img => !img.isPending);
    const pendingImages = images.filter(img => img.isPending);
    
    console.log('Already uploaded:', uploadedImages.length);
    console.log('Need to upload:', pendingImages.length);
    
    // Giữ lại ảnh đã upload
    finalImages = [...uploadedImages];
    
    // Upload ảnh pending nếu có
    if (pendingImages.length > 0) {
      console.log('⏳ Uploading pending files...');
      const newlyUploadedImages = await uploadFiles('product-images', {
        currentFiles: uploadedImages,
        newFiles: pendingImages.map(img => img.file),
      });
      
      console.log('✅ Upload complete');
      
      // Revoke object URLs
      pendingImages.forEach(img => URL.revokeObjectURL(img.src));
      
      // Cập nhật finalImages với kết quả upload mới
      finalImages = newlyUploadedImages;
      setPendingFiles([]);
      setImages(newlyUploadedImages);
    }
    
    console.log('Final images:', finalImages.length);
    console.log('Final images details:', finalImages);
    console.log('Variants details:', variants.map(v => ({
      color: v.color,
      images: v.images,
      imageNames: v.images?.map(img => img.name)
    })));
    
    let productData = { ...productInput };
    productData.sizes = sizes;
    productData.tags = tags;

    if (isEditPage) {
      productData.id = productId;
      console.log('📝 Editing product...');
      await editProduct({
        productData,
        variants,
        currentInventoryLevels,
        images: finalImages,
        imagesMarkedForRemoval,
      });
    } else {
      console.log('➕ Creating product...');
      await createProduct({ productData, variants, images: finalImages });
    }

    console.log('✅ Product submit complete!');
    setNavigation(true);
  };

  useEffect(() => {
    if (navigation && !error) {
      navigate('/admin/products');
    } else {
      setNavigation(false);
    }
  }, [navigation]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteOnConfirm = async () => {
    setIsConfirmOpen(false);
    await deleteProduct(productId);
    setNavigation(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
  };

  const createButtonIsDisabled =
    isEditingVariants || sizes.length === 0 || variants.length === 0;

  let createButtonContent;

  if (isEditingVariants) {
    createButtonContent = `Editing...`;
  } else if (sizes.length === 0) {
    createButtonContent = `No sizes selected`;
  } else if (variants.length === 0) {
    createButtonContent = `No variants selected`;
  } else {
    if (isEditPage) {
      createButtonContent = `Update`;
    } else {
      createButtonContent = `Create`;
    }
  }

  return (
    <>
      {isConfirmOpen && (
        <ConfirmModal
          show={isConfirmOpen}
          close={closeConfirm}
          handleConfirm={handleDeleteOnConfirm}
          text="Are you sure you want to delete this product? There is no way to undo this."
        />
      )}
      {isLoading && <Loader />}
      <section>
        <div className={`${styles.container} main-container`}>
          <h1>{isEditPage ? 'Edit' : 'Add'} Product</h1>
          <ProductForm
            isEditPage={isEditPage}
            productInput={productInput}
            images={images}
            tags={tags}
            handleImagesInput={handleImagesInput}
            handleDeleteImage={handleDeleteImage}
            handleModelInput={handleModelInput}
            handleTypeInput={handleTypeInput}
            handleCollectionInput={handleCollectionInput}
            handleDescriptionInput={handleDescriptionInput}
            handleTagsInput={handleTagsInput}
            handleDeleteTags={handleDeleteTags}
            handleSkuInput={handleSkuInput}
            handleSizesInput={handleSizesInput}
            handleProductSubmit={handleProductSubmit}
          />
          <Variants
            productInput={productInput}
            variants={variants}
            sizes={sizes}
            images={images}
            handleAddVariant={handleAddVariant}
            handleEditVariantCount={handleEditVariantCount}
            handleDeleteVariant={handleDeleteVariant}
            handleVariantEditSubmit={handleVariantEditSubmit}
          />
          <div className={styles.buttons_wrapper}>
            <Button
              type="submit"
              form="productForm"
              disabled={createButtonIsDisabled}
              className={styles.submit}
            >
              {createButtonContent}
            </Button>
            {isEditPage && (
              <Button
                onClick={() => setIsConfirmOpen(true)}
                type="button"
                className={styles.delete}
              >
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminProduct;
