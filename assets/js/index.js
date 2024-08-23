// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api" // Lien vers l'API
const galleryLoc = document.querySelector(".gallery"); // Localisation de la galerie de projets
const categoryButtons = document.querySelectorAll("[data-category-id]"); // Localisation des boutons par catégorie
const popup = document.getElementById('popup'); // Localisation de la popup
const pageBody = document.querySelector('main'); // Localisation du contenu de la page
const popupContent = document.getElementById('popupContent'); // Localisation du contenu de la popup

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
        worksDisplay(); // Affiche la page d'ajout de projet
        localStorage.setItem('token', data.token); // Sauvegarde le token dans le localStorage
    })
    .catch(error => {
      console.error(error);
    });
  };

// Fonction pour afficher les projets
function displayProjects(projects) {
  galleryLoc.innerHTML = "";
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
    worksDisplay();
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
        existingPhotos.innerHTML += `
        <article class="photo">
          <img src="${element.imageUrl}" alt="${element.title}">
          <button class="photo-delete" data-id="${element.id}"><i class="fa-solid fa-trash-can"></i></button>
        </article>
        `;
      });
    });
};

// Ajoute une photo au projet
function addPhotoDisplay() {
  // Affiche la popup
  popupContent.innerHTML = `
  <div class="popup-header">
    <i class="fas fa-arrow-left" id="backToGallery"></i>
    <i class="fa-solid fa-xmark" id="closePopup"></i>
  </div>
  <h2>Ajout photo</h2>
			<form id="photoAddForm">
			  <div class="photo-upload">
				<i class="fas fa-image"></i>
				<div>
					<input type="file" id="photoImport">
					<label for="photoImport" class="upload-button">+ Ajouter photo</label>
				</div>
				<p>jpg, png: 4mo max</p>
			  </div>
			  <div class="photo-desc">
				<label for="photoTitle">Titre</label>
				<input type="text" id="photoTitle">
				<label for="photoCategory">Catégorie</label>
				<select id="photoCategory">
					<option value=""></option>
					<option value="Objets">Objets</option>
					<option value="Appartements">Appartements</option>
					<option value="Hotels & restaurants">Hotels & restaurants</option>
				</select>
			  </div>
        <div class="line"></div>
			  <button type="submit" id="submitPhoto">Valider</button>
			</form>
  `;
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
};

// Retourne à la page d'ajout de projet
function backToGallery() { 
  // Affiche la page d'ajout de projet
  popupContent.innerHTML = `
  		<i class="fa-solid fa-xmark"></i>
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
  // Envoie une requête DELETE pour supprimer la photo du projet
  fetch(`${apiLink}/works/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "token": localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Si la suppression a été reussie, retirer la photo de la page d'ajout de projet et du corps de la page
      if (data) {
        const button = document.querySelector(`.photo-delete[data-id="${id}"]`);
        const photo = button.parentNode;
        photo.remove();
      }
    });
};

// EventListener pour la suppression de la photo
const deleteButtons = existingPhotos.querySelectorAll('.photo-delete'); // Localisation des boutons de suppression
// Ajoute un eventListener pour chaque bouton de suppression
deleteButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const id = event.target.getAttribute('data-id');
    // Appel de la fonction pour supprimer la photo avec l'ID correspondant
    deletePhoto(id);
  });
});

function sendNewPhoto() {
  // Récupère le token dans le localStorage
  const token = localStorage.getItem('token');
  // Récupère les informations du formulaire (image, titre et catégorie)
  const image = document.getElementById('photoImport').files[0];
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;

  // Récupère le contenu de l'image
  const reader = new FileReader();
  // Lecture du contenu de l'image
  reader.onload = function(event) {
    // Stocke l'image importée et la convertie en Blob (image binaire)
    const imageData = event.target.result;
    const blob = new Blob([imageData], { type: image.type });
    // Envoie une requête POST pour ajouter la photo (image(blob), titre et catégorie)
    const formData = new FormData();
    formData.append('image', blob);
    formData.append('title', title);
    formData.append('category', category);

    fetch(`${apiLink}/works`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  };
  // Lire le contenu de l'image
  reader.readAsBinaryString(image);
}

// Si l'utilisateur est connecté, affiche la page d'ajout de projet, sinon affiche la page de connexion
document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
    login(); // Envoie une requête POST pour se connecter
});

// EventListener pour la fermeture de la popup
document.querySelector('.fa-xmark').addEventListener('click', function() {
  popup.style.display = "none";
});

document.getElementById('loginForm').addEventListener('click', loginDisplay); // Ajoute un eventListener pour l'affichage de la page de connexion

document.getElementById('addPhoto').addEventListener('click', addPhotoDisplay); // Ajoute un eventListener pour l'affichage de la page d'ajout de projet

// Ajoute la classe active au bouton cliqué et supprime les autres
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});