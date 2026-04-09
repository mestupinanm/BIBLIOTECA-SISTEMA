/*
============================================
   FIREBASE CONFIGURATION
   Replace the values below with your Firebase
   project settings from the Firebase Console:
   Project Settings → General → Your apps → SDK setup
   ============================================ */

   import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyAgItkcGcWUfo6CvWpfmwfLrOsbQvyupcs",
    authDomain: "biblioteca-tesis.firebaseapp.com",
    projectId: "biblioteca-tesis",
    storageBucket: "biblioteca-tesis.firebasestorage.app",
    messagingSenderId: "627478601379",
    appId: "1:627478601379:web:e519069a769447cb756916",
    measurementId: "G-ERT36679VX"
  };

  // Initialize Firebase only if the SDK loaded and config is filled in
  try {
    if (
      typeof firebase !== 'undefined' &&
      FIREBASE_CONFIG.apiKey !== "AIzaSyAgItkcGcWUfo6CvWpfmwfLrOsbQvyupcs"
    ) {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      PepperLib.FirebaseDB = firebase.firestore();
    }
  } catch (e) {
    // Firebase unavailable (offline or not configured) — analytics will
    // fall back to localStorage automatically.
    console.warn('Firebase init failed:', e);
  }
})();
