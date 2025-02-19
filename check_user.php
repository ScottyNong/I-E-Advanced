<?php
header('Content-Type: application/json'); // Forcer la réponse en JSON

// URL du script Google Apps Script
$scriptURL = "https://script.google.com/macros/s/AKfycbwbq0A_fZWiMGSXbMw5--SP7EMDtwmo7Dwqu1Fnb4OlAzBGul7E9ExTvLtLbj3BD1BW/exec";

// Récupération des données envoyées via POST
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = $data['password']; // On envoie le mot de passe en clair pour vérification

    // Préparer les données pour l'envoi au script Google Apps
    $postData = json_encode([
        "action" => "check", // Action pour vérifier l'utilisateur
        "email" => $email,
        "password" => $password
    ]);

    // Configuration pour envoyer les données via POST
    $opts = [
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/json",
            "content" => $postData
        ]
    ];
    $context = stream_context_create($opts);
    $response = file_get_contents($scriptURL, false, $context);

    // Vérification et affichage de la réponse
    if ($response === false) {
        echo json_encode(["success" => false, "message" => "Erreur de connexion au serveur."]);
    } else {
        echo $response; // Retourner la réponse de Google Apps Script
    }
} else {
    echo json_encode(["success" => false, "message" => "Email et mot de passe sont requis."]);
}
?>
