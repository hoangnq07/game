// ✅ Cấu hình Firebase (Thay bằng thông tin của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyBgBjiKtSO3YYkC-WSq3YqMRUZXl4ENQc4",
  authDomain: "caro-9574e.firebaseapp.com",
  projectId: "caro-9574e",
  storageBucket: "caro-9574e.firebasestorage.app",
  messagingSenderId: "998229232872",
  appId: "1:998229232872:web:74d89eb87a325accd9cd5d",
  measurementId: "G-J202X8QNV2",
};

// 🚀 Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
