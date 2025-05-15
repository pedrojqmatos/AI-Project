document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".login");
    const signupButton = document.querySelector(".signup");
  
    if (loginButton) {
      loginButton.addEventListener("click", function () {
        window.location.href = "login.html";
      });
    }
  
    if (signupButton) {
      signupButton.addEventListener("click", function () {
        window.location.href = "signup.html";
      });
    }
  });
  