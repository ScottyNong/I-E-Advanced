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
    const reportPostitButton = document.getElementById("report-postit");
    const returnPostitButton = document.getElementById("return-postit");
    const deletePostitButton = document.getElementById("delete-postit");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const userStats = document.getElementById("user-stats");
    const rulesButton = document.getElementById("rules-button");
    const rulesModal = document.getElementById("rules-modal");
    const closeRulesButton = document.getElementById("close-rules");
    const firstConnectionButton = document.getElementById("signup-button");

    loadPostItsFromServer();

    let currentColor = "yellow"; // Couleur par défaut des post-its
    let scale = 1; // Zoom par défaut
    let isMouseDown = false; // Indicateur de clic
    let isDragging = false; // Indicateur de déplacement
    let startX, startY, scrollLeft, scrollTop; // Variables pour le déplacement du mur
    let activePostIt = null; // Post-it actuellement sélectionné
    const postIts = []; // Liste des post-its créés
    let currentUser = null; // Utilisateur actuel
    let streak = 0; // Variable pour stocker le streak de l'utilisateur
    let lastPostDate = null; // Date de la dernière publication du post-it

    // 1. Afficher les règles lorsque l'utilisateur clique sur le bouton "Règlement"
    rulesButton.addEventListener("click", () => {
        rulesModal.style.display = "flex";
    });

    // 2. Fermeture de la fenêtre "Règlement"
    closeRulesButton.addEventListener("click", () => {
        rulesModal.style.display = "none";
    });

    // Connexion avec email et mot de passe
    loginButton.addEventListener("click", () => {
        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (!email || !password) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "Veuillez entrer votre email et mot de passe.";
            return;
        }

        // Envoi des données au PHP pour vérifier l'utilisateur
        fetch("check_user.php", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorMessage.style.display = "block";
                errorMessage.textContent = "Email ou mot de passe incorrect. Utilisez 'Première Connexion' pour créer un compte.";
            } else {
                // Si la connexion est réussie
                currentUser = data.user;
                localStorage.setItem("userEmail", currentUser.email);
                loginContainer.style.display = "none"; // Masquer la page de connexion
                wallContainer.style.display = "block"; // Afficher le mur interactif
                updateUserStats(); // Mettre à jour les statistiques de l'utilisateur
                logUserAction(currentUser.email, "Connexion");
            }
        })
        .catch(error => {
            console.error("Erreur lors de la connexion :", error);
        });
    });

    // 4. Création d'un compte lors de la première connexion
    firstConnectionButton.addEventListener("click", () => {
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
    
        if (!email || !password) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "Veuillez entrer votre email et mot de passe.";
            return;
        }
    
        // Validation de l'email
        if (!validateEmail(email)) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "L'email est invalide.";
            return;
        }
    
        // Validation du mot de passe
        if (password.length < 6) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
            return;
        }
    
        // Envoi des données au PHP pour la création de l'utilisateur
        fetch("create_user.php", {
            method: "POST",
            body: JSON.stringify({ email: email, password: password }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Si la création du compte a réussi
                currentUser = { email };
                localStorage.setItem("userEmail", currentUser.email);
                loginContainer.style.display = "none"; // Masquer la page de connexion
                wallContainer.style.display = "block"; // Afficher le mur interactif
                updateUserStats(); // Mettre à jour les statistiques de l'utilisateur
                logUserAction(currentUser.email, "Création du compte et connexion");
            } else {
                errorMessage.style.display = "block";
                errorMessage.textContent = data.message || "Erreur lors de la création du compte.";
            }
        })
        .catch(error => {
            console.error("Erreur lors de la création du compte :", error);
        });
    });
    
    // Fonction de validation de l'email
    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }

    // 5. Mise à jour des statistiques utilisateur lorsqu'un post-it est écrit
    const updateUserStats = () => {
        const userStatsElement = document.getElementById("user-stats");
        userStatsElement.innerHTML = `
            <h2>Tes informations : </h2>
            <p>Email: ${currentUser.email}</p>
            <p>Streak: <span class="streak"><span>🔥</span> ${streak} jours</p>
        `;
        userStats.style.display = "block"; // Afficher les statistiques
    };

    // 6. Enregistrer l'activité utilisateur dans le log
    function logUserAction(email, action, postId = null, postContent = null) {
        const logData = {
            email: email,
            action: action,
            timestamp: new Date().toISOString(),
            post_id: postId,
            post_content: postContent
        };
    
        fetch('log_user_activity.php', {
            method: 'POST',
            body: JSON.stringify(logData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Création d'un post-it
    const createPostIt = (x, y) => {
      if (isPositionOccupied(x, y)) {
        alert("Un post-it existe déjà à cet endroit.");
        return;
      }
    
      const postIt = document.createElement("textarea");
      postIt.className = "post-it";
      postIt.style.backgroundColor = currentColor;
      postIt.style.left = `${x}px`;
      postIt.style.top = `${y}px`;
      postIt.dataset.userId = currentUser.email;
      postIt.dataset.timestamp = new Date().toISOString();
    
      postIt.addEventListener("input", (e) => {
        if (postIt.dataset.userId !== currentUser.email) {
          alert("Vous ne pouvez pas modifier ce post-it.");
          postIt.value = postIt.dataset.originalContent;
          postIt.blur();
          return;
        }
        postIt.style.height = "auto";
        postIt.style.width = "auto";
        postIt.style.height = postIt.scrollHeight + "px";
        postIt.style.width = Math.min(postIt.scrollWidth + 20, 200) + "px";
        savePostItToServer(postIt);
      });

      // Validation avec Entrée
        postIt.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                postIt.blur()

            }
        });  
        
      postIt.addEventListener("blur", () => {
        postIt.dataset.originalContent = postIt.value;
      });
    
      postIt.addEventListener("click", (e) => {
        activePostIt = postIt;
        showMenu(menuPostit, e.clientX, e.clientY);
      });
    
      postIts.push(postIt);
      wall.appendChild(postIt);
      postIt.focus();
    
      updateStreak();
      savePostItToServer(postIt);
    }


    // Vérifier si une position est occupée par un post-it
    const isPositionOccupied = (x, y) => {
        return postIts.some(postIt => {
            const rect = postIt.getBoundingClientRect();
            return (
                x >= rect.left - 5 &&
                x <= rect.right + 10 &&
                y >= rect.top - 10 &&
                y <= rect.bottom + 5
            );
        });
    };

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

    // Fonction de suppression d'un post-it (si l'utilisateur est le propriétaire)
    deletePostitButton.onclick = () => {
      if (activePostIt.dataset.userId === currentUser.email || currentUser.email === 'sebastien.bonna@hotmail.com') {
        wall.removeChild(activePostIt); // Supprimer le post-it du mur
        postIts.splice(postIts.indexOf(activePostIt), 1); // Supprimer du tableau des post-its
        deletePostItFromServer(activePostIt); // Supprimer du serveur
        hideMenu(menuPostit); // Masquer le menu
      } else {
        alert("Vous ne pouvez supprimer que vos propres post-its.");
      }
    };
    
    // Fonction pour supprimer un post-it du serveur
    function deletePostItFromServer(postIt) {
      fetch("delete_postit.php", {
        method: "POST", // Utiliser POST car nous n'avons pas de requête DELETE
        body: JSON.stringify({
          userId: postIt.dataset.userId,
          timestamp: postIt.dataset.timestamp
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du post-it');
        }
        console.log("Post-it supprimé du serveur avec succès");
      })
      .catch(error => console.error("Erreur lors de la suppression :", error));
    }



    // Gestion du clic sur le mur pour créer un post-it
    wall.addEventListener("click", (e) => {
        if (!isDragging && !e.target.classList.contains("post-it")) {
            showMenu(menuWall, e.clientX, e.clientY);

            writeHereButton.onclick = () => {
                createPostIt(e.offsetX, e.offsetY);
                hideMenu(menuWall);
            };

            returnWallButton.onclick = () => hideMenu(menuWall);
        }
    });

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
            postIt.dataset.originalContent = postItData.content;
    
            postIt.addEventListener("input", (e) => {
              if (postIt.dataset.userId !== currentUser.email) {
                alert("Vous ne pouvez pas modifier ce post-it.");
                postIt.value = postIt.dataset.originalContent;
                postIt.blur();
                return;
              }
              postIt.style.height = "auto";
              postIt.style.width = "auto";
              postIt.style.height = postIt.scrollHeight + "px";
              postIt.style.width = Math.min(postIt.scrollWidth + 20, 200) + "px";
              savePostItToServer(postIt);
            });
    
            postIt.addEventListener("blur", () => {
              postIt.dataset.originalContent = postIt.value;
            });
    
            postIts.push(postIt);
            wall.appendChild(postIt);
              
            // Ajout de l'écouteur d'événements pour le menu contextuel
            postIt.addEventListener("click", (e) => {
                activePostIt = postIt;
                showMenu(menuPostit, e.clientX, e.clientY);
              });
          });
        })
        .catch(error => console.error("Erreur lors du chargement :", error));
    }
    
    // Mise à jour du streak
    const updateStreak = () => {
        const today = new Date().toISOString().split("T")[0]; // Date du jour au format YYYY-MM-DD

        if (!lastPostDate || today !== lastPostDate) {
            // Si c'est un nouveau jour
            streak = (streak === 0 || today !== lastPostDate) ? 1 : streak + 1; // Réinitialiser ou incrémenter le streak
        }

        lastPostDate = today;
        updateUserStats(); // Mettre à jour les statistiques utilisateur
    };

    // Fonction de signalement d'un post-it (admin seulement)
    reportPostitButton.onclick = () => {
        if (activePostIt) {
            alert("Post-It signalé !");
            hideMenu(menuPostit);
            sendReportEmail(); // Appel à la fonction d'envoi d'email
        }
    };

    // Retour au mur depuis le menu du post-it
    returnPostitButton.onclick = () => hideMenu(menuPostit);

    // Gestion des couleurs des post-its
    colorSelect.addEventListener("change", (e) => {
        currentColor = e.target.value;
    });

    // Gestion du zoom avec la molette de la souris
    wallContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const newScale = scale - e.deltaY * zoomIntensity / 100;
        scale = Math.min(Math.max(0.5, newScale), 3); // Limiter le zoom
        wall.style.transform = `scale(${scale})`;
    });

    // Gestion du déplacement du mur
    wallContainer.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("post-it")) return; // Ignore les clics sur les post-its

        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollLeft = wallContainer.scrollLeft;
        scrollTop = wallContainer.scrollTop;
        wall.style.cursor = "grabbing";

        setTimeout(() => isDragging = true, 200); // Délai pour détecter un déplacement
    });

    // Déplacement du mur
    wallContainer.addEventListener("mousemove", (e) => {
        if (!isMouseDown) return;

        if (isDragging) {
            const dx = startX - e.clientX;
            const dy = startY - e.clientY;
            wallContainer.scrollLeft = scrollLeft + dx;
            wallContainer.scrollTop = scrollTop + dy;
        }
    });

    // Fin du déplacement du mur
    wallContainer.addEventListener("mouseup", () => {
        isMouseDown = false;
        wall.style.cursor = "grab";
        isDragging = false;
    });

    wallContainer.addEventListener("mouseleave", () => {
        isMouseDown = false;
        wall.style.cursor = "grab";
        isDragging = false;
    });

    // Fonction pour ajuster la taille du mur si nécessaire (ajoutée si besoin)
    window.addEventListener("resize", () => {
        wall.style.transform = `scale(${scale})`; // Recalcul du zoom en fonction de la taille du mur
    });

    // Déconnexion de l'utilisateur
    logoutButton.addEventListener("click", () => {
        currentUser = null;
        wallContainer.style.display = "none";
        loginContainer.style.display = "flex";
        loginForm.reset();
        errorMessage.style.display = "none";
    });

    // Retour au mur depuis le menu du post-it
    returnPostitButton.onclick = () => hideMenu(menuPostit);

    // Fonction pour ajouter un délai avant l'enregistrement
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }
});
 
