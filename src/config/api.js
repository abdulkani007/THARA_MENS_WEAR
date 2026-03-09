// API Base URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';
export const API_URL = API_BASE_URL; // Alias for simpler usage

// API Endpoints
export const API_ENDPOINTS = {
  // Image endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GET_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_PRODUCT_IMAGES: (productId) => `${API_BASE_URL}/api/images/product/${productId}`,
  GET_ALL_IMAGES: `${API_BASE_URL}/api/images`,
  
  // Base API
  API: `${API_BASE_URL}/api`
};

export default API_BASE_URL;
