// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-8602d.firebaseapp.com",
  projectId: "interviewiq-8602d",
  storageBucket: "interviewiq-8602d.firebasestorage.app",
  messagingSenderId: "53721320074",
  appId: "1:53721320074:web:6ae70b0bb3d106e7f13b73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth enabled in app
const auth = getAuth(app)
// provide the conset screen
const provider = new GoogleAuthProvider()

export {auth, provider}