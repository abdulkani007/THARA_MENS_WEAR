import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export const deleteImageFromStorage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('firebase')) return;
    
    const urlParts = imageUrl.split('/o/')[1];
    if (!urlParts) return;
    
    const imagePath = decodeURIComponent(urlParts.split('?')[0]);
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const deleteProductImages = async (images) => {
  if (!images || !Array.isArray(images)) return;
  
  const deletePromises = images.map(imageUrl => deleteImageFromStorage(imageUrl));
  await Promise.all(deletePromises);
};
