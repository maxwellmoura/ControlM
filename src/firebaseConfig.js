import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4FFT8icFSMbsebPrw2nkhC0zPcEMz928",
  authDomain: "controlm-b0989.firebaseapp.com",
  projectId: "controlm-b0989",
  storageBucket: "controlm-b0989.firebasestorage.app",
  messagingSenderId: "939089606546",
  appId: "1:939089606546:web:3e2a5728b1e2cf9f1f734b",
  measurementId: "G-XM8K2TYR6Y",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
