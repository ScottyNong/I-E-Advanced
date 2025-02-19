<?php
// Forcer la réponse en JSON
header('Content-Type: application/json');

// Désactiver les erreurs visibles pour éviter de casser le JSON
error_reporting(0);
ini_set('display_errors', 0);

// Vérifier si la requête est bien en POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

// URL du script Google Apps Script
$scriptURL = "https://script.google.com/macros/s/AKfycbwbq0A_fZWiMGSXbMw5--SP7EMDtwmo7Dwqu1Fnb4OlAzBGul7E9ExTvLtLbj3BD1BW/exec";

// Récupération des données envoyées
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Email et mot de passe requis."]);
    exit;
}

$email = trim($data['email']);
$password = trim($data['password']);

// Préparer les données pour l'envoi au script Google Apps
$postData = json_encode([
    "action" => "check",
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

error_log("Réponse Google Apps Script: " . $response);

// Vérification de la réponse
if ($response === false) {
    echo json_encode(["success" => false, "message" => "Erreur de connexion à Google Apps Script."]);
    exit;
}

// Vérifier que la réponse est bien du JSON valide
$jsonResponse = json_decode($response, true);

if (!is_array($jsonResponse)) {
    echo json_encode(["success" => false, "message" => "Réponse invalide du serveur.", "debug" => $response]);
    exit;
}

// Vérifier si la réponse contient bien 'user'
if (!isset($jsonResponse['user'])) {
    echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect."]);
    exit;
}

// Tout est bon, on renvoie la réponse originale du script Google Apps
echo $reponse;
echo json_encode(["success" => true, "user" => $jsonResponse['user']]);
?>
