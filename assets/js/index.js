// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api" // Lien vers l'API
const galleryLoc = document.querySelector(".gallery"); // Localisation de la galerie de projets
const categoryButtons = document.querySelectorAll("[data-category-id]"); // Localisation des boutons par catégorie
const popup = document.getElementById('popup'); // Localisation de la popup
const pageBody = document.querySelector('main'); // Localisation du contenu de la page
const popupContent = document.getElementById('popupContent'); // Localisation du contenu de la popup
const token = localStorage.getItem('token'); // Récupération du token depuis le localStorage
const editBtn = document.getElementById('editBtn'); // Localisation du bouton d'édition
const loginBtn = document.getElementById('loginForm') // Localisation du bouton de connexion
const editMode = document.getElementById('editmode'); // Localisation de la bannière de mode édition
const header = document.querySelector('header'); // Localisation de l'en-tête

// Vérification de validité du token
function checkToken() {
  if (token) {
    // décodage du token
    // Décode le token et extrait la propriété "exp"
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const expiration = decodedToken.exp;
      // Vérification de la date d'expiration du token
      if (expiration * 1000 < Date.now()) {
        // Si le token est expiré, on le supprime du localStorage
        localStorage.removeItem('token');
      } else {
        editBtn.style.display = 'unset';
        loginBtn.textContent = 'logout'; // Change le texte du bouton de connexion en "logout"
        editMode.style.display = 'flex'; // Affiche la bannière de mode édition
        header.style.marginTop = '100px'; // Ajoute une marge en haut de l'en-tête
      }
  }
}

checkToken();

function refreshProjects() {
  // Requête API pour récupérer les projets
  fetch(`${apiLink}/works`)
  .then((response) => response.json())
  .then((data) => {
    // Création d'un objet pour grouper les projets par catégorie
    const projectsByCategory = {};
    // Création d'un tableau pour tous les projets
    const allProjects = [];
    // Grouper les projets par catégorie
    for (const project of data) {
      const categoryName = project.category.name;
      if (!projectsByCategory[categoryName]) {
        projectsByCategory[categoryName] = [];
      }
      projectsByCategory[categoryName].push(project);
      allProjects.push(project);
    }

    // Afficher les projets par catégorie
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const categoryId = button.dataset.categoryId;
        let projects;
        if (categoryId === "All") {
          // Si la catégorie est "Tous", afficher tous les projets
          projects = allProjects;
        } else {
          // Sinon, grouper les projets par catégorie
          projects = projectsByCategory[categoryId] || [];
        }
        displayProjects(projects);
      });
    });

    displayProjects(allProjects);
  });
}

refreshProjects();

  // Fonction pour gérer la connexion d'un utilisateur
  function login() {
    // Récupération des valeurs des champs de saisie pour l'email et le mot de passe
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;
    // Envoi d'une requête POST à l'API pour tenter de se connecter
    fetch(`${apiLink}/users/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email,
        "password": password
      })
    })
    .then(response => {
      // Vérification si la réponse est OK (200-299)
      if (!response.ok) {
        // Si la réponse n'est pas OK, on gère l'erreur et on l'indique à l'utilisateur
        document.getElementById('passwordLogin').value = '';
        document.getElementById('passwordLogin').classList.add('error-login');
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Si la réponse est OK, on récupère les données de la réponse
      return response.json();
    })
    .then(data => {
        // On vide les champs de la page de connexion
        document.getElementById('emailLogin').value = '';
        document.getElementById('passwordLogin').value = '';
        // On retire la classe d'erreur de mot de passe
        document.getElementById('passwordLogin').classList.remove('error-login');
        loginDisplay(); // Retire la page de connexion
        localStorage.setItem('token', data.token); // Sauvegarde le token dans le localStorage
        editBtn.style.display = 'unset'; // Affiche le bouton d'édition
        loginBtn.textContent = 'logout'; // Change le texte du bouton de connexion en "logout"
        editMode.style.display = 'flex'; // Affiche la bannière de mode édition
        header.style.marginTop = '100px'; // Ajoute une marge en haut de l'en-tête
    })
    .catch(error => {
      console.error(error);
    });
  };

// Fonction pour afficher les projets
function displayProjects(projects) {
  // Vide la galerie de projets
  galleryLoc.innerHTML = "";
  // Pour chaque projet, crée un élément HTML
  projects.forEach((project) => {
    const projectElement = document.createElement("div");
    projectElement.innerHTML += `
      <figure id="${project.id}">
        <img src="${project.imageUrl}" alt="${project.title}">
        <figcaption>${project.title}</figcaption>
      </figure>
    `;
    galleryLoc.appendChild(projectElement);
  });
}

// Fonction pour afficher la page de connexion
function loginDisplay() {
  if (localStorage.getItem('token')) {
    // Supprime le token du localStorage
    localStorage.removeItem('token');
    // Cache le bouton d'édition
    editBtn.style.display = 'none';
    // Change la valeur du bouton de connexion en "login"
    loginBtn.textContent = 'login'; // Change le texte du bouton de connexion en "login"
    // Cache la bannière de mode édition
    editMode.style.display = 'none';
    // Retire la marge en haut de l'en-tête
    header.style.marginTop = '';
  } else {
    // Sélectionne l'élément de la page de connexion et le corps de la page
    const login = document.getElementById('login');

    // Ajoute ou supprime la classe "reverted" de l'élément de la page de connexion
    login.classList.toggle('reverted');

    // Définit les styles de l'élément de la page de connexion et du corps de la page en fonction de la présence de la classe "reverted"
    login.style.cssText = login.classList.contains('reverted') ? 'display: flex; overflow: hidden;' : 'display: none;';
    pageBody.style.cssText = login.classList.contains('reverted') ? 'display: none; overflow: hidden;' : 'display: unset; overflow: auto;';
  }
}

// Affiche la popup pour ajouter un nouveau projet
function worksDisplay() {
  // Affiche la popup
  popup.style.display = "flex";
  const existingPhotos = document.getElementById('existingPhotos');
  existingPhotos.innerHTML = '';
  // Fetch les projets de la base de données
  fetch(`${apiLink}/works`)
    .then((response) => response.json())
    .then((data) => {
      // Affiche les projets dans la page d'ajout de projet
      data.forEach((element) => {
        const article = document.createElement('article');
        article.classList.add('photo');
        article.id = element.id;

        const img = document.createElement('img');
        img.src = element.imageUrl;
        img.alt = element.title;

        const button = document.createElement('button');
        button.classList.add('photo-delete');
        button.dataset.id = element.id;

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-trash-can');

        button.appendChild(icon);
        article.appendChild(img);
        article.appendChild(button);

        existingPhotos.appendChild(article);
      });
  // EventListener pour la suppression de la photo
  const deleteButtons = existingPhotos.querySelectorAll('.photo-delete'); // Localisation des boutons de suppression
  // Ajoute un eventListener pour chaque bouton de suppression
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Récupère l'ID de la photo à supprimer
      const id = button.dataset.id;
      // Appel de la fonction pour supprimer la photo avec l'ID correspondant
      deletePhoto(id);
      // Retire la photo de la galerie
      document.getElementById(id).remove();
      // Rafraîchit la galerie
      refreshProjects();
    });
  });
    });
};

// Ajoute une photo au projet
function addPhotoDisplay() {
  // Affiche la popup
  popupContent.innerHTML = `
  <div class="popup-header">
    <i class="fas fa-arrow-left" id="backToGallery" style="visibility: visible;"></i>
    <i class="fa-solid fa-xmark" id="closePopup"></i>
  </div>
  <h2>Ajout photo</h2>
			<form id="photoAddForm">
			  <div class="photo-upload" id="photoField">
				<i class="fas fa-image"></i>
				<div>
					<input type="file" id="photoImport" required>
					<label for="photoImport" class="upload-button">+ Ajouter photo</label>
				</div>
				<p>jpg, png: 4mo max</p>
			  </div>
			  <div class="photo-desc">
				<label for="photoTitle">Titre</label>
				<input type="text" id="photoTitle" required>
				<label for="photoCategory">Catégorie</label>
				<select id="photoCategory" required>
          <option value=""></option>
				</select>
			  </div>
        <div class="line"></div>
			  <button type="submit" id="submitPhoto">Valider</button>
			</form>
  `;
    // Récupère les catégories de projets
    fetch(`${apiLink}/categories`)
    .then((response) => response.json())
    .then((data) => {
      // Affiche les catégories dans le formulaire
      const select = document.getElementById('photoCategory');
      // Pour chaque catégorie, crée une option dans le select
      data.forEach((category) => {
        const option = document.createElement('option');
        // Ajoute l'ID de la catégorie en tant que valeur de l'option
        option.value = category.id;
        // Ajoute le nom de la catégorie en tant que texte de l'option
        option.textContent = category.name;
        // Insère l'option dans le select
        select.appendChild(option);
      })
    });
// Localisation de l'input d'importation de la photo
const photoInput = document.getElementById('photoImport');
// Localisation du champ d'affichage de la photo
const photoUpload = document.querySelector('.photo-upload');

// Ajoute un eventListener pour l'importation de la photo
photoInput.addEventListener('change', function() {
  // Récupère le fichier sélectionné
  const file = this.files[0];
  // Si un fichier est importé
  if (file) {
    // Lecture du contenu du fichier
    const reader = new FileReader();
    reader.onload = function(event) {
      // Stocke la photo importée
      const imageData = event.target.result;
      // Crée une nouvelle balise img
      const image = document.createElement('img');
      // Formatage de la balise pour l'affichage
      image.src = imageData;
      image.alt = 'Photo importée';
      image.style.height = '100%';

      // Vide le champ d'affichage de la photo et l'affiche
      photoUpload.innerHTML = '';
      photoUpload.appendChild(image);
      // Conserve la balise photoInput
      photoUpload.appendChild(photoInput);
    };
    // Lire le contenu du fichier
    reader.readAsDataURL(file);
  } else {
    photoUpload.innerHTML = '';
  }
});

  document.getElementById('submitPhoto').addEventListener('click', function(event) {
    event.preventDefault();
    sendNewPhoto();
  }); // Ajoute un eventListener pour l'envoi de la photo
  document.getElementById('backToGallery').addEventListener('click', backToGallery); // Ajoute un eventListener pour le bouton Retour
  document.querySelector('.fa-xmark').addEventListener('click', function() { // Ajoute un eventListener pour la fermeture de la popup
    popup.style.display = "none";
  });

  // Ajoute un eventListener pour chaque champ du formulaire d'ajout de projet
  const formFields = Array.from(document.querySelectorAll('#photoTitle, #photoCategory, #photoImport'));
  formFields.forEach(field => {
    field.addEventListener('change', checkForm);
  });
};

// Retourne à la page d'ajout de projet
function backToGallery() { 
  // Affiche la page d'ajout de projet
  popupContent.innerHTML = `
  		<div class="popup-header">
				<i class="fas fa-arrow-left" id="backToGallery" style="visibility: hidden;"></i>
				<i class="fa-solid fa-xmark" id="closePopup"></i>
			</div>
		  <h2>Galerie Photo</h2>
		  <div id="existingPhotos">
		  </div>
		  <div class="line"></div>
		  <button id="addPhoto">Ajouter une photo</button>
  `;
  // Affiche la liste des projets
  worksDisplay();
  // Ajoute un eventListener pour la fermeture de la popup
  document.querySelector('.fa-xmark').addEventListener('click', function() {
    popup.style.display = "none";
  });
  // Ajoute un eventListener pour l'ajout d'un nouveau projet
  document.getElementById('addPhoto').addEventListener('click', addPhotoDisplay);
}

// Supprime la photo du projet
function deletePhoto(id) {
  // Envoie une requête fetch de type DELETE pour supprimer la photo
  fetch(`${apiLink}/works/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.ok) {
      // Si la requête est réussie, rafraîchir la galerie
      refreshProjects();
    } else {
      // Sinon, afficher un message d'erreur
      console.error(`HTTP error! status: ${response.status}`);
    }
  })
  .catch(error => {
    console.error(error);
  });
}

// Fonction pour envoyer une nouvelle photo au serveur
async function sendNewPhoto() {
  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token introuvable');
    return;
  }

  // Récupérer les données du formulaire (image, titre et catégorie)
  const image = document.getElementById('photoImport').files[0];
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;

  // Formater le titre pour prévenir les attaques par injection SQL et XSS
  const titleFormatted = title.replace(/</g, "").replace(/>/g, "").replace(/&/g, "").replace(/"/g, "").replace(/'/g, "").replace(/\//g, "");

  // Vérifier que les données du formulaire sont complètes
  if (!image || !title || !category) {
    console.error('Données du formulaire incomplètes');
    if (!image) {
      document.getElementById('photoField').classList.add('error-border');
    }
    if (!title) {
      document.getElementById('photoTitle').classList.add('error-border');
    }
    if (!category) {
      document.getElementById('photoCategory').classList.add('error-border');
    }
    return;
  }

  // Utiliser FormData pour envoyer l'image
  const formData = new FormData();
  formData.append('image', image, image.name);
  formData.append('title', titleFormatted);
  formData.append('category', category);

  try {
    // Envoyer la requête avec fetch
    const response = await fetch(`${apiLink}/works`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      // Si la requête est réussie, retourner à la galerie et rafraîchir les projets
      backToGallery();
      refreshProjects();
    } else {
      // Sinon, afficher un message d'erreur
      console.error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Une erreur est survenue lors de la requête.', error);
  }
}

// Vérifie si tout les champs sont remplis, si oui, change la couleur du bouton valider en vert
function checkForm() {
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;
  const photo = document.getElementById('photoImport').files[0];
  if (title && category && photo) {
    document.getElementById('submitPhoto').style.backgroundColor = '#1D6154';
  } else {
    document.getElementById('submitPhoto').style.backgroundColor = '#ccc';
  }
}

// Si le formulaire est soumis, empêche le rechargement de la page et envoie une nouvelle photo
document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
  sendNewPhoto();
});

// Si l'utilisateur est connecté, affiche la page d'ajout de projet, sinon affiche la page de connexion
document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
    login(); // Envoie une requête POST pour se connecter
});

// EventListener pour la fermeture de la popup
document.querySelector('.fa-xmark').addEventListener('click', function() {
  popup.style.display = "none";
});

loginBtn.addEventListener('click', loginDisplay); // Ajoute un eventListener pour l'affichage de la page de connexion

document.getElementById('addPhoto').addEventListener('click', addPhotoDisplay); // Ajoute un eventListener pour l'affichage de la page d'ajout de projet

editBtn.addEventListener('click', worksDisplay); // Ajoute un eventListener pour l'affichage de la page d'ajout de projet
// Ajoute la classe active au bouton cliqué et supprime les autres
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});