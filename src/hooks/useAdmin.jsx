import { useState } from 'react';

import { v4 as uuid } from 'uuid';

import {
  writeBatch,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
} from 'firebase/firestore';

import { db } from 'db/config';
import { uploadToCloudinary, deleteFromCloudinary } from 'helpers/cloudinary';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const skuSizeCode = {
    // Clothing sizes
    s: 'sm',
    m: 'md',
    l: 'lg',
    xl: 'xl',
    xxl: 'xx',
    // Storage sizes
    '64GB': '64',
    '128GB': '128',
    '256GB': '256',
    '512GB': '512',
    '1TB': '1TB',
  };

  const uploadFiles = async (directory, { currentFiles, newFiles }) => {
    setError(null);
    try {
      const updatedFiles = [...currentFiles];

      for (const newFile of newFiles) {
        const isImage = !!newFile.type.match(`image.*`);

        if (isImage) {
          const checkForExistingImage = currentFiles.find(
            (image) => image.name === newFile.name
          );

          if (!checkForExistingImage) {
            // Upload to Cloudinary
            const uploadedImage = await uploadToCloudinary(newFile, directory);
            updatedFiles.push(uploadedImage);
          }
        }
      }

      return updatedFiles;
    } catch (err) {
      setError(err);
    }
  };

  const deleteFile = async (directory, file) => {
    try {
      // Delete from Cloudinary using public_id
      await deleteFromCloudinary(file.id);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const getProduct = async (productId) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔍 Getting product:', productId);
      
      const productRef = doc(db, 'products', productId);
      const docSnap = await getDoc(productRef);

      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      const product = { id: docSnap.id, ...docSnap.data() };

      console.log('📄 Product data:', product);

      // Fetch variants from subcollection
      const variantsRef = collection(productRef, 'variants');
      const variantsSnapshot = await getDocs(variantsRef);
      
      const variants = [];
      variantsSnapshot.forEach((doc) => {
        variants.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📦 Fetched ${variants.length} variants from subcollection`);

      product.variants = variants;

      let images = [];

      for (const variant of product.variants) {
        images = [...images, ...variant.images];
      }

      console.log('📸 Total images:', images.length);

      let inventory = [];

      const inventoryRef = collection(db, 'inventory');

      const qInv = query(inventoryRef, where('productId', '==', product.id));
      const inventorySnapshot = await getDocs(qInv);

      inventorySnapshot.forEach((doc) => {
        inventory.push({ id: doc.id, ...doc.data() });
      });

      console.log('📊 Inventory items:', inventory.length);

      const currentInventoryLevels = [];

      for (let i = 0; i < product.variants.length; i++) {
        let variantInventory = {};
        for (const item of product.variants[i].inventoryLevels) {
          const skuInventoryLevel = inventory.find(
            (sku) => sku.id === item.sku
          );

          const value = skuInventoryLevel.value;
          const stock = skuInventoryLevel.stock;

          variantInventory = { ...variantInventory, [value]: stock };
          currentInventoryLevels.push({ ...item, ...skuInventoryLevel });
        }

        product.variants[i].inventory = variantInventory;
        delete product.variants[i].inventoryLevels;
      }

      // Dynamic sizes detection from inventory
      const allSizes = [...new Set(inventory.map(item => item.value))];
      
      const sizesInput = {
        s: false,
        m: false,
        l: false,
        xl: false,
        xxl: false,
        '64GB': false,
        '128GB': false,
        '256GB': false,
        '512GB': false,
        '1TB': false,
      };

      const selectedSizes = Object.keys(product.variants[0].inventory);

      for (const value of selectedSizes) {
        sizesInput[value] = true;
      }

      product.images = images;
      product.sizesInput = sizesInput;
      product.sizes = selectedSizes;
      product.currentInventoryLevels = currentInventoryLevels;
      product.baseSku = currentInventoryLevels[0].id.split('-')[0];

      console.log('✅ Product fetched successfully:', {
        id: product.id,
        model: product.model,
        variantCount: product.variants.length,
        imageCount: images.length
      });

      setIsLoading(false);

      return product;
    } catch (err) {
      console.error('❌ Error getting product:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const createProduct = async ({ productData, variants, images }) => {
    setError(null);
    setIsLoading(true);

    try {
      const formattedModel = productData.model
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const formattedType = productData.type
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const formattedDescription = productData.description
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const {
        sku: productBaseSku,
        sizes: selectedSizes,
        ...productProps
      } = productData;

      const productId = uuid();

      let product = {
        ...productProps,
        model: formattedModel,
        type: formattedType,
        description: formattedDescription,
        variantSlugs: [],
        variants: [],
        createdAt: new Date().toISOString(),
        price: 0, // Will be updated from first variant
      };

      let currentImagesInUse = [];

      const batch = writeBatch(db);

      for (let variant of variants) {
        // Map variant.images để chỉ lấy uploaded images (không có File object)
        const variantUploadedImages = variant.images
          ?.map(imgRef => {
            // Tìm image đã upload trong finalImages array
            return images.find(img => img.name === imgRef.name);
          })
          .filter(img => img && !img.file && !img.isPending); // Loại bỏ pending/File objects

        currentImagesInUse = [...currentImagesInUse, ...variantUploadedImages];

        let variantSlug = `${product.type} ${product.model}`;
        if (variant.colorDisplay) {
          variantSlug += ` ${variant.colorDisplay}`;
        } else {
          variantSlug += ` ${variant.color}`;
        }

        const formattedVariantSlug = variantSlug
          .replaceAll(' ', '-')
          .toLowerCase();

        product.variantSlugs.push(formattedVariantSlug);

        const colorSplit = variant.color.split(' ');
        let skuColor;

        if (colorSplit.length > 1) {
          skuColor = colorSplit[0].substr(0, 1) + colorSplit[1].substr(0, 2);
        } else {
          skuColor = variant.color.substr(0, 3);
        }

        const { inventory: variantInventory, images: variantImages, ...variantContent } = variant;

        variantContent.slug = formattedVariantSlug;
        
        // Use uploaded images (without File objects)
        variantContent.images = variantUploadedImages;

        variantContent.inventoryLevels = [];

        for (const size of selectedSizes) {
          const sku =
            `${productBaseSku}-${skuColor}-${skuSizeCode[size]}`.toUpperCase();

          variantContent.inventoryLevels.push({ sku });

          const skuInventory = {
            productId,
            stock: variantInventory[size] || 0,
            value: size,
          };

          const skuInventoryRef = doc(db, 'inventory', sku);

          batch.set(skuInventoryRef, skuInventory);
        }
        product.variants.push(variantContent);
      }

      // Set product price và slug
      if (product.variants.length > 0) {
        product.price = product.variants[0].actualPrice || product.variants[0].variantPrice || 0;
      }
      product.slug = `${product.type} ${product.model}`.replaceAll(' ', '-').toLowerCase();

      const currentImagesInUseNames = currentImagesInUse.map(
        (image) => image.name
      );

      console.log('📸 Images in use by variants:', currentImagesInUseNames);
      console.log('📸 Total images uploaded:', images.map(i => i.name));

      const imagesToBeDeleted = images.filter(
        (image) => !currentImagesInUseNames.includes(image.name)
      );

      console.log('🗑️ Images to delete:', imagesToBeDeleted.map(i => i.name));

      if (imagesToBeDeleted.length > 0) {
        console.warn('⚠️ Deleting unused images. Make sure variants have images assigned!');
        for (const image of imagesToBeDeleted) {
          await deleteFromCloudinary(image.id);
        }
      }

      await batch.commit();

      console.log('✅ Batch commit successful (inventory saved)');

      const productRef = doc(db, 'products', productId);

      // Extract variants to save separately
      const productVariants = [...product.variants];
      delete product.variants; // Remove from product object

      console.log('💾 Saving product to Firestore:', {
        productId,
        collection: product.collection,
        model: product.model,
        variantCount: productVariants.length
      });

      console.log('📄 Full product object:', product);

      await setDoc(productRef, product);

      console.log('✅ Product saved successfully to Firestore!');

      // Save variants to subcollection
      console.log('💾 Saving variants to subcollection...');
      for (const variant of productVariants) {
        const variantRef = doc(productRef, 'variants', variant.id);
        const { id, ...variantData } = variant; // Remove id from data
        
        // Convert variantPrice structure
        const variantToSave = {
          ...variantData,
          variantPrice: variantData.currentPrice,
        };
        delete variantToSave.currentPrice;
        delete variantToSave.actualPrice; // actualPrice is in product level
        
        await setDoc(variantRef, variantToSave);
        console.log(`  ✅ Saved variant: ${variant.color}`);
      }

      console.log('✅ All variants saved to subcollection!');

      // Save SKUs to subcollection
      console.log('💾 Saving SKUs to subcollection...');
      for (const variant of productVariants) {
        let skuOrder = 1;
        for (const inventoryLevel of variant.inventoryLevels) {
          const skuRef = doc(productRef, 'skus', inventoryLevel.sku);
          
          // Get inventory stock from inventory collection
          const inventoryRef = doc(db, 'inventory', inventoryLevel.sku);
          const inventorySnap = await getDoc(inventoryRef);
          const stock = inventorySnap.exists() ? inventorySnap.data().stock : 0;
          const size = inventorySnap.exists() ? inventorySnap.data().value : '';
          
          const skuData = {
            order: skuOrder++,
            quantity: stock,
            size: size,
            variantId: variant.id,
          };
          
          await setDoc(skuRef, skuData);
        }
      }
      
      console.log('✅ All SKUs saved to subcollection!');

      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error creating product:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(err);
      setIsLoading(false);
    }
  };

  const editProduct = async ({
    productData,
    variants,
    currentInventoryLevels,
    images,
    imagesMarkedForRemoval,
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      for (const image of imagesMarkedForRemoval) {
        await deleteFromCloudinary(image.id);
      }

      const formattedModel = productData.model
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const formattedType = productData.type
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const formattedDescription = productData.description
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const {
        sku: productBaseSku,
        sizes: selectedSizes,
        ...productProps
      } = productData;

      let product = {
        ...productProps,
        model: formattedModel,
        type: formattedType,
        description: formattedDescription,
        variantSlugs: [],
        variants: [],
      };

      let currentImagesInUse = [];

      const currentProductSkus = currentInventoryLevels.map(
        (variant) => variant.sku
      );
      const newProductSkus = [];

      const batch = writeBatch(db);

      for (let variant of variants) {
        currentImagesInUse = [...currentImagesInUse, ...variant.images];

        let variantSlug = `${product.type} ${product.model}`;
        if (variant.colorDisplay) {
          variantSlug += ` ${variant.colorDisplay}`;
        } else {
          variantSlug += ` ${variant.color}`;
        }

        const formattedVariantSlug = variantSlug
          .replaceAll(' ', '-')
          .toLowerCase();

        product.variantSlugs.push(formattedVariantSlug);

        const colorSplit = variant.color.split(' ');
        let skuColor;

        if (colorSplit.length > 1) {
          skuColor = colorSplit[0].substr(0, 1) + colorSplit[1].substr(0, 2);
        } else {
          skuColor = variant.color.substr(0, 3);
        }

        const { inventory: variantInventory, ...variantContent } = variant;

        variantContent.slug = formattedVariantSlug;

        variantContent.inventoryLevels = [];

        for (const size of selectedSizes) {
          const sku =
            `${productBaseSku}-${skuColor}-${skuSizeCode[size]}`.toUpperCase();

          variantContent.inventoryLevels.push({ sku });
          newProductSkus.push(sku);

          const skuInventory = {
            productId: product.id,
            stock: variantInventory[size] || 0,
            value: size,
          };

          const skuInventoryRef = doc(db, 'inventory', sku);

          batch.set(skuInventoryRef, skuInventory);
        }
        product.variants.push(variantContent);
      }

      const currentImagesInUseNames = currentImagesInUse.map(
        (image) => image.name
      );

      const imagesToBeDeleted = images.filter(
        (image) => !currentImagesInUseNames.includes(image.name)
      );

      if (imagesToBeDeleted.length > 0) {
        for (const image of imagesToBeDeleted) {
          await deleteFromCloudinary(image.id);
        }
      }

      const skusToBeDeleted = currentProductSkus.filter(
        (sku) => !newProductSkus.includes(sku)
      );

      if (skusToBeDeleted.length > 0) {
        for (const sku of skusToBeDeleted) {
          const skuInventoryRef = doc(db, 'inventory', sku);
          batch.delete(skuInventoryRef);
        }
      }

      await batch.commit();

      const productRef = doc(db, 'products', product.id);

      await setDoc(productRef, product);
    } catch (err) {
      console.error(err);
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteVariant = async ({ productId, variantId }) => {
    setError(null);
    setIsLoading(true);

    try {
      const productRef = doc(db, 'products', productId);

      const docSnap = await getDoc(productRef);

      let product = { id: docSnap.id, ...docSnap.data() };

      const variantToBeDeleted = product.variants.find(
        (variant) => variant.id === variantId
      );

      for (const image of variantToBeDeleted.images) {
        await deleteFromCloudinary(image.id);
      }

      const batch = writeBatch(db);

      for (const item of variantToBeDeleted.inventoryLevels) {
        const skuInventoryRef = doc(db, 'inventory', item.sku);

        batch.delete(skuInventoryRef);
      }
      await batch.commit();

      const updatedVariants = product.variants.filter(
        (variant) => variant.id !== variantId
      );

      product.variants = [...updatedVariants];

      if (product.variants.length > 0) {
        await setDoc(productRef, product);
      } else {
        await deleteDoc(productRef);
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('🗑️ Deleting product:', productId);
      
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error('Product not found');
      }

      const batch = writeBatch(db);

      // 1. Get all variants from subcollection
      const variantsRef = collection(productRef, 'variants');
      const variantsSnap = await getDocs(variantsRef);
      
      console.log(`  📦 Found ${variantsSnap.size} variants`);

      // 2. Delete images from Cloudinary
      for (const variantDoc of variantsSnap.docs) {
        const variant = variantDoc.data();
        if (variant.images && variant.images.length > 0) {
          for (const image of variant.images) {
            console.log(`  🖼️ Deleting image: ${image.name}`);
            await deleteFromCloudinary(image.id);
          }
        }
        // Delete variant document
        batch.delete(variantDoc.ref);
      }

      // 3. Delete all SKUs from subcollection
      const skusRef = collection(productRef, 'skus');
      const skusSnap = await getDocs(skusRef);
      
      console.log(`  📦 Found ${skusSnap.size} SKUs`);

      for (const skuDoc of skusSnap.docs) {
        // Delete from inventory collection
        const inventoryRef = doc(db, 'inventory', skuDoc.id);
        batch.delete(inventoryRef);
        
        // Delete SKU document
        batch.delete(skuDoc.ref);
      }

      // 4. Commit batch deletions
      await batch.commit();
      console.log('  ✅ Batch deletions committed');

      // 5. Delete product document
      await deleteDoc(productRef);
      console.log('  ✅ Product document deleted');

      console.log('✅ Product deleted successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  return {
    uploadFiles,
    deleteFile,
    createProduct,
    editProduct,
    deleteVariant,
    deleteProduct,
    getProduct,
    isLoading,
    error,
  };
};
