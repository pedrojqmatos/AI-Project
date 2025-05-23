// Importa o Firebase App e Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAy-2vXvlqLQoroMIKkjzj_qffQHmXNIH8",
  authDomain: "projeto-integrado-2-cf9f6.firebaseapp.com",
  projectId: "projeto-integrado-2-cf9f6",
  storageBucket: "projeto-integrado-2-cf9f6.firebasestorage.app",
  messagingSenderId: "326352930577",
  appId: "1:326352930577:web:5265ff8fe2e9f66cebaeb0",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos HTML
const emailInput = document.getElementById("email");
const resetButton = document.querySelector(".submit-button");

// Lidar com clique no botão
resetButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    alert("Por favor insira um email.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Um link para redefinir a senha foi enviado para o seu email.");
    
    // Redireciona para a página de confirmação
    window.location.href = "confirmar_reset.html";
    
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("Este email não está registrado.");
    } else if (error.code === "auth/invalid-email") {
      alert("Email inválido.");
    } else {
      alert("Erro ao enviar o link de redefinição: " + error.message);
    }
  }
});
