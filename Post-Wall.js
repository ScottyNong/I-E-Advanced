// Javascript test
document.addEventListener("DOMContentLoaded", () => {
    // Sélection des éléments HTML
    const loginForm = document.getElementById("login-form");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");
    const wallContainer = document.getElementById("wall-container");
    const wall = document.getElementById("wall");
    const loginContainer = document.getElementById("login-container");
    const menuWall = document.getElementById("menu-wall");
    const menuPostit = document.getElementById("menu-postit");
    const colorSelect = document.getElementById("color-select");
    const writeHereButton = document.getElementById("write-here");
    const returnWallButton = document.getElementById("return-wall");
    const deletePostitButton = document.getElementById("delete-postit");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const userStats = document.getElementById("user-stats");

    loadPostItsFromServer();

    let currentColor = "yellow"; // Couleur par défaut des post-its
    let postIts = []; // Liste des post-its créés
    let currentUser = null; // Utilisateur actuel
    let activePostIt = null; // Post-it actuellement sélectionné

    // Connexion
    loginButton.addEventListener("click", () => {
        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (!email || !password) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "Veuillez entrer votre email et mot de passe.";
            return;
        }

        fetch("check_user.php", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorMessage.style.display = "block";
                errorMessage.textContent = "Email ou mot de passe incorrect.";
            } else {
                currentUser = data.user;
                localStorage.setItem("userEmail", currentUser.email);
                loginContainer.style.display = "none";
                wallContainer.style.display = "block";
                updateUserStats();
            }
        })
        .catch(error => console.error("Erreur lors de la connexion :", error));
    });

    // Mise à jour des statistiques utilisateur
    const updateUserStats = () => {
        userStats.innerHTML = `<p>Email: ${currentUser.email}</p>`;
        userStats.style.display = "block";
    };

    // Création d'un post-it
    const createPostIt = (x, y) => {
        const postIt = document.createElement("textarea");
        postIt.className = "post-it";
        postIt.style.backgroundColor = currentColor;
        postIt.style.left = `${x}px`;
        postIt.style.top = `${y}px`;
        postIt.dataset.userId = currentUser.email;
        postIt.dataset.timestamp = new Date().toISOString();

        postIt.addEventListener("input", () => savePostItToServer(postIt));

        postIt.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                postIt.blur();
            }
        });

        postIt.addEventListener("click", (e) => {
            activePostIt = postIt;
            showMenu(menuPostit, e.clientX, e.clientY);
        });

        postIts.push(postIt);
        wall.appendChild(postIt);
        postIt.focus();

        savePostItToServer(postIt);
    };

    // Sauvegarde d'un post-it sur le serveur
    function savePostItToServer(postIt) {
        fetch("save_postit.php", {
            method: "POST",
            body: JSON.stringify({
                content: postIt.value,
                x: postIt.style.left,
                y: postIt.style.top,
                color: postIt.style.backgroundColor,
                userId: postIt.dataset.userId,
                timestamp: postIt.dataset.timestamp
            }),
            headers: { "Content-Type": "application/json" }
        }).catch(error => console.error("Erreur lors de la sauvegarde :", error));
    }

    // Chargement des post-its depuis le serveur
    function loadPostItsFromServer() {
        fetch("load_postits.php")
            .then(response => response.json())
            .then(postItsData => {
                postItsData.forEach(postItData => {
                    const postIt = document.createElement("textarea");
                    postIt.className = "post-it";
                    postIt.value = postItData.content;
                    postIt.style.backgroundColor = postItData.color;
                    postIt.style.left = postItData.x;
                    postIt.style.top = postItData.y;
                    postIt.dataset.userId = postItData.userId;
                    postIt.dataset.timestamp = postItData.timestamp;

                    postIt.addEventListener("input", () => savePostItToServer(postIt));

                    postIts.push(postIt);
                    wall.appendChild(postIt);
                });
            })
            .catch(error => console.error("Erreur lors du chargement :", error));
    }

    // Suppression d'un post-it
    deletePostitButton.onclick = () => {
        if (activePostIt && activePostIt.dataset.userId === currentUser.email) {
            wall.removeChild(activePostIt);
            postIts = postIts.filter(p => p !== activePostIt);
            activePostIt = null;
            hideMenu(menuPostit);
        } else {
            alert("Vous ne pouvez supprimer que vos propres post-its.");
        }
    };

    // Gestion du clic sur le mur pour créer un post-it
    wall.addEventListener("click", (e) => {
        if (!e.target.classList.contains("post-it")) {
            showMenu(menuWall, e.clientX, e.clientY);

            writeHereButton.onclick = () => {
                createPostIt(e.offsetX, e.offsetY);
                hideMenu(menuWall);
            };

            returnWallButton.onclick = () => hideMenu(menuWall);
        }
    });

    // Fonction pour afficher un menu contextuel
    const showMenu = (menu, x, y) => {
        menu.style.display = "block";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    };

    // Fonction pour masquer un menu contextuel
    const hideMenu = (menu) => {
        menu.style.display = "none";
    };

    // Gestion des couleurs des post-its
    colorSelect.addEventListener("change", (e) => {
        currentColor = e.target.value;
    });

    // Déconnexion de l'utilisateur
    logoutButton.addEventListener("click", () => {
        currentUser = null;
        wallContainer.style.display = "none";
        loginContainer.style.display = "flex";
        loginForm.reset();
        errorMessage.style.display = "none";
    });
});
