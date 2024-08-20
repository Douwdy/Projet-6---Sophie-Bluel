// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api"
const galleryLoc = document.querySelector(".gallery");
const categoryButtons = document.querySelectorAll("[data-category-id]");
const popup = document.getElementById('popup');
const pageBody = document.querySelector('main');
const popupContent = document.getElementById('popupContent');

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

  function login() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;
  
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.token) {
        alert('Email ou mot de passe incorrect');
        document.getElementById('passwordLogin').classList.add('error-login');
      } else {
        console.log('Token received, logging in...');
        localStorage.setItem('token', data.token);
        console.log('Calling loginDisplay()...');
        loginDisplay(); // Retire la page de connexion
        console.log('Calling worksDisplay()...');
        worksDisplay(); // Affiche la page d'ajout de projet
      }
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
function addPhoto() {
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
			  <button type="submit">Valider</button>
			</form>
  `;
  document.getElementById('backToGallery').addEventListener('click', backToGallery);
  document.querySelector('.fa-xmark').addEventListener('click', function() {
    popup.style.display = "none";
  });
};

function backToGallery() {
  document.getElementById("closePopup").style.marginTop = '-320px';
  popupContent.innerHTML = `
  		<i class="fa-solid fa-xmark"></i>
		  <h2>Galerie Photo</h2>
		  <div id="existingPhotos">
		  </div>
		  <div class="line"></div>
		  <button id="addPhoto">Ajouter une photo</button>
  `;
  worksDisplay();
  document.querySelector('.fa-xmark').addEventListener('click', function() {
    popup.style.display = "none";
  });
  document.getElementById('addPhoto').addEventListener('click', addPhoto);
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
const deleteButtons = existingPhotos.querySelectorAll('.photo-delete');
deleteButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const id = event.target.getAttribute('data-id');
    deletePhoto(id);
  });
});

// Si l'utilisateur est connecté, affiche la page d'ajout de projet, sinon affiche la page de connexion
document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
    login();
    loginDisplay(); // Envoie une requête POST pour se connecter
});

// EventListener pour la fermeture de la popup
document.querySelector('.fa-xmark').addEventListener('click', function() {
  popup.style.display = "none";
});

document.getElementById('loginForm').addEventListener('click', loginDisplay);

document.getElementById('addPhoto').addEventListener('click', addPhoto);

// Ajouter la classe active au bouton cliqué
function addActiveClass(button) {
  categoryButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");
}


// Ajoute à chaque bouton de catégorie la classe 'active' au clic
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    addActiveClass(button);
  });
});
