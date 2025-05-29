const firebaseConfig = {
    apiKey: "AIzaSyBisWry9zJcHgIJqMRbHThgqbE96yey5VU",
    authDomain: "nebulai-7aa4b.firebaseapp.com",
    projectId: "nebulai-7aa4b",
    storageBucket: "nebulai-7aa4b.firebasestorage.app",
    messagingSenderId: "916864728578",
    appId: "1:916864728578:web:36989f77b8be431442f11b",
    measurementId: "G-THXE4Y0HGF"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  window.addEventListener("DOMContentLoaded", () => {
    const botao = document.getElementById("registar");
  
    botao.addEventListener("click", (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          alert("✅ Conta criada com sucesso!\nEmail: " + user.email);
  
          // Redirecionar para página principal
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Erro ao criar conta:", error);
          alert("❌ Erro: " + error.message);
        });
    });
  });
  