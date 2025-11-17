// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRTdA3zCDTR37xbOwCN-tvf-nV7yjpgxY",
  authDomain: "this-c69dd.firebaseapp.com",
  projectId: "this-c69dd",
  storageBucket: "this-c69dd.firebasestorage.app",
  messagingSenderId: "578902730382",
  appId: "1:578902730382:web:e9d9c5e579e174ff318bdf",
  measurementId: "G-P6NWRNMQX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);