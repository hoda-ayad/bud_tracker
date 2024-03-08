import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { BrowserRouter } from 'react-router-dom'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgSR0jOYVKFLJYrLBsbAjx6E7-UHmwmuk",
  authDomain: "house-budget-tracker.firebaseapp.com",
  projectId: "house-budget-tracker",
  storageBucket: "house-budget-tracker.appspot.com",
  messagingSenderId: "836964863779",
  appId: "1:836964863779:web:fb5bc7a5eaaed021298696"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <BrowserRouter> <App /> </BrowserRouter>
  </React.StrictMode>
);

