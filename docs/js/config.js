/* ============================================================
   MGCI DECA Training Leaderboard — configuration
   ------------------------------------------------------------
   This is the ONLY file you need to edit to go live.

   1. Create a Firebase project (see README.md).
   2. Paste your web app config object below in place of `null`.
   3. Deploy. While `firebase` is null the site runs in DEMO MODE
      (sample data stored only in the visitor's browser).
   ============================================================ */
window.LB_CONFIG = {
  chapterName: "MGCI DECA",

  // Paste the object from Firebase console → Project settings → Your apps → Web app.
  // Example:
  // firebase: {
  //   apiKey: "AIza...",
  //   authDomain: "mgci-deca.firebaseapp.com",
  //   projectId: "mgci-deca",
  //   storageBucket: "mgci-deca.appspot.com",
  //   messagingSenderId: "1234567890",
  //   appId: "1:1234567890:web:abc123"
  // },
  firebaseConfig = {
  apiKey: "AIzaSyCt0V_XHHYkL5R9LjNM2cnn_RbGUur6stw",
  authDomain: "mgci-deca.firebaseapp.com",
  projectId: "mgci-deca",
  storageBucket: "mgci-deca.firebasestorage.app",
  messagingSenderId: "293694710836",
  appId: "1:293694710836:web:d0da5ec81e27c60e4d9661"
},

  // Optional: only allow Google accounts from these email domains to sign in,
  // e.g. ["student.tdsb.on.ca", "tdsb.on.ca"]. Leave empty to allow any Google account
  // (new accounts still need exec approval unless you turn that off in Admin → Settings).
  allowedEmailDomains: [],

  // Force demo mode even when firebase is set (useful for testing). Normally false.
  forceDemo: false
};
