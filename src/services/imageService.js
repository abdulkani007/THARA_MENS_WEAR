import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadImageToMongoDB = async (file, productId, productName = 'Product', fileName = null) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);
  formData.append('productName', productName);
  formData.append('fileName', fileName || file.name);

  const response = await axios.post(`${API_URL}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.imageUrl;
};

export const deleteImageFromMongoDB = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('/api/images/')) {
      return; // Skip if not a MongoDB image URL
    }
    const imageId = imageUrl.split('/').pop();
    await axios.delete(`${API_URL}/images/${imageId}`);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error, just log it
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
  const response = await axios.get(`${API_URL}/images`);
  return response.data.images;
};
