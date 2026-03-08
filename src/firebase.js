import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAVZYSsSZCPKB4fqHMd-NVMd-qXLxoODrY",
  authDomain: "thara-e5576.firebaseapp.com",
  projectId: "thara-e5576",
  storageBucket: "thara-e5576.appspot.com",
  messagingSenderId: "596082366259",
  appId: "1:596082366259:web:e69a79cd4f822b9d991046"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
