// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAK7c7mCqPZ5Khe3_fPUOsK15J2AMjbPlE",
  authDomain: "microplastics-analyzer.firebaseapp.com",
  projectId: "microplastics-analyzer",
  storageBucket: "microplastics-analyzer.firebasestorage.app",
  messagingSenderId: "467448753063",
  appId: "1:467448753063:web:b8307d5095899185892482",
  measurementId: "G-PCJT7SG0RW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics only in supported environments
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Export the services so they can be used in other files
export { auth, db, analytics };
export default app;