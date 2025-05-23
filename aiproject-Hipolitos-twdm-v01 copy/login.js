import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAy-2vXvlqLQoroMIKkjzj_qffQHmXNIH8",
  authDomain: "projeto-integrado-2-cf9f6.firebaseapp.com",
  projectId: "projeto-integrado-2-cf9f6",
  storageBucket: "projeto-integrado-2-cf9f6.firebasestorage.app",
  messagingSenderId: "326352930577",
  appId: "1:326352930577:web:5265ff8fe2e9f66cebaeb0",
  measurementId: "G-KCBNSNMMBX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.querySelector('.btn-login');
  const googleBtn = document.querySelector('.google');
  const forgotLink = document.getElementById('forgot-password');

  // Login com email e senha
  loginBtn.addEventListener('click', function () {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Login realizado com sucesso:", userCredential.user);
        window.location.href = "pagina_inicial.html";
      })
      .catch((error) => {
        alert("Erro ao fazer login: " + error.message);
      });
  });

  // Login com Google
  googleBtn.addEventListener('click', function () {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Login com Google bem-sucedido:", result.user);
        window.location.href = "pagina_inicial.html";
      })
      .catch((error) => {
        alert("Erro ao fazer login com Google: " + error.message);
      });
  });

  // Link para recuperação de senha
  if (forgotLink) {
    forgotLink.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = 'reset.html';
    });
  }
});
