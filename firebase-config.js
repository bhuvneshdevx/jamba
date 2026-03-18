/* =============================================
   Firebase Configuration
   
   SETUP CHECKLIST:
   ✅ Project created
   ☐ Firestore Database → Create database → Start in test mode
   ☐ Authentication → Sign-in method → Enable Email/Password
   ☐ Authentication → Users → Add user (your admin email + password)
   ============================================= */

const firebaseConfig = {
    apiKey: "AIzaSyADFUUODy6XCqoKlqGnj24wWrtM5yQEWrc",
    authDomain: "crafty-sanctum-456403-f1.firebaseapp.com",
    projectId: "crafty-sanctum-456403-f1",
    storageBucket: "crafty-sanctum-456403-f1.firebasestorage.app",
    messagingSenderId: "433960708981",
    appId: "1:433960708981:web:441388d0000534d547813c",
    measurementId: "G-C3JR989K1F"
};

// Initialize Firebase (compat SDK — used via script tags)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
