import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Evento para criar a conta
document.getElementById('create-account-btn').addEventListener('click', function() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Preencha todos os campos.");
    return;
  }

  // Criar conta com e-mail e senha
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Conta criada com sucesso
      console.log("Conta criada com sucesso:", userCredential.user);
      alert("Conta criada com sucesso! Agora, faça login.");
      
      // Redireciona para a página de login
      window.location.href = 'login.html';
    })
    .catch((error) => {
      alert("Erro ao criar conta: " + error.message);
    });
});
