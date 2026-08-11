import { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, 'usuarios', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({ 
              tipo: 'cliente',
              nome: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário'
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          setUserData({ tipo: 'cliente' });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isVendedor = userData?.tipo === 'vendedor' || userData?.tipo === 'admin';
  const isAdmin = userData?.tipo === 'admin';
  const isVendedorAprovado = userData?.aprovado === true || userData?.tipo === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      logout,
      isVendedor,
      isAdmin,
      isVendedorAprovado
    }}>
      {children}
    </AuthContext.Provider>
  );
}
