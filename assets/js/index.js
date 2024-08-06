// Variables utilitaires
const apiLink = "http://127.0.0.1:5678/api"
const galleryLoc = document.querySelector(".gallery");
const categoryButtons = document.querySelectorAll("[data-category-id]");

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
    projectElement.innerHTML = `
      <figure>
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

// Page de Login
function login() {
  const pageBody = document.getElementById('login');
  pageBody.style.display = 'flex';
  pageBody.style.overflow = 'hidden';
}