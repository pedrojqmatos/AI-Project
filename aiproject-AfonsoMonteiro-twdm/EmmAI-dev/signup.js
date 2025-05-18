import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuRhmtdebLqLluIEX5kEqE5j_IGvNaWQY",
  authDomain: "emmai-4b26e.firebaseapp.com",
  projectId: "emmai-4b26e",
  storageBucket: "emmai-4b26e.firebasestorage.app",
  messagingSenderId: "1020422953738",
  appId: "1:1020422953738:web:ed10e3868d3b64af7538f3",
  measurementId: "G-FF19TKF6QP"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Signup successful:', user);
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Signup failed:', error);
        alert('Signup failed: ' + error.message);
    }
});
