import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCwQRuN1emUBfgeo7uULXO8R3X-SxPMV1U",
  authDomain: "time-recording-87c3d.firebaseapp.com",
  projectId: "time-recording-87c3d",
  storageBucket: "time-recording-87c3d.firebasestorage.app",
  messagingSenderId: "491180700238",
  appId: "1:491180700238:web:3913e365de9d837011091f",
  measurementId: "G-0WBWTKFHJY",
  databaseURL: "https://time-recording-87c3d-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app);