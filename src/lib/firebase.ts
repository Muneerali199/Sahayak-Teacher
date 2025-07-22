// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCXy9HjUwl8pctYmeHFSa53sv2V_OavHi8",
  authDomain: "sahayak-teacher-1hngi.firebaseapp.com",
  projectId: "sahayak-teacher-1hngi",
  storageBucket: "sahayak-teacher-1hngi.appspot.com",
  messagingSenderId: "295728684468",
  appId: "1:295728684468:web:7b62491b9ea1d5ad6366e1"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
