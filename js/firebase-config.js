/* ============================================
   FIREBASE CONFIGURATION
   Replace the values below with your Firebase
   project settings from the Firebase Console:
   Project Settings → General → Your apps → SDK setup
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  var FIREBASE_CONFIG = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId:             "YOUR_APP_ID"
  };

  // Initialize Firebase only if the SDK loaded and config is filled in
  try {
    if (
      typeof firebase !== 'undefined' &&
      FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY'
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
