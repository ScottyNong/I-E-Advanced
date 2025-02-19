<?php
header('Content-Type: application/json'); // Assurez-vous que la réponse est en JSON

// Récupérer les données envoyées via POST
$data = json_decode(file_get_contents("php://input"), true);

// Vérification des données
if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = $data['password'];

    // Vérifier si le fichier user.csv est accessible
    $csvData = array_map("str_getcsv", file("https://docs.google.com/uc?export=download&id=1U3BC9BZm7uqAnIkrITf0mqrAHvADApRa0gKGXRfMIDs"));
    if (!file_exists($file)) {
        echo json_encode(["error" => true, "message" => "Le fichier des utilisateurs est manquant."]);
        exit;
    }

    $userFound = false;
    $storedPassword = '';

    // Ouvrir le fichier user.csv en lecture
    if (($handle = fopen($file, "r")) !== FALSE) {
        while (($row = fgetcsv($handle)) !== FALSE) {
            list($storedEmail, $storedHashedPassword) = $row;
            if ($storedEmail === $email) {
                $userFound = true;
                $storedPassword = $storedHashedPassword;
                break;
            }
        }
        fclose($handle);
    }

    // Vérifier si l'utilisateur est trouvé et le mot de passe est correct
    if ($userFound && password_verify($password, $storedPassword)) {
        echo json_encode(["error" => false, "user" => ["email" => $email]]);
    } else {
        echo json_encode(["error" => true, "message" => "Email ou mot de passe incorrect."]);
    }
} else {
    echo json_encode(["error" => true, "message" => "Email et mot de passe manquants."]);
}
?>
