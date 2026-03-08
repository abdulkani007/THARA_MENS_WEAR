import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadImageToMongoDB = async (file, productId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);

  const response = await axios.post(`${API_URL}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.imageUrl;
};

export const deleteImageFromMongoDB = async (imageUrl) => {
  const imageId = imageUrl.split('/').pop();
  await axios.delete(`${API_URL}/images/${imageId}`);
};

export const deleteProductImages = async (imageUrls) => {
  const deletePromises = imageUrls.map(url => deleteImageFromMongoDB(url));
  await Promise.all(deletePromises);
};
