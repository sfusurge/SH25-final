// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1baz0Fm4EVYqboEoGnfvQwAouSxIGJXE",
    authDomain: "sh25-7c27d.firebaseapp.com",
    projectId: "sh25-7c27d",
    storageBucket: "sh25-7c27d.firebasestorage.app",
    messagingSenderId: "1072983159905",
    appId: "1:1072983159905:web:fe8bc601fab94070baa620"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


import { getFirestore } from "firebase/firestore/lite";

export const db = getFirestore(app);