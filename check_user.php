header('Content-Type: application/json');

$scriptURL = "https://script.google.com/macros/s/AKfycbwbq0A_fZWiMGSXbMw5--SP7EMDtwmo7Dwqu1Fnb4OlAzBGul7E9ExTvLtLbj3BD1BW/exec";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Email et mot de passe requis."]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

$postData = json_encode([
    "action" => "check",
    "email" => $email,
    "password" => $password
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

// 🔍 Vérifie si la réponse contient bien 'user'
$jsonResponse = json_decode($response, true);
if (!isset($jsonResponse['user'])) {
    echo json_encode(["success" => false, "message" => "Réponse invalide du serveur.", "debug" => $jsonResponse]);
    exit;
}

echo $response;
