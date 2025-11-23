import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder name in Cloudinary (default: 'product-images')
 * @returns {Promise<Object>} - Returns object with { id, name, src }
 */
export const uploadToCloudinary = async (file, folder = 'product-images') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      id: response.data.public_id, // Cloudinary's unique ID
      name: file.name,
      src: response.data.secure_url, // The image URL
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: Deleting requires authenticated request
    // For client-side, we'll need to call a backend endpoint
    // For now, we'll log it - you may need a backend API for deletion
    console.log('Image marked for deletion:', publicId);
    
    // Alternative: Images can be set to auto-delete in Cloudinary settings
    // Or you can manually delete from Cloudinary dashboard
    
    // If you want to implement deletion, you'll need:
    // 1. A backend API endpoint
    // 2. That endpoint uses Cloudinary admin SDK with api_key and api_secret
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};
