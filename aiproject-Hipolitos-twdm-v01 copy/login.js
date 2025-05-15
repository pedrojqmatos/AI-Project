import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.querySelector('.btn-login');
  const googleBtn = document.querySelector('.google');
  const forgotLink = document.getElementById('forgot-password');

  // Inicializa o Firebase Authentication
  const auth = getAuth();

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
        console.log("Login realizado:", userCredential.user);
        window.location.href = "dashboard.html"; // Redireciona para o painel
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
        console.log("Login realizado com Google:", result.user);
        window.location.href = "dashboard.html"; // Redireciona para o painel
      })
      .catch((error) => {
        alert("Erro ao fazer login com Google: " + error.message);
      });
  });

  // Link para recuperação de senha
  if (forgotLink) {
    forgotLink.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = 'reset.html'; // Redireciona para página de reset de senha
    });
  }
});



