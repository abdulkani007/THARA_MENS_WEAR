import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const productService = {
  async createProduct(productData) {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  async updateProduct(productId, productData) {
    await updateDoc(doc(db, 'products', productId), {
      ...productData,
      updatedAt: new Date()
    });
  },

  async deleteProduct(productId) {
    await deleteDoc(doc(db, 'products', productId));
  },

  async getProduct(productId) {
    const docSnap = await getDoc(doc(db, 'products', productId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getAllProducts() {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getLowStockProducts(threshold = 10) {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => {
        if (product.stockBySize) {
          const totalStock = Object.values(product.stockBySize).reduce((sum, stock) => sum + stock, 0);
          return totalStock < threshold;
        }
        return (product.stock || 0) < threshold;
      });
  },

  subscribeToProducts(callback) {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};
