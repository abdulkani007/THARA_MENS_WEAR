import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const uploadImageToMongoDB = async (file, productId, productName = 'Product', fileName = null) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);
  formData.append('productName', productName);
  formData.append('fileName', fileName || file.name);

  const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.imageUrl;
};

export const deleteImageFromMongoDB = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('/api/images/')) {
      return;
    }
    const imageId = imageUrl.split('/').pop();
    await axios.delete(API_ENDPOINTS.DELETE_IMAGE(imageId));
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const deleteProductImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls
      .filter(url => url && url.includes('/api/images/'))
      .map(url => deleteImageFromMongoDB(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting images:', error);
  }
};

export const getAllImages = async () => {
  const response = await axios.get(API_ENDPOINTS.GET_ALL_IMAGES);
  return response.data.images;
};
