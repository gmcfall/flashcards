// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5BWJymLd19zhHa41bpLdUuEmpYw6fkCk",
  authDomain: "lerniflash.firebaseapp.com",
  projectId: "lerniflash",
  storageBucket: "lerniflash.appspot.com",
  messagingSenderId: "23626517775",
  appId: "1:23626517775:web:dcbc2d8373a8eebc4d827a"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;

