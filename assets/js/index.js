// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api" // Lien vers l'API
const galleryLoc = document.querySelector(".gallery"); // Localisation de la galerie de projets
const categoryButtons = document.querySelectorAll("[data-category-id]"); // Localisation des boutons par catégorie
const popup = document.getElementById('popup'); // Localisation de la popup
const pageBody = document.querySelector('main'); // Localisation du contenu de la page
const popupContent = document.getElementById('popupContent'); // Localisation du contenu de la popup
const editBtn = document.getElementById('editBtn'); // Localisation du bouton d'édition
const loginBtn = document.getElementById('loginForm') // Localisation du bouton de connexion
const editMode = document.getElementById('editmode'); // Localisation de la bannière de mode édition
const header = document.querySelector('header'); // Localisation de l'en-tête
const filterLoc = document.querySelector('.filters'); // Localisation des filtres


// Vérification de validité du token
function checkToken() {
  const token = localStorage.getItem('token');
  if (token) {
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
        // Si le token est valide, on affiche le bouton d'édition
        editBtn.style.display = 'unset';
        // Change le texte du bouton de connexion en "logout"
        loginBtn.textContent = 'logout';
        // Affiche la bannière de mode édition
        editMode.style.display = 'flex';
        // Ajoute une marge en haut de l'en-tête
        header.style.marginTop = '100px';
      };
  };
};

checkToken();

// Requête API pour récupérer les catégories
fetch(`${apiLink}/categories`)
  .then((response) => response.json())
  .then((data) => {
    // Créer un bouton pour chaque catégorie
    data.forEach((category) => {
      const button = document.createElement("button");
      button.classList.add("category-button");
      button.dataset.categoryId = category.name;
      button.textContent = category.name;
      // Ajouter le bouton à la page
      filterLoc.appendChild(button);
    });
  });

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
      // Récupérer le nom de la catégorie du projet
      const categoryName = project.category.name;
      // Si la catégorie n'existe pas dans l'objet, on la crée
      if (!projectsByCategory[categoryName]) {
        projectsByCategory[categoryName] = [];
      }
      // Ajouter le projet à la catégorie correspondante
      projectsByCategory[categoryName].push(project);
      // Ajouter le projet à la liste de tous les projets
      allProjects.push(project);
    }
    // Ajouter un eventListener pour les filtres par catégories
    filterLoc.addEventListener("click", (event) => {
      // Vérifier si le clic est sur un bouton de catégorie
      if (event.target.matches("[data-category-id]")) {
        // Récupérer l'ID de la catégorie du bouton
        const categoryId = event.target.dataset.categoryId;
        // Créer un tableau pour stocker les projets à afficher
        let projects;
        // Si la catégorie est "All", afficher tous les projets, sinon, afficher les projets de la catégorie
        if (categoryId === "All") {
          projects = allProjects;
        } else {
          projects = projectsByCategory[categoryId] || [];
        }
        displayProjects(projects);
      }
    });
    displayProjects(allProjects);
  });
};
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
        // Selectionne le formulaire de connexion
        const loginForm = document.getElementById('login').querySelector('form');
        // Ajoute un p pour afficher un message d'erreur
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Erreur dans l'identifiant ou le mot de passe";
        errorMessage.id = 'errorMessage';
        errorMessage.style.color = 'red';
        // Supprime le message d'erreur s'il existe déjà
        if (document.getElementById('errorMessage')) {
          document.getElementById('errorMessage').remove();
        };
        // Ajoute le message d'erreur au formulaire de connexion
        loginForm.appendChild(errorMessage);
        throw new Error(`HTTP error! status: ${response.status}`);
      };
      // Si la réponse est OK, on récupère les données de la réponse
      return response.json();
    })
    .then(data => {
        // On vide les champs de la page de connexion
        document.getElementById('emailLogin').value = '';
        document.getElementById('passwordLogin').value = '';
        // On retire la classe d'erreur de mot de passe
        const passwordLogin = document.getElementById('passwordLogin');
        if (passwordLogin.classList.contains('error-login')) {
          passwordLogin.classList.remove('error-login');
        }
        // On retire le message d'erreur
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
          errorMessage.remove();
        }
        // Retire la page de connexion
        loginDisplay();
        // Sauvegarde le token dans le localStorage
        localStorage.setItem('token', data.token);
        // Affiche le bouton d'édition
        editBtn.style.display = 'unset';
        // Change le texte du bouton de connexion en "logout"
        loginBtn.textContent = 'logout';
        // Retire le style gras du bouton de connexion
        loginBtn.style.fontWeight = '';
        // Affiche la bannière de mode édition
        editMode.style.display = 'flex';
        // Ajoute une marge en haut de l'en-tête
        header.style.marginTop = '100px';
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
    // Crée un élément div pour le projet
    const projectElement = document.createElement("div");
    const projectFigure = document.createElement("figure");
    projectFigure.id = project.id;
    // Crée un élément figure pour le projet
    const projectImage = document.createElement("img");
    projectImage.src = project.imageUrl;
    projectImage.alt = project.title;
    // Crée un élément figcaption pour le projet
    const projectCaption = document.createElement("figcaption");
    projectCaption.textContent = project.title;
    // Ajoute les éléments au projet
    projectFigure.appendChild(projectImage);
    projectFigure.appendChild(projectCaption);
    // Ajoute le projet à la galerie
    projectElement.appendChild(projectFigure);
    galleryLoc.appendChild(projectElement);
  });
};

// Fonction pour afficher la page de connexion
function loginDisplay() {
  if (localStorage.getItem('token')) {
    // Supprime le token du localStorage
    localStorage.removeItem('token');
    // Cache le bouton d'édition
    editBtn.style.display = 'none';
    // Change le texte du bouton de connexion en "login"
    loginBtn.textContent = 'login';
    // Retire le style gras du bouton de connexion
    loginBtn.style.fontWeight = '';
    // Cache la bannière de mode édition
    editMode.style.display = 'none';
    // Retire la marge en haut de l'en-tête
    header.style.marginTop = '';
  } else {
    // Sélectionne l'élément de la page de connexion et le corps de la page
    const login = document.getElementById('login');
    // Ajoute ou supprime la classe "reverted" de l'élément de la page de connexion
    login.classList.toggle('reverted');
    loginBtn.classList.toggle('bold');
    // Définit les styles de l'élément de la page de connexion et du corps de la page en fonction de la présence de la classe "reverted"
    login.style.cssText = login.classList.contains('reverted') ? '' : 'display: none;';
    pageBody.style.cssText = login.classList.contains('reverted') ? 'display: none;' : '';
  };
};

// Affiche la popup pour ajouter un nouveau projet
function worksDisplay() {
  // Affiche la popup
  popup.style.display = "flex";
  const existingPhotos = document.getElementById('existingPhotos');
  if (existingPhotos) {
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
          // Crée une balise img pour afficher la photo
          const img = document.createElement('img');
          img.src = element.imageUrl;
          img.alt = element.title;
          // Crée un bouton pour supprimer la photo
          const button = document.createElement('button');
          button.classList.add('photo-delete');
          button.dataset.id = element.id;
          // Crée une icône pour le bouton de suppression
          const icon = document.createElement('i');
          icon.classList.add('fa-solid', 'fa-trash-can');
          // Ajoute l'icône au bouton
          button.appendChild(icon);
          article.appendChild(img);
          article.appendChild(button);
          // Ajoute l'article à la liste des projets existants
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
};
// Ajoute une photo au projet
function addPhotoDisplay() {
  // Affiche la popup
  const popupHeader = document.createElement('div');
  popupHeader.classList.add('popup-header');
  // Crée les icônes pour le bouton Retour et la fermeture de la popup
  const backToGalleryIcon = document.createElement('i');
  backToGalleryIcon.classList.add('fas', 'fa-arrow-left');
  backToGalleryIcon.id = 'backToGallery';
  backToGalleryIcon.style.visibility = 'visible';
  // Crée l'icône pour la fermeture de la popup
  const closePopupIcon = document.createElement('i');
  closePopupIcon.classList.add('fa-solid', 'fa-xmark');
  closePopupIcon.id = 'closePopup';
  // Ajoute les icônes au header de la popup
  popupHeader.appendChild(backToGalleryIcon);
  popupHeader.appendChild(closePopupIcon);
  // Crée le titre de la popup
  const popupTitle = document.createElement('h2');
  popupTitle.textContent = 'Ajout photo';
  // Crée le formulaire d'ajout de photo
  const photoAddForm = document.createElement('form');
  photoAddForm.id = 'photoAddForm';
  // Crée les champs pour l'importation de la photo, le titre et la catégorie
  const photoSend = document.createElement('div');
  photoSend.classList.add('photo-upload');
  photoSend.id = 'photoField';
  // Crée l'icône pour l'importation de la photo
  const uploadIcon = document.createElement('i');
  uploadIcon.classList.add('fas', 'fa-image');
  // Crée le champ d'importation de la photo
  const uploadDiv = document.createElement('div');
  // Crée l'input pour l'importation de la photo
  const photoImportInput = document.createElement('input');
  photoImportInput.type = 'file';
  photoImportInput.id = 'photoImport';
  photoImportInput.required = true;
  // Crée le label pour l'input d'importation de la photo
  const uploadLabel = document.createElement('label');
  uploadLabel.htmlFor = 'photoImport';
  uploadLabel.classList.add('upload-button');
  uploadLabel.textContent = '+ Ajouter photo';
  // Crée le champ pour le titre et la catégorie de la photo
  const photoDesc = document.createElement('div');
  photoDesc.classList.add('photo-desc');
  // Crée le label et l'input pour le titre de la photo
  const titleLabel = document.createElement('label');
  titleLabel.htmlFor = 'photoTitle';
  titleLabel.textContent = 'Titre';
  // Crée l'input pour le titre de la photo
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'photoTitle';
  titleInput.required = true;
  // Crée le label et le select pour la catégorie de la photo
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'photoCategory';
  categoryLabel.textContent = 'Catégorie';
  // Crée le select pour la catégorie de la photo
  const categorySelect = document.createElement('select');
  categorySelect.id = 'photoCategory';
  categorySelect.required = true;
  // Crée la ligne de séparation entre les champs
  const lineDiv = document.createElement('div');
  lineDiv.classList.add('line');
  // Crée le bouton de validation du formulaire
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.id = 'submitPhoto';
  submitButton.textContent = 'Valider';
  // Ajoute les éléments au formulaire
  photoSend.appendChild(uploadIcon);
  uploadDiv.appendChild(photoImportInput);
  uploadDiv.appendChild(uploadLabel);
  photoSend.appendChild(uploadDiv);
  photoSend.innerHTML += '<p>jpg, png: 4mo max</p>';
  // Ajoute les éléments au formulaire
  photoDesc.appendChild(titleLabel);
  photoDesc.appendChild(titleInput);
  photoDesc.appendChild(categoryLabel);
  photoDesc.appendChild(categorySelect);
  // Ajoute les éléments à la popup
  photoAddForm.appendChild(photoSend);
  photoAddForm.appendChild(photoDesc);
  photoAddForm.appendChild(lineDiv);
  photoAddForm.appendChild(submitButton);
  // Ajoute les éléments à la popup
  const popupContent = document.getElementById('popupContent');
  popupContent.innerHTML = '';
  popupContent.appendChild(popupHeader);
  popupContent.appendChild(popupTitle);
  popupContent.appendChild(photoAddForm);
    // Récupère les catégories de projets
    fetch(`${apiLink}/categories`)
    .then((response) => response.json())
    .then((data) => {
      // Affiche les catégories dans le formulaire
      const select = document.getElementById('photoCategory');
      // Ajoute une option vide au début du select
      const blankOption = document.createElement('option');
      blankOption.value = '';
      blankOption.textContent = '';
      select.insertBefore(blankOption, select.firstChild);
      // Pour chaque catégorie, crée une option dans le select
      data.forEach((category) => {
        const option = document.createElement('option');
        // Ajoute l'ID de la catégorie en tant que valeur de l'option
        option.value = category.id;
        // Ajoute le nom de la catégorie en tant que texte de l'option
        option.textContent = category.name;
        // Insère l'option dans le select
        select.appendChild(option);
      });
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
      photoUpload.style.padding = '0';
      photoUpload.style.height = '170px';
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
  // Ajoute un eventListener pour l'envoi de la photo
  document.getElementById('submitPhoto').addEventListener('click', function(event) {
    // Empêche le rechargement de la page
    event.preventDefault();
    // Envoie la photo
    sendNewPhoto();
  });
  // Ajoute un eventListener pour le bouton Retour
  document.getElementById('backToGallery').addEventListener('click', backToGallery);
  // Ajoute un eventListener pour la fermeture de la popup
  document.querySelector('.fa-xmark').addEventListener('click', function() {
    // Ferme la popup
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
  const popupHeader = document.createElement('div');
  popupHeader.classList.add('popup-header');
  // Crée les icônes pour le bouton Retour et la fermeture de la popup
  const backToGalleryIcon = document.createElement('i');
  backToGalleryIcon.classList.add('fas', 'fa-arrow-left');
  backToGalleryIcon.id = 'backToGallery';
  backToGalleryIcon.style.visibility = 'hidden';
  // Crée l'icône pour la fermeture de la popup
  const closePopupIcon = document.createElement('i');
  closePopupIcon.classList.add('fa-solid', 'fa-xmark');
  closePopupIcon.id = 'closePopup';
  // Ajoute les icônes au header de la popup
  popupHeader.appendChild(backToGalleryIcon);
  popupHeader.appendChild(closePopupIcon);
  // Crée le titre de la popup
  const popupTitle = document.createElement('h2');
  popupTitle.textContent = 'Galerie Photo';
  // Crée la liste des projets existants
  const existingPhotos = document.createElement('div');
  existingPhotos.id = 'existingPhotos';
  // Crée la ligne de séparation entre les projets existants et le bouton d'ajout de photo
  const lineDiv = document.createElement('div');
  lineDiv.classList.add('line');
  // Crée le bouton d'ajout de photo
  const addPhotoButton = document.createElement('button');
  addPhotoButton.id = 'addPhoto';
  addPhotoButton.textContent = 'Ajouter une photo';
  // Ajoute les éléments à la popup
  popupContent.innerHTML = '';
  popupContent.appendChild(popupHeader);
  popupContent.appendChild(popupTitle);
  popupContent.appendChild(existingPhotos);
  popupContent.appendChild(lineDiv);
  popupContent.appendChild(addPhotoButton);
  // Affiche la liste des projets
  worksDisplay();
  // Ajoute un eventListener pour la fermeture de la popup
  document.querySelector('.fa-xmark').addEventListener('click', function() {
    popup.style.display = "none";
  });
  // Ajoute un eventListener pour l'ajout d'un nouveau projet
  document.getElementById('addPhoto').addEventListener('click', addPhotoDisplay);
};

// Supprime la photo du projet
function deletePhoto(id) {
  // Récupérer le token depuis le localStorage et vérifier s'il est présent sinon afficher un message d'erreur
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token introuvable');
    return;
  };
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
};

// Fonction pour envoyer une nouvelle photo au serveur
async function sendNewPhoto() {
  // Récupérer le token depuis le localStorage et vérifier s'il est présent sinon afficher un message d'erreur
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token introuvable');
    return;
  };

  // Récupérer les données du formulaire (image, titre et catégorie)
  const image = document.getElementById('photoImport').files[0];
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;

  // Formater le titre pour prévenir les attaques par injection SQL et XSS
  const titleFormatted = title.replace(/[<>&"'\/]/g, "");

  // Vérifier que les données du formulaire sont complètes sinon ajoute une bordure rouge aux champs manquants
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
  };

  // FormData pour envoyer l'image et les données du formulaire
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
};

// Vérifie si tout les champs sont remplis, si oui, change la couleur du bouton valider en vert
function checkForm() {
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;
  const photo = document.getElementById('photoImport').files[0];
  document.getElementById('submitPhoto').style.backgroundColor = (title && category && photo) ? '#1D6154' : '#ccc';
};

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

// Ajoute un eventListener pour les filtres par catégories
filterLoc.addEventListener('click', (event) => {
  // Vérifie si le clic est sur un bouton de catégorie
  if (event.target.matches('.category-button')) {
    const button = event.target;
    // Retire la classe "active" de tous les boutons
    const categoryButtons = filterLoc.querySelectorAll('.category-button');
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    // Ajoute la classe "active" au bouton cliqué
    button.classList.add("active");
  }
});