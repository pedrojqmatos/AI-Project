// login.js
document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    // Aqui futuramente vais ligar ao Firebase para autenticar
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email && password) {
      // Simular login com redirecionamento
      window.location.href = "Index.html";
    }
  });
  