// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBisWry9zJcHgIJqMRbHThgqbE96yey5VU",
  authDomain: "nebulai-7aa4b.firebaseapp.com",
  projectId: "nebulai-7aa4b",
  storageBucket: "nebulai-7aa4b.firebasestorage.app",
  messagingSenderId: "916864728578",
  appId: "1:916864728578:web:36989f77b8be431442f11b",
  measurementId: "G-THXE4Y0HGF"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Esperar que o DOM carregue
window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit");

  if (!submitBtn) {
    alert("❌ Botão não encontrado no DOM!");
    return;
  }

  submitBtn.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("✅ Login bem-sucedido!\nEmail: " + user.email);
        // Redirecionar se quiseres:
        // window.location.href = "dashboard.html";
      })
      .catch((error) => {
        alert("❌ Erro no login:\n" + error.message);
      });
  });
});
