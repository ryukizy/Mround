import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'operator' | 'supervisor'
  const [loading, setLoading] = useState(true);

  // Login function
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get or create user document with role
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // First time login - create user doc (you can customize this logic)
        // For demo: default to 'operator'. In production, use Firebase Admin or custom claims
        await setDoc(userDocRef, {
          email: user.email,
          role: 'operator', // Change manually in Firestore for supervisors
          displayName: user.email.split('@')[0],
          createdAt: new Date().toISOString()
        });
        setUserRole('operator');
      } else {
        setUserRole(userDoc.data().role || 'operator');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'operator');
          } else {
            setUserRole('operator');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('operator');
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
    login,
    logout,
    loading,
    isSupervisor: userRole === 'supervisor'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
