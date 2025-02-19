header('Content-Type: application/json');

$scriptURL = "https://script.google.com/macros/s/AKfycbwbq0A_fZWiMGSXbMw5--SP7EMDtwmo7Dwqu1Fnb4OlAzBGul7E9ExTvLtLbj3BD1BW/exec";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Email et mot de passe requis."]);
    exit;
}

$email = $data['email'];
$password = $data['password'];  // Mot de passe en clair

// Demande à Google Sheets le hash du mot de passe
$postData = json_encode([
    "action" => "getPasswordHash",
    "email" => $email
]);

$opts = [
    "http" => [
        "method" => "POST",
        "header" => "Content-Type: application/json",
        "content" => $postData
    ]
];

$context = stream_context_create($opts);
$response = file_get_contents($scriptURL, false, $context);

if (!$response) {
    echo json_encode(["success" => false, "message" => "Erreur de connexion à Google Apps Script."]);
    exit;
}

$jsonResponse = json_decode($response, true);

if (!isset($jsonResponse['hash'])) {
    echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect."]);
    exit;
}

$storedHash = $jsonResponse['hash'];

// Vérification avec password_verify()
if (password_verify($password, $storedHash)) {
    echo json_encode(["success" => true, "user" => ["email" => $email]]);
} else {
    echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect."]);
}
