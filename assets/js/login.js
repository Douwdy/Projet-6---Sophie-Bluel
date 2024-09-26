// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api" // Lien vers l'API
  
  function login() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    console.log(email, password);
  
    fetch(`${apiLink}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        // Handle error
        document.getElementById('passwordLogin').value = '';
        document.getElementById('passwordLogin').classList.add('error-login');
        const loginForm = document.getElementById('login').querySelector('form');
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Erreur dans l'identifiant ou le mot de passe";
        errorMessage.id = 'errorMessage';
        errorMessage.style.color = 'red';
        if (document.getElementById('errorMessage')) {
          document.getElementById('errorMessage').remove();
        }
        loginForm.appendChild(errorMessage);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('emailLogin').value = '';
      document.getElementById('passwordLogin').value = '';
      const passwordLogin = document.getElementById('passwordLogin');
      if (passwordLogin.classList.contains('error-login')) {
        passwordLogin.classList.remove('error-login');
      }
      const errorMessage = document.getElementById('errorMessage');
      if (errorMessage) {
        errorMessage.remove();
      }
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Une erreur est survenue lors de la requête.', error);
    });
  }

  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    login(); // Envoie une requête POST pour se connecter
  });