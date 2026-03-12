import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // If document doesn't exist, set role based on email
            const role = user.email === 'thara@gmail.com' ? 'admin' : 'user';
            setUserRole(role);
          }
          
          // Track login in loginSessions collection
          try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sessionId = `${user.uid}_${today.getTime()}`;
            
            await setDoc(doc(db, 'loginSessions', sessionId), {
              uid: user.uid,
              email: user.email,
              loginTime: serverTimestamp(),
              date: today
            }, { merge: true });
          } catch (error) {
            console.error('Error tracking login:', error);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
