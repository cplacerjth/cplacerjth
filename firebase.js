import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2CON1KM45arVYvu8scs-6uRH8lIVRATA",
  authDomain: "cjplacerj.firebaseapp.com",
  projectId: "cjplacerj",
  storageBucket: "cjplacerj.firebasestorage.app",
  messagingSenderId: "213770199780",
  appId: "1:213770199780:web:b959ad70f2ec6c436682f1"
};

// Inicializa o Firebase (evita duplicar)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Mantém login mesmo fechando o navegador
setPersistence(auth, browserLocalPersistence);

export { auth, db, storage };
