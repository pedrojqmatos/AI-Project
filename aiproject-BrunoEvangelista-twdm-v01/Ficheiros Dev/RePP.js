// recuperar.js
document.getElementById("recuperar-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("recuperar-email").value;
    // Aqui no futuro podes ligar ao Firebase para recuperação
    alert("Se existir uma conta com esse email, vais receber instruções.");
  });
  