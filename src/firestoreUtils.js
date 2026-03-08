import { collection, getDocs, doc, getDoc, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Safe fetch all documents from a collection
export const fetchCollection = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error.message);
    if (error.code === 'unavailable') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

// Safe fetch single document
export const fetchDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document:`, error.message);
    if (error.code === 'unavailable') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

// Safe query with where clause
export const fetchWithQuery = async (collectionName, field, operator, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error.message);
    if (error.code === 'unavailable') {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

// Safe add document
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document:`, error.message);
    throw error;
  }
};

// Safe update document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(db, collectionName, docId), data);
    return true;
  } catch (error) {
    console.error(`Error updating document:`, error.message);
    throw error;
  }
};

// Safe delete document
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error(`Error deleting document:`, error.message);
    throw error;
  }
};
