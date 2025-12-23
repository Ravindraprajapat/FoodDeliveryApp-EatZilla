// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{ getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyA_h4Flzgbqa6Wjz3J1E6TYCcOiQL1ABqg",
  authDomain: "eatzilla-4f39f.firebaseapp.com",
  projectId: "eatzilla-4f39f",
  storageBucket: "eatzilla-4f39f.firebasestorage.app",
  messagingSenderId: "952889451308",
  appId: "1:952889451308:web:5cd30778d298a86919c289"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app , auth}