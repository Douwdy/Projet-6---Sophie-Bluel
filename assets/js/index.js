// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api"
const galleryLoc = document.querySelector(".gallery");
const categoryButtons = document.querySelectorAll("[data-category-id]");
const popup = document.getElementById('popup');
const pageBody = document.querySelector('main');

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

// Ajouter la classe active au bouton cliqué
function addActiveClass(button) {
  categoryButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");
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
    // Fetch les projets de la base de données
    fetch(`${apiLink}/works`)
      .then((response) => response.json())
      .then((data) => {
        // Affiche les projets dans la page d'ajout de projet
        data.forEach((element) => {
          const existingPhotos = document.getElementById('existingPhotos');
          existingPhotos.innerHTML += `
          <article class="photo">
            <img src="${element.imageUrl}" alt="${element.title}">
            <button class="photo-delete" data-id="${element.id}"><i class="fa-solid fa-trash-can"></i></button>
          </article>
          `;
        });
      });
  };

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
// Ajoute une photo au projet
function addPhoto() {
  // Envoie une requête POST pour ajouter une nouvelle photo (contient le titre, l'image et la catégorie du projet)
  fetch(`${apiLink}/works`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: document.getElementById("title").value,
      imageUrl: document.getElementById("imageUrl").value,
      category: document.getElementById("category").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Si l'ajout a été reussi, affiche la page d'ajout de projet et le corps de la page
      if (data) {
        worksDisplay();
      }
    });
};
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
const loginBtn = document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
    login(); // Envoie une requête POST pour se connecter
});

// EventListener pour la fermeture de la popup
const closeBtn = document.querySelector('.fa-xmark');
closeBtn.addEventListener('click', function() {
  popup.style.display = "none";
  const existingPhotos = document.getElementById('existingPhotos');
  existingPhotos.innerHTML = '';
});

