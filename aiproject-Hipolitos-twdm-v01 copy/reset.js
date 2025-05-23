import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  fetchSignInMethodsForEmail, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAy-2vXvlqLQoroMIKkjzj_qffQHmXNIH8",
  authDomain: "projeto-integrado-2-cf9f6.firebaseapp.com",
  projectId: "projeto-integrado-2-cf9f6",
  storageBucket: "projeto-integrado-2-cf9f6.firebasestorage.app",
  messagingSenderId: "326352930577",
  appId: "1:326352930577:web:5265ff8fe2e9f66cebaeb0",
  measurementId: "G-KCBNSNMMBX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-button");
  const emailInput = document.getElementById("email");

  submitBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      alert("Por favor, insira o seu email.");
      return;
    }

    try {
      console.log("Email para reset:", email);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Métodos de login encontrados:", methods); // DEBUG

      if (methods.length === 0) {
        alert("Este email não está registrado.");
        return;
      }

      // Se o email existe, independente do método de login, envia o email
      await sendPasswordResetEmail(auth, email);
      alert(`Um link para redefinir sua senha foi enviado para ${email}`);
      window.location.href = "login.html";

    } catch (error) {
      console.error("Erro ao buscar métodos ou enviar email:", error);
      alert("Erro ao enviar email de redefinição: " + error.message);
    }
  });
});
