<?php
// URL de ton script Google Apps Script
$scriptURL = "https://script.google.com/macros/s/AKfycbzOd4aysWx9b5LrNDmcfRlODHWeysMWTkidGQBza_ktBIhWmEsDM8NLur10vcz_xY5q/exec";

// Récupérer les données envoyées via POST
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = $data['password']; // On envoie le mot de passe en clair car GAS ne gère pas password_verify

    // Envoyer les données au script Google Apps Script
    $postData = http_build_query(["email" => $email, "password" => $password]);
    $opts = [
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/x-www-form-urlencoded",
            "content" => $postData
        ]
    ];
    $context = stream_context_create($opts);
    $response = file_get_contents($scriptURL, false, $context);

    echo $response; // Retourne la réponse du script Google Apps Script
} else {
    echo json_encode([
        "success" => false,
        "message" => "Email et mot de passe requis."
    ]);
}
?>
