document.addEventListener('DOMContentLoaded', function() {
    const forgotLink = document.getElementById('forgot-password');
  
    if (forgotLink) {
      forgotLink.addEventListener('click', function(event) {
        event.preventDefault(); // Impede o link de seguir o href padrão
        window.location.href = 'reset.html'; // Redireciona
      });
    }
  });
  