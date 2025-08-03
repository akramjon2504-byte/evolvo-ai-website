// Sizning Firebase proyekt sozlamalaringiz
const firebaseConfig = {
  apiKey: "AIzaSyBWS7CQ5GOsBgD4E4RwtHWY-DWgOO2ZTk4",
  authDomain: "evolvo-ai-blog.firebaseapp.com",
  projectId: "evolvo-ai-blog",
  storageBucket: "evolvo-ai-blog.firebasestorage.app",
  messagingSenderId: "197902689490",
  appId: "1:197902689490:web:53a4f76b4daa191d33f90b",
  measurementId: "G-PHS4FNE89P"
};

// Firebase'ni ishga tushirish
firebase.initializeApp(firebaseConfig);

// Firestore ma'lumotlar bazasiga ulanish va uni global 'db' o'zgaruvchisiga saqlash
// Bu qator xatolikni to'g'rilaydi
const db = firebase.firestore();
